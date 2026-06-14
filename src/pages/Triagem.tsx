import { useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import { createTriagem, cleanText } from "../core/engine"
import type { Pet, Species } from "../types"
import { useSearchParams } from "react-router-dom"
import { ThumbsUp, ThumbsDown, Printer, Maximize } from "lucide-react"
import IconMDogFace from "react-fluentui-emoji/lib/modern/icons/IconMDogFace"
import IconMCatFace from "react-fluentui-emoji/lib/modern/icons/IconMCatFace"
import IconMBird from "react-fluentui-emoji/lib/modern/icons/IconMBird"
import IconMPawPrints from "react-fluentui-emoji/lib/modern/icons/IconMPawPrints"

const CAMPUSES = ["Mooca", "Vila Olímpia", "Paulista", "Piracicaba", "São José dos Campos"]

type Step = 1 | 2 | 3

export default function Triagem() {
  const [species, setSpecies] = useState<Species | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [tipoAtendimento, setTipoAtendimento] = useState("")
  const [fluxoAtendimento, setFluxoAtendimento] = useState("")
  const [ultimoPet, setUltimoPet] = useState<Pet | null>(null)
  const [autoResetSec, setAutoResetSec] = useState(15)
  const [searchParams] = useSearchParams()
  const urlCampus = searchParams.get("campus")
  const [manualCampus, setManualCampus] = useState("")
  const triagemCampus = (urlCampus && CAMPUSES.includes(urlCampus)) ? urlCampus : manualCampus
  const autoResetRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cancelAutoReset = useCallback(() => {
    if (autoResetRef.current) {
      clearInterval(autoResetRef.current)
      autoResetRef.current = null
    }
  }, [])

  const resetToSpecies = useCallback(() => {
    setSpecies(null)
    setCurrentStep(1)
    setTipoAtendimento("")
    setFluxoAtendimento("")
    setUltimoPet(null)
    cancelAutoReset()
    setAutoResetSec(15)
  }, [cancelAutoReset])

  const startAutoReset = useCallback(() => {
    cancelAutoReset()
    setAutoResetSec(15)
    autoResetRef.current = setInterval(() => {
      setAutoResetSec(prev => {
        if (prev <= 1) {
          resetToSpecies()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [cancelAutoReset, resetToSpecies])

  useEffect(() => {
    return () => cancelAutoReset()
  }, [cancelAutoReset])

  const enterFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    }
  }

  const selectSpecies = (s: Species) => {
    enterFullscreen()
    setSpecies(s)
    setCurrentStep(1)
  }

  const selectAttendance = (type: string) => {
    setTipoAtendimento(type)
    setTimeout(() => goToStep(2), 350)
  }

  const selectPatientSimplificado = async (opcao: string) => {
    const fluxo = opcao === "Sim" ? "Já é Paciente" : "Primeiro Atendimento"
    setFluxoAtendimento(fluxo)

    if (!species) return

    const pet = await createTriagem({
      especie: species,
      tipoAtendimento,
      prioridade: "Verde"
    }, triagemCampus)

    setUltimoPet(pet)
    goToStep(3)
    startAutoReset()
  }

  const goToStep = (step: Step) => {
    setCurrentStep(step)
  }

  const imprimirSenhaFisica = () => {
    if (!ultimoPet) return
    const printArea = document.createElement("div")
    printArea.id = "printTicketArea"
    printArea.innerHTML = `
      <div style="font-family: monospace; text-align: center; padding: 20px; color: black;">
        <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 8px; justify-content: center;"><span style="font-size: 28px;">🐾</span> HOVET</h2>
        <p style="margin: 4px 0; font-size: 0.8rem;">Hospital Veterinário Universitário</p>
        <hr style="border: 0; border-top: 1px dashed black; margin: 10px 0;">
        <h1 style="margin: 10px 0; font-size: 3rem; font-weight: bold; letter-spacing: -1px;">${ultimoPet.senha}</h1>
        <p style="margin: 6px 0; font-size: 0.95rem; font-weight: bold;">${ultimoPet.tipoAtendimento}</p>
        <p style="margin: 4px 0; font-size: 0.85rem;">Espécie: ${ultimoPet.especie}</p>
        <hr style="border: 0; border-top: 1px dashed black; margin: 10px 0;">
        <p style="margin: 4px 0; font-size: 0.75rem;">Aguarde ser chamado no painel.</p>
        <p style="margin: 4px 0; font-size: 0.7rem;">${new Date().toLocaleString("pt-BR")}</p>
      </div>
    `
    const style = document.createElement("style")
    style.id = "printTicketStyle"
    style.innerHTML = `@media print { body > * { display: none !important; } #printTicketArea { display: block !important; position: absolute; left: 0; top: 0; width: 100%; } }`
    document.body.appendChild(printArea)
    document.body.appendChild(style)
    window.print()
    setTimeout(() => {
      document.body.removeChild(printArea)
      document.body.removeChild(style)
    }, 500)
  }

  const speciesIcons: Record<Species, ReactNode> = {
    "Cão": <IconMDogFace size={80} />,
    "Gato": <IconMCatFace size={80} />,
    "Animais Silvestres": <IconMBird size={80} />
  }

  const stepOffset = `${(currentStep - 1) * 33.33333}%`

  if (!triagemCampus) {
    return (
      <div className="species-overlay" style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100
      }}>
        <div className="species-modal antigravity-card" style={{ width: "90%", maxWidth: 500, padding: 40, textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", color: "var(--color-primary)", marginBottom: 12, fontWeight: 700 }}>Selecione o Campus</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: "1.1rem" }}>Escolha o campus para atendimento:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CAMPUSES.map(c => (
              <button key={c} onClick={() => { setManualCampus(c) }} style={{
                padding: "16px 24px", borderRadius: 12, border: "2px solid #e5e7eb",
                background: "#fff", cursor: "pointer", fontSize: "1.1rem", fontWeight: 600,
                color: "#2d3a2d", transition: "all 0.2s"
              }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!species) {
    return (
      <div className="species-overlay" style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100
      }}>
        <div className="species-modal antigravity-card" style={{ width: "90%", maxWidth: 700, padding: 40, textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", color: "var(--color-primary)", marginBottom: 12, fontWeight: 700 }}>Bem-vindo ao HOVET</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 40, fontSize: "1.1rem" }}>Para iniciar o autoatendimento, selecione a espécie do seu pet:</p>
          <div className="species-options" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30 }}>
            {(["Cão", "Gato", "Animais Silvestres"] as Species[]).map(s => (
              <div key={s} className="species-card" onClick={() => selectSpecies(s)}
                style={{
                  padding: "40px 20px", cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 20, background: "rgba(255,255,255,0.6)",
                  borderRadius: "var(--border-radius-lg)", border: "1px solid rgba(255,255,255,0.6)",
                  transition: "var(--transition-smooth)"
                }}>
                <span style={{ fontSize: "5rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>{speciesIcons[s]}</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      padding: 20, minHeight: "100vh",
      background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
    }}>
      <main className="totem-container antigravity-card fade-in-up" style={{
        width: "100%", maxWidth: 800, minHeight: 600, overflow: "hidden",
        display: "flex", flexDirection: "column", position: "relative"
      }}>
        <div className="totem-header" style={{
          padding: "30px 40px 10px", display: "flex", justifyContent: "space-between",
          alignItems: "center", borderBottom: "1px solid rgba(15,118,110,0.05)"
        }}>
          <div className="totem-logo" style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <span><IconMPawPrints size={24} /> HOVET</span>
            <span style={{ fontWeight: 300, fontSize: "1.1rem", borderLeft: "1px solid rgba(15,118,110,0.2)", paddingLeft: 10 }}>Triagem</span>
            {triagemCampus && (
              <span style={{ fontSize: "0.75rem", background: "rgba(15,118,110,0.1)", padding: "2px 8px", borderRadius: 6, color: "var(--color-primary)" }}>
                {triagemCampus}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="step-indicator" style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3].map(s => (
                <div key={s} className="step-dot" style={{
                  width: currentStep === s ? 24 : 10, height: 10, borderRadius: currentStep === s ? "5px" : "50%",
                  background: currentStep === s ? "var(--color-accent)" : "var(--text-light)",
                  transition: "var(--transition-smooth)"
                }} />
              ))}
            </div>
            <button onClick={enterFullscreen} title="Tela Cheia" style={{
              background: "none", border: "1px solid rgba(15,118,110,0.2)", borderRadius: 6,
              cursor: "pointer", padding: "4px 8px", fontSize: "1rem", color: "var(--color-primary)"
            }}>
              <Maximize size={18} />
            </button>
          </div>
        </div>

        <div className="pet-badge-avatar" style={{
          position: "absolute", right: 40, top: 30, fontSize: "2.5rem", opacity: 0.2
        }}>
          {speciesIcons[species]}
        </div>

        <div className="stepper-viewport" style={{ flex: 1, overflow: "hidden", position: "relative", padding: "20px 0" }}>
          <div className="stepper-track" style={{
            display: "flex", width: "300%", height: "100%",
            transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
            transform: `translateX(-${stepOffset})`
          }}>
            {/* Step 1 */}
            <section className="step-panel" style={{ width: "33.333%", flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", padding: "0 40px", boxSizing: "border-box" }}>
              <div className="info-header" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", fontWeight: 700 }}>Tipo de Atendimento</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Selecione a modalidade de atendimento necessária para o paciente:</p>
              </div>
              <div className="attendance-options" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, marginTop: 10, flex: 1, alignContent: "center" }}>
                {[
                  { type: "Pronto Atendimento", icon: "M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z", title: "Pronto Atendimento", badge: "Consulta não Agendada", desc: "Urgências, emergências ou consultas gerais imediatas." },
                  { type: "Consulta Marcada", icon: "M19,19H5V8H16M16,1H18V3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H6V1H8V3H16M11,9.5H13V12.5H16V14.5H13V17.5H11V14.5H8V12.5H11V9.5Z", title: "Consulta Agendada", desc: "Consultas previamente marcadas com médicos veterinários especialistas." },
                  { type: "Cirurgia Agendada", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z", title: "Cirurgia Agendada", desc: "Procedimentos cirúrgicos agendados na unidade." },
                  { type: "Exames", icon: "M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75M19 19H5V5h2v2h10V5h2v14z", title: "Exames", desc: "Realização de exames laboratoriais ou de imagem agendados." }
                ].map(({ type, icon, title, badge, desc }) => (
                  <div key={type} className="attendance-card" onClick={() => selectAttendance(type)}
                    style={{
                      padding: "32px 20px", borderRadius: "var(--border-radius-md)",
                      background: tipoAtendimento === type ? "#fff" : "rgba(255,255,255,0.4)",
                      border: `1px solid ${tipoAtendimento === type ? "rgba(15,118,110,0.2)" : "rgba(255,255,255,0.4)"}`,
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", textAlign: "center", gap: 16,
                      transition: "var(--transition-smooth)"
                    }}>
                    <svg viewBox="0 0 24 24" style={{ width: 50, height: 50, fill: tipoAtendimento === type ? "var(--color-accent)" : "var(--color-primary)" }}>
                      <path d={icon} />
                    </svg>
                    <h3 style={{ fontSize: "1.25rem", color: "var(--text-main)", fontWeight: 700 }}>{title}</h3>
                    {badge && <p style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700, marginBottom: -5 }}>{badge}</p>}
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{desc}</p>
                  </div>
                ))}
              </div>
              <div className="form-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 20 }}>
                <button className="btn-magnetic btn-secondary" onClick={resetToSpecies}>Voltar</button>
              </div>
            </section>

            {/* Step 2 */}
            <section className="step-panel" style={{ width: "33.333%", flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", padding: "0 40px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", height: "100%", width: "100%" }}>
                <div className="info-header" style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", fontWeight: 700 }}>Identificação</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Você já é paciente no HOVET?</p>
                </div>
                <div className="attendance-options" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, marginTop: 10, marginBottom: 20, flex: 1, alignContent: "center" }}>
                  <div className="attendance-card" onClick={() => selectPatientSimplificado("Sim")}
                    style={{ padding: "32px 20px", borderRadius: "var(--border-radius-md)", background: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: "4.5rem", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><ThumbsUp size={64} /></div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Sim</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Já possuo cadastro e registro no hospital.</p>
                  </div>
                  <div className="attendance-card" onClick={() => selectPatientSimplificado("Não")}
                    style={{ padding: "32px 20px", borderRadius: "var(--border-radius-md)", background: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: "4.5rem", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><ThumbsDown size={64} /></div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Não</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>É a primeira vez do meu pet no hospital.</p>
                  </div>
                </div>
                <div className="form-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20 }}>
                  <button className="btn-magnetic btn-secondary" onClick={() => goToStep(1)}>Voltar</button>
                </div>
              </div>
            </section>

            {/* Step 3: Final */}
            <section className="step-panel" style={{ width: "33.333%", flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", padding: "0 40px", boxSizing: "border-box" }}>
              <div className="info-header" style={{ textAlign: "center", marginBottom: 5 }}>
                <h2 style={{ fontSize: "1.7rem", color: "var(--color-primary)", fontWeight: 700 }}>Senha Emitida com Sucesso!</h2>
                <p style={{ fontSize: "0.9rem" }}>Por favor, retire a sua senha impressa e aguarde chamada no painel.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, margin: "auto", padding: 10, textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, fill: "#10b981" }}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>

                <div style={{
                  fontSize: "4.8rem", fontWeight: 900, color: "var(--color-primary)",
                  letterSpacing: -2, lineHeight: 1,
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                  {ultimoPet?.senha || "---"}
                </div>

                <div style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.4 }}>
                  Atendimento: <strong style={{ color: "var(--text-main)" }}>{ultimoPet?.tipoAtendimento || "—"}</strong><br />
                  Espécie: <strong style={{ color: "var(--text-main)" }}>{ultimoPet?.especie || "—"}</strong>
                </div>
                <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 5 }}>
                  Gerado em: <strong style={{ color: "var(--text-main)" }}>{ultimoPet ? new Date(ultimoPet.dataHora).toLocaleString("pt-BR") : "—"}</strong>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300, margin: "0 auto" }}>
                <button className="btn-magnetic" onClick={imprimirSenhaFisica}
                  style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)", color: "white", border: "none", fontSize: "1rem", padding: "14px 20px", fontWeight: 700, borderRadius: "var(--border-radius-sm)", cursor: "pointer", width: "100%" }}>
                  <Printer size={20} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} /> Imprimir Senha
                </button>
                <button className="btn-magnetic btn-secondary" onClick={resetToSpecies}
                  style={{ border: "1.5px dashed rgba(15,118,110,0.3)", fontSize: "0.85rem", width: "100%", padding: 12 }}>
                  Concluir ({autoResetSec}s)
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
