import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import {
  ArrowLeft, LogOut, Shield, Users, Plus, Trash2, RefreshCw,
  UserPlus, Tv, ChevronDown, Search, AlertTriangle, X, KeyRound
} from "lucide-react"
import type { Company, Unit, UserProfile } from "../types"

const PERMISSIONS = ["Recepcao", "Fila", "Videos", "Relatorios", "TV", "Prontuario", "Agendamentos"]

export default function CompanyUsers() {
  const navigate = useNavigate()
  const { companyId } = useParams<{ companyId: string }>()
  const { user, role, signOut } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Modals
  const [confirmRoleChange, setConfirmRoleChange] = useState<{ id: string; email: string; newRole: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; email: string } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [creating, setCreating] = useState(false)
  const [createdMessage, setCreatedMessage] = useState("")
  const [createdEmail, setCreatedEmail] = useState("")
  const [createdPassword, setCreatedPassword] = useState("")
  const [resetConfirm, setResetConfirm] = useState<{ id: string; email: string } | null>(null)
  const [resetting, setResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  useEffect(() => {
    if (role && role !== "admin") {
      navigate("/recepcao")
      return
    }
    if (companyId) {
      loadData()
      intervalRef.current = setInterval(loadUsersSilent, 10000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [role, navigate, companyId])

  const loadData = async () => {
    setLoading(true)
    const [companyRes, usersRes, unitsRes] = await Promise.all([
      supabase.from("companies").select("*").eq("id", companyId).single(),
      supabase.from("user_profiles").select("id,email,role,unidade,funcoes,unit_id,atualizado_em").eq("company_id", companyId).order("email"),
      supabase.from("units").select("*").eq("company_id", companyId).eq("active", true).order("name")
    ])
    if (companyRes.data) setCompany(companyRes.data as unknown as Company)
    if (usersRes.data) setUsers(usersRes.data as unknown as UserProfile[])
    if (unitsRes.data) setUnits(unitsRes.data as unknown as Unit[])
    setLoading(false)
  }

  const loadUsersSilent = async () => {
    const { data } = await supabase.from("user_profiles").select("id,email,role,unidade,funcoes,unit_id,atualizado_em").eq("company_id", companyId).order("email")
    if (data) setUsers(data as unknown as UserProfile[])
  }

  const handleRoleChange = async () => {
    if (!confirmRoleChange) return
    await supabase.from("user_profiles").update({ role: confirmRoleChange.newRole }).eq("id", confirmRoleChange.id)
    setConfirmRoleChange(null)
    await loadData()
  }

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return
    // Remove from user_profiles (auth user stays, would need admin API for full delete)
    await supabase.from("user_profiles").delete().eq("id", deleteConfirm.id)
    setDeleteConfirm(null)
    await loadData()
  }

  const handleUpdateUnit = async (uid: string, unitId: string) => {
    await supabase.from("user_profiles").update({ unit_id: unitId || null }).eq("id", uid)
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, unitId: unitId } : u))
  }

  const handleTogglePermission = async (uid: string, current: string[], perm: string) => {
    const next = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm]
    await supabase.from("user_profiles").update({ funcoes: next }).eq("id", uid)
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, funcoes: next } : u))
  }

  const syncUsers = async () => {
    setSyncing(true)
    setSyncMessage("")
    const { data, error } = await supabase.rpc("sync_missing_profiles")
    if (error) {
      setSyncMessage("Erro: função sync_missing_profiles não encontrada")
    } else {
      setSyncMessage(`${data} usuário(s) sincronizado(s)`)
    }
    await loadData()
    setSyncing(false)
  }

  const handleCreateUser = async () => {
    if (!newEmail.trim() || !newPassword.trim() || creating) return
    setCreating(true)
    const { data, error } = await supabase.auth.signUp({
      email: newEmail.trim(),
      password: newPassword.trim()
    })
    if (!error && data.user) {
      await supabase.from("user_profiles").update({
        company_id: companyId,
        force_password_change: true,
        atualizado_em: new Date().toISOString()
      }).eq("id", data.user.id)
      setCreatedEmail(newEmail.trim())
      setCreatedPassword(newPassword.trim())
      setCreatedMessage("Usuário criado com sucesso!")
      setNewEmail("")
      setNewPassword("")
      await loadData()
    } else {
      setCreatedMessage(error?.message || "Erro ao criar usuário")
    }
    setCreating(false)
  }

  const handleResetPassword = async () => {
    if (!resetConfirm) return
    setResetting(true)
    setResetMessage("")
    const { data, error } = await supabase.rpc("admin_reset_user_password", {
      target_user_id: resetConfirm.id,
      default_password: "VetHub@123"
    })
    if (error) {
      setResetMessage("Erro: " + error.message)
    } else if (data && !data.success) {
      setResetMessage(data.error || "Erro ao resetar senha")
    } else {
      setResetMessage(`Senha de ${resetConfirm.email} resetada para: VetHub@123`)
    }
    setResetting(false)
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || u.role === filterRole
    return matchesSearch && matchesRole
  })

  const getUnitName = (unitId?: string) => {
    if (!unitId) return "Sem unidade"
    return units.find(u => u.id === unitId)?.name || "Desconhecida"
  }

  if (!role || role !== "admin") return null

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", flexDirection: "column"
    }}>
      {/* Header */}
      <header style={{
        background: "rgba(15,23,42,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(`/admin/empresa/${companyId}`)} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)", padding: "7px 10px", borderRadius: 8,
            cursor: "pointer", display: "flex", alignItems: "center"
          }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Users size={18} color="#fff" />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#e0e7e3" }}>
              Usuários
            </span>
            <span style={{ marginLeft: 8, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
              {company?.name}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setShowCreateModal(true)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 8, border: "none",
            background: "#10b981", color: "#fff", cursor: "pointer",
            fontSize: "0.8rem", fontWeight: 600
          }}>
            <Plus size={14} /> Novo Usuário
          </button>
          <button onClick={syncUsers} disabled={syncing} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)", cursor: "pointer", fontSize: "0.8rem",
            color: "rgba(255,255,255,0.6)"
          }}>
            <UserPlus size={13} /> {syncing ? "Sincronizando..." : "Sincronizar"}
          </button>
          <button onClick={loadData} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)", cursor: "pointer", fontSize: "0.8rem",
            color: "rgba(255,255,255,0.6)"
          }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: "24px", maxWidth: 960, margin: "0 auto", width: "100%" }}>
        {/* Sync Message */}
        {syncMessage && (
          <div style={{
            padding: "10px 16px", borderRadius: 10, marginBottom: 16,
            background: syncMessage.startsWith("Erro") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
            border: `1px solid ${syncMessage.startsWith("Erro") ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
            color: syncMessage.startsWith("Erro") ? "#f87171" : "#34d399",
            fontSize: "0.82rem", fontWeight: 500
          }}>
            {syncMessage}
          </div>
        )}

        {/* Filters */}
        <div style={{
          display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap"
        }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por email..."
              style={{
                width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
                color: "#e0e7e3", fontSize: "0.82rem", outline: "none"
              }}
            />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            style={{
              padding: "9px 12px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
              color: "#e0e7e3", fontSize: "0.82rem", outline: "none", cursor: "pointer"
            }}
          >
            <option value="all">Todos os cargos</option>
            <option value="admin">Admin</option>
            <option value="coordinator">Coordenador</option>
            <option value="user">Usuário</option>
          </select>
        </div>

        {/* Users List */}
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.3)", padding: "40px 0", textAlign: "center" }}>
            Carregando usuários...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredUsers.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)" }}>
                Nenhum usuário encontrado.
              </div>
            )}
            {filteredUsers.map(u => (
              <div key={u.id} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: 14,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, flexWrap: "wrap"
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: "#e0e7e3", fontSize: "0.88rem" }}>
                      {u.email || "Sem email"}
                    </span>
                    {u.id === user?.id && (
                      <span style={{
                        fontSize: "0.6rem", padding: "2px 6px", borderRadius: 4,
                        background: "rgba(16,185,129,0.12)", color: "#34d399",
                        fontWeight: 600
                      }}>
                        VOCÊ
                      </span>
                    )}
                  </div>

                  {/* Permissions for users */}
                  {u.role === "user" && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {PERMISSIONS.map(perm => {
                        const checked = (u.funcoes || []).includes(perm)
                        return (
                          <button
                            key={perm}
                            onClick={() => handleTogglePermission(u.id!, u.funcoes || [], perm)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 3,
                              padding: "3px 8px", borderRadius: 6,
                              fontSize: "0.68rem", fontWeight: 600, cursor: "pointer",
                              background: checked ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                              color: checked ? "#34d399" : "rgba(255,255,255,0.3)",
                              border: `1px solid ${checked ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`
                            }}
                          >
                            {perm === "TV" ? <><Tv size={10} style={{ display: "inline" }} /> TV</> : perm}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {u.role !== "user" && (
                    <div style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 500 }}>
                      Acesso total
                    </div>
                  )}
                </div>

                {/* Unit selector */}
                <select
                  value={u.unitId || ""}
                  onChange={e => handleUpdateUnit(u.id!, e.target.value)}
                  style={{
                    padding: "6px 10px", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.05)", color: "#e0e7e3",
                    fontSize: "0.78rem", outline: "none", cursor: "pointer", minWidth: 140
                  }}
                >
                  <option value="">Sem unidade</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>

                {/* Role dropdown */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setConfirmRoleChange({
                      id: u.id!,
                      email: u.email || "Sem email",
                      newRole: u.role === "admin" ? "coordinator" : u.role === "coordinator" ? "user" : "admin"
                    })}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.78rem",
                      display: "flex", alignItems: "center", gap: 4,
                      background: u.role === "admin" ? "rgba(16,185,129,0.15)" : u.role === "coordinator" ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.05)",
                      color: u.role === "admin" ? "#34d399" : u.role === "coordinator" ? "#60a5fa" : "rgba(255,255,255,0.5)"
                    }}
                  >
                    {u.role === "admin" ? "Admin" : u.role === "coordinator" ? "Coordenador" : "Usuário"}
                    <ChevronDown size={12} />
                  </button>
                </div>

                {/* Reset Password */}
                {u.id !== user?.id && (
                  <button onClick={() => { setResetConfirm({ id: u.id!, email: u.email || "Sem email" }); setResetMessage("") }} style={{
                    padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(251,191,36,0.2)",
                    background: "rgba(251,191,36,0.08)", cursor: "pointer", color: "#fbbf24"
                  }} title="Resetar senha para padrão">
                    <KeyRound size={13} />
                  </button>
                )}

                {/* Delete */}
                {u.id !== user?.id && (
                  <button onClick={() => setDeleteConfirm({ id: u.id!, email: u.email || "Sem email" })} style={{
                    padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.08)", cursor: "pointer", color: "#f87171"
                  }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Role Change Confirmation */}
      {confirmRoleChange && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 32, maxWidth: 400, width: "100%", textAlign: "center"
          }}>
            <AlertTriangle size={32} color="#f59e0b" style={{ marginBottom: 12 }} />
            <h3 style={{ fontWeight: 700, color: "#e0e7e3", marginBottom: 8 }}>Alterar cargo?</h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
              Alterar cargo de
            </p>
            <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e0e7e3", marginBottom: 12 }}>
              {confirmRoleChange.email}
            </p>
            <p style={{
              fontSize: "0.85rem", padding: "8px 16px", borderRadius: 8,
              background: "rgba(16,185,129,0.1)", color: "#34d399",
              fontWeight: 600, marginBottom: 20, display: "inline-block",
              border: "1px solid rgba(16,185,129,0.2)"
            }}>
              → {confirmRoleChange.newRole === "admin" ? "Admin" : confirmRoleChange.newRole === "coordinator" ? "Coordenador" : "Usuário"}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmRoleChange(null)} style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={handleRoleChange} style={{
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

      {/* Delete User Confirmation */}
      {deleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 32, maxWidth: 400, width: "100%", textAlign: "center"
          }}>
            <Trash2 size={32} color="#ef4444" style={{ marginBottom: 12 }} />
            <h3 style={{ fontWeight: 700, color: "#e0e7e3", marginBottom: 8 }}>Remover usuário?</h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
              <strong style={{ color: "#e0e7e3" }}>{deleteConfirm.email}</strong> será removido do painel.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={handleDeleteUser} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: "#ef4444", color: "#fff", cursor: "pointer",
                fontSize: "0.82rem", fontWeight: 600
              }}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 32, maxWidth: 440, width: "100%"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e0e7e3" }}>Novo Usuário</h2>
              <button onClick={() => { setShowCreateModal(false); setNewEmail(""); setNewPassword(""); setCreatedMessage(""); setCreatedEmail(""); setCreatedPassword("") }} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer"
              }}>
                <X size={18} />
              </button>
            </div>

            {createdMessage && createdEmail ? (
              <div style={{
                padding: 16, borderRadius: 10, marginBottom: 16,
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)"
              }}>
                <div style={{ color: "#34d399", fontWeight: 700, fontSize: "0.9rem", marginBottom: 8 }}>
                  Usuário criado!
                </div>
                <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                  Envie as credenciais abaixo ao usuário. No primeiro acesso ele será obrigado a trocar a senha.
                </div>
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  marginBottom: 6
                }}>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: "0.88rem", color: "#e0e7e3", fontWeight: 600, wordBreak: "break-all" }}>{createdEmail}</div>
                </div>
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)"
                }}>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Senha temporária</div>
                  <div style={{ fontSize: "0.88rem", color: "#34d399", fontWeight: 600, fontFamily: "monospace" }}>{createdPassword}</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                    Email
                  </label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                    placeholder="usuario@email.com"
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                      color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                    Senha temporária
                  </label>
                  <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Defina uma senha temporária"
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                      color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                    }}
                  />
                  <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                    O usuário será obrigado a trocar a senha no primeiro acesso
                  </div>
                </div>
              </>
            )}

            {createdMessage && createdEmail ? (
              <button onClick={() => { setShowCreateModal(false); setCreatedMessage(""); setCreatedEmail(""); setCreatedPassword("") }} style={{
                width: "100%", padding: "10px", borderRadius: 8, border: "none",
                background: "#10b981", color: "#fff", cursor: "pointer",
                fontSize: "0.82rem", fontWeight: 600
              }}>
                Fechar
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setShowCreateModal(false); setNewEmail(""); setNewPassword(""); setCreatedMessage("") }} style={{
                  flex: 1, padding: "10px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                  cursor: "pointer", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
                }}>
                  Cancelar
                </button>
                <button onClick={handleCreateUser} disabled={!newEmail.trim() || !newPassword.trim() || creating} style={{
                  flex: 1, padding: "10px", borderRadius: 8, border: "none",
                  background: "#10b981", color: "#fff",
                  cursor: creating ? "not-allowed" : "pointer",
                  fontSize: "0.82rem", fontWeight: 600,
                  opacity: !newEmail.trim() || !newPassword.trim() ? 0.4 : 1
                }}>
                  {creating ? "Criando..." : "Criar Usuário"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Confirmation */}
      {resetConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 32, maxWidth: 400, width: "100%", textAlign: "center"
          }}>
            <KeyRound size={32} color="#fbbf24" style={{ marginBottom: 12 }} />
            <h3 style={{ fontWeight: 700, color: "#e0e7e3", marginBottom: 8 }}>Resetar senha?</h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
              A senha de
            </p>
            <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e0e7e3", marginBottom: 12 }}>
              {resetConfirm.email}
            </p>
            <p style={{
              fontSize: "0.82rem", padding: "10px 16px", borderRadius: 8,
              background: "rgba(251,191,36,0.08)", color: "#fbbf24",
              fontWeight: 600, marginBottom: 20, display: "inline-block",
              border: "1px solid rgba(251,191,36,0.2)"
            }}>
              será resetada para: VetHub@123
            </p>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              No próximo login, o usuário será obrigado a criar uma nova senha.
            </p>
            {resetMessage && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                background: resetMessage.includes("Erro") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                border: `1px solid ${resetMessage.includes("Erro") ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                color: resetMessage.includes("Erro") ? "#f87171" : "#34d399",
                fontSize: "0.82rem", fontWeight: 500
              }}>
                {resetMessage}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setResetConfirm(null)} style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
              }}>
                Cancelar
              </button>
              {resetMessage && !resetMessage.includes("Erro") ? (
                <button onClick={() => setResetConfirm(null)} style={{
                  flex: 1, padding: "11px", borderRadius: 10, border: "none",
                  background: "#10b981", color: "#fff", cursor: "pointer",
                  fontSize: "0.85rem", fontWeight: 600
                }}>
                  Fechar
                </button>
              ) : (
                <button onClick={handleResetPassword} disabled={resetting} style={{
                  flex: 1, padding: "11px", borderRadius: 10, border: "none",
                  background: "#f59e0b", color: "#fff",
                  cursor: resetting ? "not-allowed" : "pointer",
                  fontSize: "0.85rem", fontWeight: 600, opacity: resetting ? 0.6 : 1
                }}>
                  {resetting ? "Resetando..." : "Confirmar reset"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
