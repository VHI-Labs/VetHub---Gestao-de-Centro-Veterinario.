import { useState } from "react"
import Topbar from "../components/Topbar"
import VideoManager from "../components/VideoManager"
import PetListRow from "../components/PetListRow"
import { Search, Check, X } from "lucide-react"
import { FileText } from "lucide-react"
import { searchPatients, linkPetToPatient } from "../core/ehr"
import type { Patient } from "../types"
import IconMMegaphone from "react-fluentui-emoji/lib/modern/icons/IconMMegaphone"
import IconMPawPrints from "react-fluentui-emoji/lib/modern/icons/IconMPawPrints"
import IconMBird from "react-fluentui-emoji/lib/modern/icons/IconMBird"
import IconMDogFace from "react-fluentui-emoji/lib/modern/icons/IconMDogFace"
import IconMCatFace from "react-fluentui-emoji/lib/modern/icons/IconMCatFace"
import { useQueueStore } from "../store/queueStore"
import { getNextWaitingPet, updatePetStatus } from "../core/engine"
import type { Pet, Species } from "../types"
import CalledQueueSidebar from "../components/CalledQueueSidebar"
import MonthlyReport from "../components/MonthlyReport"

type Tab = 1 | 3 | 4

export default function ProntoAtendimento() {
  const { dogs, cats, wild, history, loading } = useQueueStore()
  const [currentTab, setCurrentTab] = useState<Tab>(1)
  const [showReport, setShowReport] = useState(false)

  const allPets = [...dogs, ...cats, ...wild].sort(
    (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
  )

  const prontos = allPets.filter(pet => pet.senha?.startsWith("N") && pet.status === "Aguardando direcionamento")

  const allItems: Pet[] = [...history, ...dogs, ...cats, ...wild]

  const total = allItems.length
  const dogsCount = allItems.filter(i => i.especie === "Cão").length
  const catsCount = allItems.filter(i => i.especie === "Gato").length
  const wildCount = allItems.filter(i => i.especie === "Animais Silvestres").length

  const calcMedia = (especie: string) => {
    const lista = allItems.filter(i => i.especie === especie && i.calledAt)
    if (lista.length === 0) return 0
    const totalMs = lista.reduce((acc, i) => acc + (new Date(i.calledAt!).getTime() - new Date(i.dataHora).getTime()), 0)
    return Math.round(totalMs / lista.length / 60000)
  }
  const mediaCaes = calcMedia("Cão")
  const mediaGatos = calcMedia("Gato")
  const mediaSilvestres = calcMedia("Animais Silvestres")

  const [calling, setCalling] = useState(false)
  const [linkTarget, setLinkTarget] = useState<Pet | null>(null)
  const [linkQuery, setLinkQuery] = useState("")
  const [linkResults, setLinkResults] = useState<Patient[]>([])

  const handleLinkSearch = async (q: string) => {
    setLinkQuery(q)
    if (q.trim().length < 2) { setLinkResults([]); return }
    const results = await searchPatients(q, linkTarget?.unidade || '')
    setLinkResults(results)
  }

  const handleLinkPatient = async (patientId: string) => {
    if (!linkTarget) return
    await linkPetToPatient(linkTarget.id, patientId)
    setLinkTarget(null)
    setLinkQuery("")
    setLinkResults([])
    await useQueueStore.getState().refresh()
  }

  const callNext = () => {
    if (calling) return
    const next = getNextWaitingPet(prontos)
    if (!next) return
    setCalling(true)
    setTimeout(async () => {
      await updatePetStatus(next.id, next.especie as Species, "Chamado", "PRONTO ATENDIMENTO")
      await useQueueStore.getState().refresh()
      setCalling(false)
    }, 3000)
  }

const tabs = [
    { label: "Fila de Pacientes", onClick: () => setCurrentTab(1), active: currentTab === 1 },
    { label: "Visão Geral (Dashboard)", onClick: () => setCurrentTab(3), active: currentTab === 3 },
    { label: "Vídeos", onClick: () => setCurrentTab(4), active: currentTab === 4 },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "url(/cmv_tv.png)",
        backgroundSize: "cover", backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 0.015, pointerEvents: "none"
      }} />
      <Topbar title="Pronto Atendimento" tabs={tabs} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <main style={{ flex: 1, padding: "30px 40px", overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", top: 30, left: 40, right: 40, bottom: 30,
          opacity: currentTab === 1 ? 1 : 0, visibility: currentTab === 1 ? "visible" : "hidden",
          transform: currentTab === 1 ? "translateY(0)" : "translateY(15px)",
          transition: "opacity 0.4s ease, transform 0.4s ease, visibility 0.4s",
          display: "flex", flexDirection: "column"
        }}>
          <button
              onClick={callNext}
              disabled={prontos.length === 0 || calling}
              className="btn-magnetic"
              style={{ marginBottom: 12, alignSelf: "flex-start", padding: "10px 24px", fontSize: "0.9rem" }}
            >
              <IconMMegaphone size={18} style={{ marginRight: 6 }} /> Chamar Próximo
            </button>
          <div className="queue-layout" style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", flex: 1, paddingBottom: 20 }}>
            {loading ? (
              <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)", fontSize: "1.1rem" }}>
                Carregando fila de pacientes...
              </div>
            ) : prontos.length === 0 ? (
              <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)", fontSize: "1.1rem" }}>
                <IconMPawPrints size={24} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} /> Não há pacientes de Pronto Atendimento na fila aguardando no momento.
              </div>
            ) : (
              prontos.map(pet => (
                <div key={pet.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PetListRow
                    pet={pet}
                    showCall={true}
                    showDirection={false}
                    showFinish={false}
                    callLabel="PRONTO ATENDIMENTO"
                  />
                  {!pet.patientId && (
                    <button onClick={() => setLinkTarget(pet)}
                      style={{
                        padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(15,118,110,0.2)",
                        background: "rgba(15,118,110,0.05)", cursor: "pointer", whiteSpace: "nowrap",
                        display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", fontWeight: 600,
                        color: "var(--color-primary)", flexShrink: 0
                      }}>
                      <Search size={13} /> Vincular
                    </button>
                  )}
                  {pet.patientId && (
                    <span style={{
                      fontSize: "0.72rem", padding: "3px 8px", borderRadius: 6,
                      background: "rgba(16,185,129,0.1)", color: "#059669", fontWeight: 600, whiteSpace: "nowrap"
                    }}>
                      ✓ Vinculado
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{
          position: "absolute", top: 30, left: 40, right: 40, bottom: 30,
          opacity: currentTab === 3 ? 1 : 0, visibility: currentTab === 3 ? "visible" : "hidden",
          transform: currentTab === 3 ? "translateY(0)" : "translateY(15px)",
          transition: "opacity 0.4s ease, transform 0.4s ease, visibility 0.4s",
          display: "flex", flexDirection: "column", overflow: "auto"
        }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button onClick={() => setShowReport(true)} style={{
              padding: "10px 20px", borderRadius: 100, border: "none",
              background: "#2d3a2d", color: "#fff", cursor: "pointer",
              fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6
            }}>
              <FileText size={16} /> Relatório
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 30 }}>
            <div className="antigravity-card" style={{ padding: 22, borderLeft: "5px solid var(--color-primary)", background: "linear-gradient(135deg, rgba(15,118,110,0.08), transparent)" }}>
              <div style={{ fontSize: "2rem", marginBottom: 4, display: "flex", alignItems: "center" }}><IconMPawPrints size={32} /></div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Total</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)", marginTop: 2 }}>{total}</div>
            </div>
            <div className="antigravity-card" style={{ padding: 22, borderLeft: "5px solid #3b82f6", background: "linear-gradient(135deg, rgba(59,130,246,0.08), transparent)" }}>
              <div style={{ fontSize: "2rem", marginBottom: 4, display: "flex", alignItems: "center" }}><IconMDogFace size={32} /></div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Cães</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#3b82f6", marginTop: 2 }}>{dogsCount}</div>
            </div>
            <div className="antigravity-card" style={{ padding: 22, borderLeft: "5px solid #ec4899", background: "linear-gradient(135deg, rgba(236,72,153,0.08), transparent)" }}>
              <div style={{ fontSize: "2rem", marginBottom: 4, display: "flex", alignItems: "center" }}><IconMCatFace size={32} /></div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Gatos</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#ec4899", marginTop: 2 }}>{catsCount}</div>
            </div>
            <div className="antigravity-card" style={{ padding: 22, borderLeft: "5px solid #10b981", background: "linear-gradient(135deg, rgba(16,185,129,0.08), transparent)" }}>
              <div style={{ fontSize: "2rem", marginBottom: 4, display: "flex", alignItems: "center" }}><IconMBird size={32} /></div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Silvestres</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", marginTop: 2 }}>{wildCount}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 30 }}>
            <div className="antigravity-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, borderLeft: "5px solid #3b82f6" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconMDogFace size={24} color="#3b82f6" /></div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Espera média • Cães</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#3b82f6", marginTop: 2 }}>{mediaCaes} min</div>
              </div>
            </div>
            <div className="antigravity-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, borderLeft: "5px solid #ec4899" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(236,72,153,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconMCatFace size={24} color="#ec4899" /></div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Espera média • Gatos</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ec4899", marginTop: 2 }}>{mediaGatos} min</div>
              </div>
            </div>
            <div className="antigravity-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, borderLeft: "5px solid #10b981" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconMBird size={24} color="#10b981" /></div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Espera média • Silvestres</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981", marginTop: 2 }}>{mediaSilvestres} min</div>
              </div>
            </div>
          </div>

        </div>

        <div style={{
          position: "absolute", top: 30, left: 40, right: 40, bottom: 30,
          opacity: currentTab === 4 ? 1 : 0, visibility: currentTab === 4 ? "visible" : "hidden",
          transform: currentTab === 4 ? "translateY(0)" : "translateY(15px)",
          transition: "opacity 0.4s ease, transform 0.4s ease, visibility 0.4s",
          display: "flex", flexDirection: "column", overflow: "auto"
        }}>
          <VideoManager />
        </div>
        </main>
        <CalledQueueSidebar senhaPrefix="N" />
      </div>
      {showReport && <MonthlyReport onClose={() => setShowReport(false)} />}

      {linkTarget && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div className="antigravity-card" style={{ width: "100%", maxWidth: 500, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>Vincular Paciente</h3>
              <button onClick={() => { setLinkTarget(null); setLinkQuery(""); setLinkResults([]) }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 16 }}>
              Busque pelo paciente para vincular ao pet <strong>{linkTarget.senha}</strong>:
            </p>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input autoFocus type="text" value={linkQuery} onChange={e => handleLinkSearch(e.target.value)}
                placeholder="Nome ou microchip..."
                style={{
                  width: "100%", padding: "12px 12px 12px 42px", borderRadius: 10,
                  border: "2px solid rgba(15,118,110,0.15)", fontSize: "1rem",
                  outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
              {linkQuery.trim().length >= 2 && linkResults.length === 0 && (
                <div style={{ textAlign: "center", padding: 16, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Nenhum paciente encontrado.
                </div>
              )}
              {linkResults.map(p => {
                const petEmoji = p.especie === "Cão" ? "🐕" : p.especie === "Gato" ? "🐈" : "🦜"
                return (
                  <div key={p.id} onClick={() => handleLinkPatient(p.id)}
                    style={{
                      padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                      background: "rgba(255,255,255,0.5)", border: "1px solid rgba(15,118,110,0.06)",
                      display: "flex", alignItems: "center", gap: 12
                    }}>
                    <span style={{ fontSize: "1.5rem" }}>{petEmoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{p.nome}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {p.especie}{p.raca ? ` • ${p.raca}` : ""}{p.idade ? ` • ${p.idade}` : ""}
                      </div>
                    </div>
                    <Check size={18} style={{ color: "var(--color-accent)" }} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
