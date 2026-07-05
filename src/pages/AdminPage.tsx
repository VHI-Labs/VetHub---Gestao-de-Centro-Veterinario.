import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { PawPrint, LogOut, Shield, AlertTriangle, RefreshCw, UserPlus, Tv, ClipboardList } from "lucide-react"
import type { UserProfile } from "../types"

const CAMPUSES = ["Todos", "Mooca", "Vila Olímpia", "Paulista", "Piracicaba", "São José dos Campos"]
const PERMISSIONS = ["Recepcao", "Fila", "Videos", "Relatorios", "TV", "Prontuario", "Agendamentos"]

export default function AdminPage() {
  const navigate = useNavigate()
  const { user, role, signOut } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string; newRole: string } | null>(null)
  const [savingCampus, setSavingCampus] = useState<string | null>(null)
  const [savingPerm, setSavingPerm] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState("")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (role && role !== "admin") {
      navigate("/recepcao")
      return
    }
    if (role === "admin") {
      loadUsers()
      intervalRef.current = setInterval(loadUsersSilent, 10000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [role, navigate])

  const loadUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from("user_profiles").select("id,email,role,unidade,funcoes").order("email")
    setUsers((data || []) as UserProfile[])
    setLoading(false)
  }

  const loadUsersSilent = async () => {
    const { data } = await supabase.from("user_profiles").select("id,email,role,unidade,funcoes").order("email")
    if (data) setUsers(data as UserProfile[])
  }

  const requestRoleChange = (uid: string, email: string, currentRole: string) => {
    const next = currentRole === "admin" ? "coordinator" : currentRole === "coordinator" ? "user" : "admin"
    setConfirmTarget({ id: uid, name: email || "Sem email", newRole: next })
  }

  const confirmRoleChange = async () => {
    if (!confirmTarget) return
    await supabase.from("user_profiles").update({ role: confirmTarget.newRole }).eq("id", confirmTarget.id)
    setConfirmTarget(null)
    await loadUsers()
  }

  const updateCampus = async (uid: string, campus: string) => {
    setSavingCampus(uid)
    await supabase.from("user_profiles").update({ unidade: campus }).eq("id", uid)
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, unidade: campus } : u))
    setSavingCampus(null)
  }

  const syncUsers = async () => {
    setSyncing(true)
    setSyncMessage("")
    const { data, error } = await supabase.rpc("sync_missing_profiles")
    if (error) {
      setSyncMessage("Erro: função sync_missing_profiles não encontrada no banco")
    } else {
      setSyncMessage(`${data} usuário(s) sincronizado(s)`)
    }
    await loadUsers()
    setSyncing(false)
  }

  const togglePermission = async (uid: string, current: string[], perm: string) => {
    setSavingPerm(uid)
    const next = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm]
    await supabase.from("user_profiles").update({ funcoes: next }).eq("id", uid)
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, funcoes: next } : u))
    setSavingPerm(null)
  }

  if (!role || role !== "admin") return null

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(/cmv.png) center/cover fixed`,
      display: "flex", flexDirection: "column"
    }}>
      <header style={{
        background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)",
        color: "#fff", padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo-uam.png" alt="UAM" style={{ height: 32, borderRadius: 6 }} />
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#e0e7e3" }}>HOVET ADMIN</span>
          <span style={{
            background: "rgba(16,185,129,0.15)", color: "#34d399",
            padding: "2px 10px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 700,
            letterSpacing: "0.05em"
          }}>
            <Shield size={11} style={{ marginRight: 4, display: "inline" }} />
            PAINEL PRIVADO
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{user?.email}</span>
          <button onClick={() => navigate("/recepcao")} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)",
            padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: 500
          }}>
            ← Recepção
          </button>
          <button onClick={signOut} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.35)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem",
            transition: "color 0.2s"
          }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "32px", maxWidth: 960, margin: "0 auto", width: "100%" }}>
        <div style={{
          background: "rgba(15,23,42,0.6)", backdropFilter: "blur(16px)",
          borderRadius: 16, padding: 24,
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e0e7e3" }}>Administração</h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: 2 }}>Gerencie os usuários e seus campus.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate('/admin/auditoria')} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(16,185,129,0.2)",
                background: "rgba(16,185,129,0.1)", cursor: "pointer", fontSize: "0.82rem",
                color: "#34d399", fontWeight: 600
              }}>
                <ClipboardList size={13} /> Auditoria
              </button>
              <button onClick={syncUsers} disabled={syncing} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.05)", cursor: "pointer", fontSize: "0.82rem",
                color: "rgba(255,255,255,0.6)", fontWeight: 500
              }}>
                <UserPlus size={13} /> {syncing ? "Sincronizando..." : "Sincronizar"}
              </button>
              <button onClick={loadUsers} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.05)", cursor: "pointer", fontSize: "0.82rem",
                color: "rgba(255,255,255,0.6)", fontWeight: 500
              }}>
                <RefreshCw size={13} /> Atualizar
              </button>
            </div>
          </div>
          {syncMessage && (
            <div style={{
              padding: "8px 16px", borderRadius: 8, marginBottom: 16,
              background: syncMessage.startsWith("Erro") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
              border: `1px solid ${syncMessage.startsWith("Erro") ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
              color: syncMessage.startsWith("Erro") ? "#f87171" : "#34d399",
              fontSize: "0.82rem", fontWeight: 500
            }}>
              {syncMessage}
            </div>
          )}

          {loading ? (
            <div style={{ color: "rgba(255,255,255,0.4)", padding: "20px 0" }}>Carregando...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {users.map(u => (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px",
                  background: "rgba(255,255,255,0.04)", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.05)", gap: 12,
                  transition: "background 0.2s"
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#e0e7e3", fontSize: "0.9rem" }}>{u.email || "Sem email"}</div>
                    {u.role === "user" ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                        {PERMISSIONS.map(perm => {
                          const checked = (u.funcoes || []).includes(perm)
                          return (
                            <label
                              key={perm}
                              onClick={() => togglePermission(u.id!, u.funcoes || [], perm)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 3,
                                padding: "2px 8px", borderRadius: 6,
                                fontSize: "0.7rem", fontWeight: 600, cursor: "pointer",
                                background: checked ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                                color: checked ? "#34d399" : "rgba(255,255,255,0.35)",
                                border: `1px solid ${checked ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`
                              }}
                            >
                              <span style={{
                                width: 10, height: 10, borderRadius: 2,
                                border: `1.5px solid ${checked ? "#34d399" : "rgba(255,255,255,0.2)"}`,
                                background: checked ? "#34d399" : "transparent",
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0
                              }}>
                                {checked && <span style={{ color: "#0f172a", fontSize: 7, lineHeight: 1 }}>✓</span>}
                              </span>
                              {perm === "TV" ? <><Tv size={11} style={{ display: "inline", marginRight: 2 }} /> TV</> : perm}
                            </label>
                          )
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.72rem", color: "#34d399", marginTop: 4, fontWeight: 600 }}>
                        Acesso total a todas as funções
                      </div>
                    )}
                  </div>

                  <select
                    value={u.unidade || ""}
                    onChange={e => updateCampus(u.id!, e.target.value)}
                    style={{
                      padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                      fontSize: "0.8rem", fontWeight: 500,
                      background: "rgba(255,255,255,0.05)", color: u.unidade ? "#e0e7e3" : "rgba(255,255,255,0.3)",
                      cursor: "pointer", outline: "none", minWidth: 150
                    }}
                  >
                    <option value="">Sem campus</option>
                    {CAMPUSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => requestRoleChange(u.id!, u.email || "Sem email", u.role || "user")}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      background: u.role === "admin" ? "rgba(16,185,129,0.15)" : u.role === "coordinator" ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.05)",
                      color: u.role === "admin" ? "#34d399" : u.role === "coordinator" ? "#60a5fa" : "rgba(255,255,255,0.5)"
                    }}
                  >
                    {u.role === "admin" ? "Admin" : u.role === "coordinator" ? "Coordenador" : "Usuário"} {u.id === user?.id ? "(você)" : ""}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {confirmTarget && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 32,
            maxWidth: 420, width: "100%", textAlign: "center"
          }}>
            <div style={{ marginBottom: 12 }}><AlertTriangle size={36} color="#f59e0b" style={{ display: "inline" }} /></div>
            <h3 style={{ fontWeight: 700, color: "#e0e7e3", marginBottom: 8, fontSize: "1.1rem" }}>Confirmar alteração</h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
              Tem certeza que deseja alterar o cargo de
            </p>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "#e0e7e3", marginBottom: 16 }}>
              {confirmTarget.name}
            </p>
            <p style={{
              fontSize: "0.85rem", padding: "8px 16px", borderRadius: 8,
              background: "rgba(16,185,129,0.1)", color: "#34d399",
              fontWeight: 600, marginBottom: 20, display: "inline-block",
              border: "1px solid rgba(16,185,129,0.2)"
            }}>
              → {confirmTarget.newRole === "admin" ? "Admin" : confirmTarget.newRole === "coordinator" ? "Coordenador" : "Usuário"}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmTarget(null)} style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", cursor: "pointer",
                fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={confirmRoleChange} style={{
                flex: 1, padding: "11px", borderRadius: 10, border: "none",
                background: "#10b981", color: "#fff", cursor: "pointer",
                fontSize: "0.85rem", fontWeight: 600
              }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
