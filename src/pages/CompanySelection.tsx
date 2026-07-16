import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import {
  Building2, Plus, LogOut, Shield, ChevronRight, PawPrint,
  Search, Users, MapPin, Calendar, Pencil, Trash2, X, AlertTriangle
} from "lucide-react"
import type { Company } from "../types"

interface CompanyWithStats extends Company {
  unitCount?: number
  userCount?: number
}

export default function CompanySelection() {
  const navigate = useNavigate()
  const { user, role, signOut } = useAuth()
  const [companies, setCompanies] = useState<CompanyWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newLogoUrl, setNewLogoUrl] = useState("")
  const [newCoverUrl, setNewCoverUrl] = useState("")
  const [creating, setCreating] = useState(false)

  // Edit modal
  const [editCompany, setEditCompany] = useState<CompanyWithStats | null>(null)
  const [editName, setEditName] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [editLogoUrl, setEditLogoUrl] = useState("")
  const [editCoverUrl, setEditCoverUrl] = useState("")
  const [editing, setEditing] = useState(false)

  // Delete modal
  const [deleteConfirm, setDeleteConfirm] = useState<CompanyWithStats | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (role && role !== "admin") {
      navigate("/recepcao")
      return
    }
    loadCompanies()
  }, [role, navigate])

  const loadCompanies = async () => {
    setLoading(true)
    const [companiesRes, unitsRes, usersRes] = await Promise.all([
      supabase.from("companies").select("*").order("name"),
      supabase.from("units").select("company_id"),
      supabase.from("user_profiles").select("company_id")
    ])

    const companiesData = (companiesRes.data || []) as unknown as CompanyWithStats[]
    const unitCounts: Record<string, number> = {}
    const userCounts: Record<string, number> = {}

    ;(unitsRes.data || []).forEach((u: { company_id: string }) => {
      unitCounts[u.company_id] = (unitCounts[u.company_id] || 0) + 1
    })
    ;(usersRes.data || []).forEach((u: { company_id: string }) => {
      if (u.company_id) {
        userCounts[u.company_id] = (userCounts[u.company_id] || 0) + 1
      }
    })

    const enriched = companiesData.map(c => ({
      ...c,
      unitCount: unitCounts[c.id] || 0,
      userCount: userCounts[c.id] || 0
    }))

    setCompanies(enriched)
    setLoading(false)
  }

  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies
    const term = searchTerm.toLowerCase()
    return companies.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.slug.toLowerCase().includes(term)
    )
  }, [companies, searchTerm])

  const handleCreate = async () => {
    if (!newName.trim() || creating) return
    setCreating(true)
    const slug = newSlug.trim() || newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const { data, error } = await supabase.rpc("create_company_with_units", {
      p_name: newName.trim(),
      p_slug: slug,
      p_unit_names: ["Unidade Central"]
    })
    if (!error && data) {
      const companyId = typeof data === "string" ? data : data?.id
      if (companyId) {
        const updates: Record<string, string> = {}
        if (newLogoUrl.trim()) updates.logo_url = newLogoUrl.trim()
        if (newCoverUrl.trim()) updates.cover_url = newCoverUrl.trim()
        if (Object.keys(updates).length > 0) {
          await supabase.from("companies").update(updates).eq("id", companyId)
        }
      }
      setShowCreateModal(false)
      setNewName("")
      setNewSlug("")
      setNewLogoUrl("")
      setNewCoverUrl("")
      await loadCompanies()
    }
    setCreating(false)
  }

  const handleEdit = async () => {
    if (!editCompany || !editName.trim() || editing) return
    setEditing(true)
    const slug = editSlug.trim() || editName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    await supabase.from("companies").update({
      name: editName.trim(),
      slug,
      logo_url: editLogoUrl.trim() || null,
      cover_url: editCoverUrl.trim() || null,
      updated_at: new Date().toISOString()
    }).eq("id", editCompany.id)
    setEditCompany(null)
    await loadCompanies()
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!deleteConfirm || deleting) return
    setDeleting(true)
    await supabase.from("companies").update({ active: false }).eq("id", deleteConfirm.id)
    setDeleteConfirm(null)
    await loadCompanies()
    setDeleting(false)
  }

  const formatDate = (date?: string) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
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
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <PawPrint size={18} color="#fff" />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#e0e7e3" }}>VetHub</span>
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
          <button onClick={() => navigate("/recepcao")} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)", padding: "7px 14px", borderRadius: 8,
            cursor: "pointer", fontSize: "0.8rem", fontWeight: 500
          }}>
            ← Recepção
          </button>
          <button onClick={signOut} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.3)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem"
          }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {/* Title + Search */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e0e7e3", marginBottom: 4 }}>
              Empresas
            </h1>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
              {companies.length} empresa{companies.length !== 1 ? "s" : ""} cadastrada{companies.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar empresa..."
                style={{
                  width: 240, padding: "9px 12px 9px 34px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
                  color: "#e0e7e3", fontSize: "0.82rem", outline: "none"
                }}
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 10, border: "none",
                background: "#10b981", color: "#fff", cursor: "pointer",
                fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap"
              }}
            >
              <Plus size={14} /> Nova Empresa
            </button>
          </div>
        </div>

        {/* Company Grid */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#10b981",
              animation: "spin 0.8s linear infinite"
            }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Carregando empresas...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : filteredCompanies.length === 0 && !searchTerm ? (
          /* Empty State */
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "80px 20px", textAlign: "center"
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: "rgba(16,185,129,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20
            }}>
              <Building2 size={32} color="#34d399" />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e0e7e3", marginBottom: 6 }}>
              Nenhuma empresa cadastrada
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginBottom: 20, maxWidth: 360 }}>
              Crie sua primeira empresa para começar a gerenciar unidades, usuários e pacientes.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12, border: "none",
                background: "#10b981", color: "#fff", cursor: "pointer",
                fontSize: "0.9rem", fontWeight: 600
              }}
            >
              <Plus size={16} /> Criar primeira empresa
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16
          }}>
            {filteredCompanies.map((company, i) => (
              <div
                key={company.id}
                onClick={() => navigate(`/admin/empresa/${company.id}`)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16, padding: 0,
                  display: "flex", flexDirection: "column",
                  transition: "all 0.2s ease", position: "relative",
                  overflow: "hidden",
                  animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                  cursor: "pointer"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)"
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.25)"
                  e.currentTarget.style.transform = "translateY(-3px)"
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)"
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                {/* Cover photo */}
                <div style={{
                  height: 90,
                  background: company.cover_url
                    ? `url(${company.cover_url}) center/cover no-repeat`
                    : "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.08) 50%, rgba(16,185,129,0.15) 100%)",
                  position: "relative"
                }}>
                  {/* Status dot */}
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    width: 8, height: 8, borderRadius: "50%",
                    background: company.active !== false ? "#34d399" : "#ef4444",
                    boxShadow: company.active !== false ? "0 0 8px rgba(52,211,153,0.5)" : "0 0 8px rgba(239,68,68,0.5)"
                  }} />
                </div>

                {/* Logo overlapping cover */}
                <div style={{ padding: "0 20px", marginTop: -28, position: "relative", zIndex: 2 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: company.logo_url
                      ? `url(${company.logo_url}) center/cover no-repeat`
                      : "linear-gradient(135deg, #1a2332, #1e293b)",
                    border: "3px solid rgba(30,41,59,0.98)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                  }}>
                    {!company.logo_url && <Building2 size={22} color="#34d399" />}
                  </div>
                </div>

                {/* Card content */}
                <div style={{ padding: "10px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Name + slug */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e0e7e3", marginBottom: 2, lineHeight: 1.2 }}>
                        {company.name}
                      </h3>
                      <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                        /{company.slug}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditCompany(company)
                          setEditName(company.name)
                          setEditSlug(company.slug)
                          setEditLogoUrl(company.logo_url || "")
                          setEditCoverUrl(company.cover_url || "")
                        }}
                        style={{
                          padding: "5px 7px", borderRadius: 6,
                          border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)",
                          cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#60a5fa"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)" }}
                        title="Editar"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(company) }}
                        style={{
                          padding: "5px 7px", borderRadius: 6,
                          border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)",
                          cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)" }}
                        title="Desativar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
                    marginBottom: 12
                  }}>
                    <div style={{
                      padding: "7px 8px", borderRadius: 8,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#34d399" }}>
                        {company.unitCount ?? 0}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 1 }}>
                        <MapPin size={9} /> Unidades
                      </div>
                    </div>
                    <div style={{
                      padding: "7px 8px", borderRadius: 8,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#60a5fa" }}>
                        {company.userCount ?? 0}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 1 }}>
                        <Users size={9} /> Usuários
                      </div>
                    </div>
                    <div style={{
                      padding: "7px 8px", borderRadius: 8,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                        {company.settings && typeof company.settings === 'object' && 'plan' in company.settings
                          ? String((company.settings as Record<string, unknown>).plan)
                          : "—"
                        }
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                        Plano
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: "auto"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.66rem", color: "rgba(255,255,255,0.25)" }}>
                      <Calendar size={10} />
                      {formatDate(company.created_at)}
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: "0.68rem", color: "#34d399", fontWeight: 500
                    }}>
                      Abrir <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "2px dashed rgba(255,255,255,0.08)",
                borderRadius: 16, padding: 24,
                cursor: "pointer", textAlign: "center",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 12, minHeight: 240,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)"
                e.currentTarget.style.background = "rgba(16,185,129,0.04)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                e.currentTarget.style.background = "rgba(255,255,255,0.02)"
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "rgba(16,185,129,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Plus size={24} color="#34d399" />
              </div>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", fontWeight: 500 }}>
                Nova Empresa
              </span>
            </button>
          </div>
        )}

        {/* No search results */}
        {!loading && filteredCompanies.length === 0 && searchTerm && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Search size={32} color="rgba(255,255,255,0.15)" style={{ marginBottom: 12 }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
              Nenhum resultado para "<span style={{ color: "#34d399" }}>{searchTerm}</span>"
            </p>
          </div>
        )}
      </main>

      {/* Animation keyframe */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Create Company Modal */}
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
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e0e7e3" }}>Nova Empresa</h2>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                  Preencha os dados para criar uma nova empresa.
                </p>
              </div>
              <button onClick={() => { setShowCreateModal(false); setNewName(""); setNewSlug("") }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                Nome da Empresa
              </label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Ex: VetClínica Premium" autoFocus
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                  color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                Slug (URL amigável)
              </label>
              <input type="text" value={newSlug} onChange={e => setNewSlug(e.target.value)}
                placeholder="Ex: vetclinica-premium"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                  color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                }}
              />
              <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", marginTop: 4, display: "block" }}>
                Deixe vazio para gerar automaticamente
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                  URL da Logo
                </label>
                <input type="url" value={newLogoUrl} onChange={e => setNewLogoUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                    color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                  URL da Capa
                </label>
                <input type="url" value={newCoverUrl} onChange={e => setNewCoverUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                    color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowCreateModal(false); setNewName(""); setNewSlug(""); setNewLogoUrl(""); setNewCoverUrl("") }} style={{
                flex: 1, padding: "10px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={!newName.trim() || creating} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "none",
                background: "#10b981", color: "#fff",
                cursor: creating ? "not-allowed" : "pointer",
                fontSize: "0.82rem", fontWeight: 600, opacity: !newName.trim() ? 0.4 : 1
              }}>
                {creating ? "Criando..." : "Criar Empresa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editCompany && (
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
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e0e7e3" }}>Editar Empresa</h2>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                  Atualize os dados de <strong style={{ color: "#e0e7e3" }}>{editCompany.name}</strong>
                </p>
              </div>
              <button onClick={() => setEditCompany(null)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                Nome da Empresa
              </label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                  color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                Slug
              </label>
              <input type="text" value={editSlug} onChange={e => setEditSlug(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                  color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                  URL da Logo
                </label>
                <input type="url" value={editLogoUrl} onChange={e => setEditLogoUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                    color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                  URL da Capa
                </label>
                <input type="url" value={editCoverUrl} onChange={e => setEditCoverUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                    color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditCompany(null)} style={{
                flex: 1, padding: "10px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={handleEdit} disabled={!editName.trim() || editing} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "none",
                background: "#3b82f6", color: "#fff",
                cursor: editing ? "not-allowed" : "pointer",
                fontSize: "0.82rem", fontWeight: 600, opacity: !editName.trim() ? 0.4 : 1
              }}>
                {editing ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
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
            <AlertTriangle size={32} color="#f59e0b" style={{ marginBottom: 12 }} />
            <h3 style={{ fontWeight: 700, color: "#e0e7e3", marginBottom: 8 }}>Desativar empresa?</h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
              A empresa
            </p>
            <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e0e7e3", marginBottom: 12 }}>
              {deleteConfirm.name}
            </p>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              será desativada e não aparecerá mais na lista. Os dados não serão excluídos.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: "11px", borderRadius: 10, border: "none",
                background: "#ef4444", color: "#fff",
                cursor: deleting ? "not-allowed" : "pointer",
                fontSize: "0.85rem", fontWeight: 600, opacity: deleting ? 0.6 : 1
              }}>
                {deleting ? "Desativando..." : "Desativar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
