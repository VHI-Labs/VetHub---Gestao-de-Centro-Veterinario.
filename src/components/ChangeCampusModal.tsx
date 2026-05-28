import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { Lock, TreeDeciduous } from "lucide-react"

const CAMPUSES = ["Mooca", "Vila Olímpia", "Paulista", "Piracicaba", "São José dos Campos"]

interface ChangeCampusModalProps {
  onClose: () => void
}

function campusImgUrl(campus: string): string | null {
  switch (campus) {
    case "Mooca": return "/mooca.svg"
    case "Paulista": return "/paulista.png"
    case "Piracicaba": return "/piracicaba.svg"
    case "São José dos Campos": return "/sjc.svg"
    default: return null
  }
}

function campusSvg(campus: string): boolean {
  return campus === "Mooca" || campus === "Paulista" || campus === "Piracicaba" || campus === "São José dos Campos"
}

export default function ChangeCampusModal({ onClose }: ChangeCampusModalProps) {
  const { user, unidade, role, signOut, refreshProfile } = useAuth()
  const [selected, setSelected] = useState("")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState<"select" | "confirm">("select")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const canAccessAll = role === "admin" || role === "coordinator"
  const visibleCampuses = canAccessAll ? CAMPUSES : (unidade ? [unidade] : [])

  const handleSelect = (campus: string) => {
    if (campus === unidade || !canAccessAll) return
    setSelected(campus)
    setStep("confirm")
    setError("")
    setPassword("")
  }

  const handleConfirm = async () => {
    if (!selected || !password || saving || !user) return
    setSaving(true)
    setError("")

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password
    })

    if (verifyError) {
      setError("Senha incorreta. Tente novamente.")
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ unidade: selected, atualizado_em: new Date().toISOString() })
      .eq("id", user.id)

    setSaving(false)

    if (updateError) {
      setError("Erro ao salvar. Tente novamente.")
      return
    }

    await refreshProfile()
    onClose()
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20
    }}>
      <div className="antigravity-card" style={{
        width: "100%", maxWidth: canAccessAll ? 580 : 400, padding: 32, borderRadius: 16
      }}>
        {step === "select" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2d3a2d", marginBottom: 4 }}>Mudar Campus</h2>
              <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                Campus atual: <strong>{unidade || "Nenhum"}</strong>
              </p>
              {user && (
                <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 8 }}>
                  {user.email} • <button onClick={signOut} style={{ background: "none", border: "none", color: "#6b8e6b", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "0.8rem" }}>sair</button>
                </div>
              )}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: canAccessAll ? "repeat(auto-fill, minmax(150px, 1fr))" : "1fr",
              gap: canAccessAll ? "32px 12px" : "0",
              marginBottom: 20
            }}>
              {visibleCampuses.map(campus => {
                const isCurrent = campus === unidade
                if (!canAccessAll) {
                  return (
                    <div key={campus} style={{
                      textAlign: "center", padding: "24px 16px"
                    }}>
                      {campusSvg(campus) ? (
                        <img
                          src={campusImgUrl(campus)!}
                          alt={campus}
                          style={{
                            width: campus === "Paulista" ? 140 : 180,
                            height: "auto",
                            marginTop: campus === "Paulista" ? -28 : -32,
                            marginBottom: 8,
                            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))",
                            pointerEvents: "none"
                          }}
                        />
                      ) : (
                          <span style={{ fontSize: "3rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}><TreeDeciduous size={48} /></span>
                      )}
                      <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#2d3a2d" }}>{campus}</div>
                    </div>
                  )
                }
                return (
                  <button
                    key={campus}
                    onClick={() => handleSelect(campus)}
                    disabled={isCurrent}
                    style={{
                      padding: campusSvg(campus) ? "0 8px 14px" : "14px 8px",
                      paddingTop: campusSvg(campus) ? 0 : 14,
                      borderRadius: 14,
                      border: isCurrent ? "2px solid #6b8e6b" : "2px solid #e5e7eb",
                      background: isCurrent ? "rgba(107,142,107,0.08)" : "#fff",
                      cursor: isCurrent ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      fontSize: "0.9rem",
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? "#2d3a2d" : "#6b7280",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: campusSvg(campus) ? 0 : 6,
                      overflow: "visible",
                      position: "relative",
                      opacity: isCurrent ? 0.7 : 1
                    }}
                  >
                    {campusSvg(campus) ? (
                      <img
                        src={campusImgUrl(campus)!}
                        alt={campus}
                        style={{
                          width: campus === "Paulista" ? 100 : 130,
                          height: "auto",
                          marginTop: campus === "Paulista" ? -34 : -32,
                          marginBottom: 0,
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                          pointerEvents: "none"
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", justifyContent: "center" }}><TreeDeciduous size={28} /></span>
                    )}
                    <span style={{ marginTop: campusSvg(campus) ? 2 : 0, fontSize: "0.82rem" }}>
                      {campus}
                      {isCurrent && <span style={{ display: "block", fontSize: "0.7rem", color: "#6b8e6b", marginTop: 2 }}>Atual</span>}
                    </span>
                  </button>
                )
              })}
            </div>

            <button onClick={onClose} style={{
              width: "100%", padding: "10px", borderRadius: 10,
              border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer",
              fontSize: "0.9rem", color: "#6b7280"
            }}>
              {canAccessAll ? "Cancelar" : "Fechar"}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2d3a2d", marginBottom: 4 }}>Confirmar Mudança</h2>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: 20 }}>
              De <strong>{unidade}</strong> para <strong>{selected}</strong>
            </p>

            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: 12 }}>
              Digite sua senha para confirmar:
            </p>

            <div style={{ marginBottom: 16, position: "relative" }}>
              <div style={{ position: "absolute", inset: "10px 0 0 14px", pointerEvents: "none" }}>
                <Lock size={18} color="#6b8e6b" />
              </div>
              <input
                type="password"
                autoFocus
                placeholder="Sua senha"
                value={password}
                onChange={e => { setPassword(e.target.value); setError("") }}
                onKeyDown={e => { if (e.key === "Enter") handleConfirm() }}
                style={{
                  width: "100%", padding: "12px 12px 12px 42px", borderRadius: 10,
                  border: "2px solid #e5e7eb", fontSize: "1rem", outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {error && (
              <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: 12, textAlign: "center" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setStep("select"); setError(""); setPassword("") }} style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer",
                fontSize: "0.9rem", color: "#6b7280"
              }}>
                Voltar
              </button>
              <button onClick={handleConfirm} disabled={!password || saving} style={{
                flex: 1, padding: "11px", borderRadius: 10, border: "none",
                background: saving ? "#9ca3af" : "#6b8e6b", color: "#fff",
                cursor: saving ? "not-allowed" : "pointer", fontSize: "0.9rem", fontWeight: 600
              }}>
                {saving ? "Verificando..." : "Confirmar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
