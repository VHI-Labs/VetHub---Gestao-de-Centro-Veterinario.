import { useEffect, useState, useRef, useCallback, type ReactNode } from "react"
import { useQueueStore } from "../store/queueStore"
import { useStorageSync } from "../hooks/useStorageSync"
import { getTvVideos, extractYoutubeId, buildYoutubeEmbedUrl, CALL_DISPLAY_MS } from "../core/engine"
import { anunciarPaciente, primeAudioSystem, initAutomaticAudioSystem } from "../core/audio"
import type { Pet, CallHistoryItem, TvVideo } from "../types"
import { PawPrint, Volume2 } from "lucide-react"

const PLAYLIST_INTERVAL_MS = 30000

interface TvPanelLayoutProps {
  activeCall: Pet | null
  history: CallHistoryItem[]
  title: string
  icon: ReactNode
}

export default function TvPanelLayout({ activeCall, history, title, icon }: TvPanelLayoutProps) {
  useStorageSync()
  const store = useQueueStore()
  const [videos, setVideos] = useState<TvVideo[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const lastTokenRef = useRef("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playlistTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeCallTokenRef = useRef("")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const youtubeEmbedUrl = videos.length > 0 ? buildYoutubeEmbedUrl(extractYoutubeId(videos[currentIndex].youtubeUrl) || '') : ""

  useEffect(() => {
    initAutomaticAudioSystem()
    checkAudioStatus()
    loadVideos()
  }, [])

  const loadVideos = async () => {
    const list = await getTvVideos()
    setVideos(list)
    if (currentIndex >= list.length) setCurrentIndex(0)
  }

  const handleStorage = useCallback(() => {
    loadVideos()
    useQueueStore.getState().refresh()
  }, [])

  useEffect(() => {
    window.addEventListener("storage", handleStorage)
    window.addEventListener("storage-sync", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("storage-sync", handleStorage)
    }
  }, [handleStorage])

  const call = activeCall
  const callStartedAt = call?.calledAt ? new Date(call.calledAt).getTime() : Date.now()
  const callElapsed = call ? Date.now() - callStartedAt : 0
  const shouldShowCall = call && callElapsed < CALL_DISPLAY_MS
  const callToken = call ? `${call.id}-${call.calledAt || ""}` : ""

  useEffect(() => {
    if (videos.length < 2 || shouldShowCall) {
      if (playlistTimerRef.current) {
        clearInterval(playlistTimerRef.current)
        playlistTimerRef.current = null
      }
      return
    }
    playlistTimerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % videos.length)
    }, PLAYLIST_INTERVAL_MS)
    return () => {
      if (playlistTimerRef.current) clearInterval(playlistTimerRef.current)
    }
  }, [videos.length, shouldShowCall])

  useEffect(() => {
    if (shouldShowCall && callToken !== lastTokenRef.current) {
      lastTokenRef.current = callToken
      if (audioUnlocked) {
        anunciarPaciente(
          { senha: call?.senha, localDirecionado: call?.localDirecionado },
          { senha: "", local: call?.localDirecionado || "Triagem" }
        )
      }
    }
  }, [shouldShowCall, callToken, call, audioUnlocked])

  useEffect(() => {
    if (shouldShowCall && callToken !== activeCallTokenRef.current) {
      activeCallTokenRef.current = callToken
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        activeCallTokenRef.current = ""
        useQueueStore.getState().refresh()
      }, Math.max(0, CALL_DISPLAY_MS - callElapsed))
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [shouldShowCall, callToken, callElapsed])

  const recentCalls = history.slice(0, 6)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    if (shouldShowCall) {
      iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
    } else {
      iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
    }
  }, [shouldShowCall])

  const checkAudioStatus = () => {
    try {
      const testCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      if (testCtx.state === "suspended") {
        setShowBanner(true)
      } else {
        setAudioUnlocked(true)
        setShowBanner(false)
        testCtx.close()
      }
    } catch {
      setShowBanner(true)
    }
  }

  const unlockAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    primeAudioSystem()
    try {
      const tempCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      if (tempCtx.state === "suspended") tempCtx.resume()
      tempCtx.close()
    } catch { /* ignore */ }
    setAudioUnlocked(true)
    setShowBanner(false)
  }

  useEffect(() => {
    const handler = () => { if (!audioUnlocked) unlockAudio() }
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [audioUnlocked])

  const slots = Array.from({ length: 3 }, (_, i) => history[i] || null)

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "7fr 4fr", height: "100vh",
      backgroundImage: "url(/cmv_tv.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "#f8fafc", overflow: "hidden", padding: "20px", gap: "20px", position: "relative"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,6,23,0.55)", zIndex: 0 }} />
      <div className="tv-noise-overlay" />

      <main className="active-call-section" style={{
        display: "flex", flexDirection: "column", height: "100%",
        gap: 16, position: "relative", zIndex: 1, minHeight: 0
      }}>
        <div className="tv-brand" style={{
          fontSize: "1.1rem", fontWeight: 800, color: "var(--color-accent)",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{icon} HOVET {title.toUpperCase()}</span>
          <span style={{
            fontWeight: 300, fontSize: "0.9rem",
            borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: 10
          }}>
            Painel de Chamadas
          </span>
        </div>

        <div id="megaCardContainer" style={{
          flex: 1, display: "flex", justifyContent: "center", position: "relative", minHeight: 0
        }}>
          {shouldShowCall ? (
            <div key={callToken} className="tv-mega-card active-call" style={{
              width: "100%", maxWidth: 700,
              background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.98) 100%)",
              color: "#fff", borderRadius: "var(--border-radius-lg)", padding: "32px 24px",
              textAlign: "center", border: "2px solid rgba(0,178,142,0.45)",
              position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center"
            }}>
              <div style={{
                position: "absolute", inset: 0, opacity: 0.05,
                background: "linear-gradient(135deg, transparent 0%, rgba(0,178,142,0.3) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "tv-shimmer 4s ease-in-out infinite"
              }} />
              <div className="tv-label-display" style={{
                fontSize: "1.4rem", fontWeight: 800, color: "var(--color-accent-light)",
                letterSpacing: 4, marginBottom: 16
              }}>
                SENHA CHAMADA
              </div>
              <div className="tv-senha-display" style={{
                fontSize: "6rem", fontWeight: 900, color: "#fff",
                marginBottom: 8, lineHeight: 1, textShadow: "0 0 40px rgba(0,178,142,0.3)"
              }}>
                {call?.senha}
              </div>
              <div className="tv-label-display" style={{
                fontSize: "1.8rem", fontWeight: 800, color: "#fff",
                textTransform: "uppercase", letterSpacing: 1, marginTop: 10
              }}>
                {call?.localDirecionado || "PRONTO ATENDIMENTO"}
              </div>
            </div>
          ) : youtubeEmbedUrl ? (
            <div className="tv-mega-card" style={{
              width: "100%", maxWidth: 700, alignSelf: "stretch",
              borderRadius: "var(--border-radius-lg)", overflow: "hidden",
              background: "#020617"
            }}>
              <iframe
                ref={iframeRef}
                src={youtubeEmbedUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                allow="autoplay; encrypted-media"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation"
                title="YouTube TV"
              />
            </div>
          ) : (
            <div className="tv-mega-card" style={{
              width: "100%", maxWidth: 700,
              background: "rgba(255,255,255,0.03)", color: "#fff",
              borderRadius: "var(--border-radius-lg)",
              textAlign: "center",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center"
            }}>
              <div className="tv-no-call-paw" style={{ fontSize: "3rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PawPrint size={48} />
              </div>
              <div style={{
                fontSize: "1.1rem", fontWeight: 700, marginTop: 10,
                animation: "tv-label-fade 0.6s ease both 0.2s"
              }}>
                Aguardando chamada veterinária
              </div>
              <div style={{
                fontSize: "0.8rem", color: "var(--text-light)", marginTop: 6,
                animation: "tv-label-fade 0.6s ease both 0.4s"
              }}>
                As senhas aparecerão aqui automaticamente.
              </div>
            </div>
          )}
        </div>

        <div className="tv-history-bar" style={{
          width: "100%", maxWidth: 700, alignSelf: "center",
          display: "flex", flexDirection: "column", gap: 10,
          padding: "14px 18px", borderRadius: "var(--border-radius-md)",
          background: "rgba(15,23,42,0.9)",
          border: "2px solid rgba(52,211,153,0.28)", color: "#fff",
          backdropFilter: "blur(12px)", flexShrink: 0
        }}>
          <div style={{
            fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase",
            letterSpacing: "0.04em", color: "var(--color-accent-light)", textAlign: "center"
          }}>
            Últimas chamadas
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%"
          }}>
            {slots.map((item, i) => (
              <div key={i} className="tv-history-item" style={{
                padding: "10px 14px", borderRadius: 12,
                background: "rgba(15,23,42,0.85)", fontWeight: 800,
                border: `2px solid ${item ? "rgba(0,178,142,0.35)" : "rgba(255,255,255,0.1)"}`,
                display: "flex", flexDirection: "column", justifyContent: "center",
                alignItems: "center", gap: 2, opacity: item ? 1 : 0.35
              }}>
                {item ? (
                  <>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                      {item.senha}
                    </div>
                    <div style={{
                      fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.7)",
                      textTransform: "uppercase", letterSpacing: "0.5px"
                    }}>
                      {item.localDirecionado}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "rgba(255,255,255,0.15)" }}>
                    ---
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <section className="queue-section" style={{
        background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "var(--border-radius-lg)", padding: "20px 20px",
        display: "flex", flexDirection: "column", height: "100%",
        position: "relative", zIndex: 1, minHeight: 0
      }}>
        <div style={{
          fontSize: "1.1rem", fontWeight: 800, color: "#fff", marginBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0
        }}>
          <span>Últimas Chamadas</span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-accent-light)", fontWeight: 500 }}>
            {recentCalls.length} chamada(s)
          </span>
        </div>

        <div style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 8, minHeight: 0
        }}>
          {recentCalls.length === 0 ? (
            <div style={{
              padding: 20, textAlign: "center", color: "var(--text-light)", fontSize: "0.85rem"
            }}>
              Nenhuma chamada recente.
            </div>
          ) : recentCalls.map((item, idx) => (
            <div key={item.id} className="tv-queue-item" style={{
              background: idx === 0 ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.06)",
              borderRadius: "var(--border-radius-md)",
              padding: "10px 14px",
              border: idx === 0 ? "1.5px solid rgba(16,185,129,0.4)" : "1.5px solid rgba(255,255,255,0.08)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center"
            }}>
              {idx === 0 && (
                <div style={{
                  fontSize: "0.55rem", fontWeight: 700, color: "var(--color-accent-light)",
                  textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4
                }}>
                  ÚLTIMA
                </div>
              )}
              <div style={{
                fontSize: "1.6rem", fontWeight: 800, color: "#fff", lineHeight: 1.1
              }}>
                {item.senha}
              </div>
              <div style={{
                fontSize: "0.8rem", fontWeight: 700,
                color: "rgba(255,255,255,0.7)", marginTop: 4,
                textTransform: "uppercase", letterSpacing: 1
              }}>
                {item.localDirecionado || "PRONTO ATENDIMENTO"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {showBanner && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)",
          border: "2px solid var(--color-accent)", borderRadius: "var(--border-radius-md)",
          padding: "16px 28px", display: "flex", alignItems: "center", gap: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)", width: "min(650px, 90%)"
        }}>
          <div style={{ fontSize: "2rem", flexShrink: 0, display: "flex", alignItems: "center" }}><Volume2 size={32} /></div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
              Som Desativado pelo Navegador
            </h4>
            <p style={{ margin: "3px 0 0 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
              Para ouvir as chamadas de voz e sonoras das senhas, clique no botão ao lado ou em qualquer parte da tela.
            </p>
          </div>
          <button onClick={unlockAudio} style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
            border: "none", color: "#fff", padding: "10px 20px", fontWeight: 700,
            borderRadius: 100, cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: "0 4px 15px rgba(0,178,142,0.3)", flexShrink: 0
          }}>
            Ativar Som
          </button>
        </div>
      )}


    </div>
  )
}
