import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import {
  ArrowLeft, LogOut, Shield, Building2, Users, PawPrint, Stethoscope,
  Calendar, Syringe, Scissors, FileText, Pill, ClipboardList, MapPin,
  TrendingUp, DollarSign, Activity
} from "lucide-react"
import type { Company, CompanyDashboard as DashboardType } from "../types"

export default function CompanyDashboard() {
  const navigate = useNavigate()
  const { companyId } = useParams<{ companyId: string }>()
  const { user, role, signOut } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [dashboard, setDashboard] = useState<DashboardType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (role && role !== "admin") {
      navigate("/recepcao")
      return
    }
    if (companyId) {
      loadData()
    }
  }, [role, navigate, companyId])

  const loadData = async () => {
    setLoading(true)
    const [companyRes, dashRes] = await Promise.all([
      supabase.from("companies").select("*").eq("id", companyId).single(),
      supabase.rpc("get_company_dashboard", { p_company_id: companyId })
    ])
    if (companyRes.data) setCompany(companyRes.data as unknown as Company)
    if (dashRes.data) setDashboard(dashRes.data as DashboardType)
    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  const statCards = dashboard ? [
    { icon: Users, label: "Usuários", value: dashboard.total_users, color: "#3b82f6" },
    { icon: MapPin, label: "Unidades", value: dashboard.total_units, color: "#8b5cf6" },
    { icon: PawPrint, label: "Pacientes", value: dashboard.total_patients, color: "#10b981" },
    { icon: Users, label: "Tutores", value: dashboard.total_owners, color: "#06b6d4" },
    { icon: Stethoscope, label: "Consultas", value: dashboard.total_consultas, color: "#f59e0b" },
    { icon: Syringe, label: "Vacinas", value: dashboard.total_vacinas, color: "#ec4899" },
    { icon: Scissors, label: "Cirurgias", value: dashboard.total_cirurgias, color: "#ef4444" },
    { icon: Calendar, label: "Agendamentos", value: dashboard.total_agendamentos, color: "#6366f1" },
    { icon: Activity, label: "Veterinários", value: dashboard.total_veterinarios, color: "#14b8a6" },
    { icon: Pill, label: "Medicamentos", value: dashboard.total_medicamentos, color: "#a855f7" },
    { icon: FileText, label: "Faturas", value: dashboard.total_faturas, color: "#f97316" },
    { icon: TrendingUp, label: "Faturas Abertas", value: dashboard.faturas_abertas, color: "#eab308" },
  ] : []

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
          <button onClick={() => navigate("/admin")} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)", padding: "7px 10px", borderRadius: 8,
            cursor: "pointer", display: "flex", alignItems: "center"
          }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Building2 size={18} color="#fff" />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#e0e7e3" }}>
              {loading ? "Carregando..." : company?.name || "Empresa"}
            </span>
            <span style={{
              marginLeft: 8, fontSize: "0.65rem", fontWeight: 700,
              background: "rgba(16,185,129,0.15)", color: "#34d399",
              padding: "2px 8px", borderRadius: 6, letterSpacing: "0.05em"
            }}>
              <Shield size={10} style={{ marginRight: 4, display: "inline" }} />
              ADMIN
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            {user?.email}
          </span>
          <button onClick={signOut} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.3)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem"
          }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: "24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.3)", padding: "40px 0", textAlign: "center" }}>
            Carregando dashboard...
          </div>
        ) : (
          <>
            {/* Revenue Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 16, padding: 24, marginBottom: 24
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <DollarSign size={20} color="#34d399" />
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                  Receita Total
                </span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#34d399" }}>
                {formatCurrency(dashboard?.receita_total || 0)}
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12, marginBottom: 32
            }}>
              {statCards.map(stat => (
                <div key={stat.label} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: 16
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <stat.icon size={16} color={stat.color} />
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                      {stat.label}
                    </span>
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e0e7e3" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Navigation */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#e0e7e3", marginBottom: 12 }}>
                Gerenciamento
              </h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => navigate(`/admin/empresa/${companyId}/unidades`)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 10,
                  border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.08)",
                  cursor: "pointer", fontSize: "0.82rem", color: "#a78bfa", fontWeight: 600
                }}>
                  <MapPin size={15} /> Unidades
                </button>
                <button onClick={() => navigate(`/admin/empresa/${companyId}/usuarios`)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 10,
                  border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.08)",
                  cursor: "pointer", fontSize: "0.82rem", color: "#60a5fa", fontWeight: 600
                }}>
                  <Users size={15} /> Usuários
                </button>
                <button onClick={() => navigate(`/admin/empresa/${companyId}/auditoria`)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 10,
                  border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.08)",
                  cursor: "pointer", fontSize: "0.82rem", color: "#34d399", fontWeight: 600
                }}>
                  <ClipboardList size={15} /> Auditoria
                </button>
              </div>
            </div>

            {/* Units Overview */}
            {dashboard?.unidades && dashboard.unidades.length > 0 && (
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#e0e7e3", marginBottom: 12 }}>
                  Unidades
                </h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 12
                }}>
                  {dashboard.unidades.map(unit => (
                    <button
                      key={unit.id}
                      onClick={() => navigate(`/admin/empresa/${companyId}/unidade/${unit.id}`)}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 12, padding: 16, cursor: "pointer",
                        textAlign: "left", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.07)"
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)"
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <MapPin size={16} color="#a78bfa" />
                          <span style={{ fontWeight: 600, color: "#e0e7e3", fontSize: "0.9rem" }}>
                            {unit.name}
                          </span>
                        </div>
                        <span style={{
                          fontSize: "0.65rem", padding: "2px 8px", borderRadius: 6,
                          background: unit.active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                          color: unit.active ? "#34d399" : "#f87171",
                          fontWeight: 600
                        }}>
                          {unit.active ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
                          {unit.users} usuário{unit.users !== 1 ? "s" : ""}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
                          {unit.patients} paciente{unit.patients !== 1 ? "s" : ""}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
                          {unit.consultas} consulta{unit.consultas !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
