import { useState, useEffect } from "react"
import { getTvVideos, addTvVideo, removeTvVideo, extractYoutubeId, buildYoutubeEmbedUrl } from "../core/engine"
import type { TvVideo } from "../types"

export default function VideoManager() {
  const [videos, setVideos] = useState<TvVideo[]>([])
  const [inputUrl, setInputUrl] = useState("")
  const [status, setStatus] = useState("")
  const [adding, setAdding] = useState(false)

  const loadVideos = async () => {
    const list = await getTvVideos()
    setVideos(list)
    if (list.length === 0) setStatus("Nenhum vídeo na playlist. Adicione um link do YouTube.")
  }

  useEffect(() => { loadVideos() }, [])

  const handleAdd = async () => {
    const trimmed = inputUrl.trim()
    if (!trimmed) return
    const id = extractYoutubeId(trimmed)
    if (!id) {
      setStatus("Link do YouTube inválido.")
      return
    }
    setAdding(true)
    const result = await addTvVideo(trimmed)
    setAdding(false)
    if (result) {
      setInputUrl("")
      setStatus("Vídeo adicionado à playlist!")
      await loadVideos()
    } else {
      setStatus("Erro ao salvar vídeo.")
    }
  }

  const handleRemove = async (videoId: string) => {
    await removeTvVideo(videoId)
    await loadVideos()
  }

  const videoId = (url: string) => extractYoutubeId(url)

  return (
    <section className="video-manager antigravity-card">
      <div>
        <h2 style={{ color: "var(--color-primary)", fontSize: "1.4rem", marginBottom: 6 }}>Playlist de Vídeos</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Adicione vídeos do YouTube para reproduzir em loop nos painéis de TV.
        </p>
      </div>

      <div className="video-upload-box" style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <input
          type="text"
          className="input-antigravity"
          placeholder="https://www.youtube.com/watch?v=..."
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleAdd() }}
          style={{ flex: 1, padding: "12px 16px" }}
        />
        <button className="btn-magnetic" onClick={handleAdd} disabled={adding}
          style={{ padding: "10px 24px", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
          {adding ? "Adicionando..." : "+ Adicionar"}
        </button>
      </div>

      {status && <div className="video-meta" style={{ marginBottom: 16 }}>{status}</div>}

      {videos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {videos.map((video, idx) => {
            const vid = videoId(video.youtubeUrl)
            return (
              <div key={video.id} className="antigravity-card" style={{
                display: "flex", gap: 16, padding: 12, alignItems: "center",
                border: "1px solid rgba(15,118,110,0.1)"
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(15,118,110,0.1)", color: "var(--color-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "0.9rem", flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                {vid ? (
                  <div style={{
                    width: 160, aspectRatio: "16/9", borderRadius: 8,
                    overflow: "hidden", background: "#020617", flexShrink: 0
                  }}>
                    <img
                      src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div style={{ width: 160, height: 90, borderRadius: 8, background: "rgba(0,0,0,0.05)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Inválido
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {video.youtubeUrl}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {vid ? `youtube.com/watch?v=${vid}` : "URL inválida"}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(video.id)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", border: "none",
                    background: "rgba(239,68,68,0.1)", color: "#ef4444",
                    cursor: "pointer", fontSize: "1.1rem", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0
                  }}
                  title="Remover"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
