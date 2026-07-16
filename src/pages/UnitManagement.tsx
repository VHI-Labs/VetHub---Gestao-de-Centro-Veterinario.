import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import {
  ArrowLeft, LogOut, Shield, Building2, MapPin, Plus, Trash2,
  Check, X, Phone, Edit3
} from "lucide-react"
import type { Company, Unit } from "../types"

export default function UnitManagement() {
  const navigate = useNavigate()
  const { companyId } = useParams<{ companyId: string }>()
  const { user, role, signOut } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Unit | null>(null)

  useEffect(() => {
    if (role && role !== "admin") {
      navigate("/recepcao")
      return
    }
    if (companyId) loadData()
  }, [role, navigate, companyId])

  const loadData = async () => {
    setLoading(true)
    const [companyRes, unitsRes] = await Promise.all([
      supabase.from("companies").select("*").eq("id", companyId).single(),
      supabase.from("units").select("*").eq("company_id", companyId).order("name")
    ])
    if (companyRes.data) setCompany(companyRes.data as unknown as Company)
    if (unitsRes.data) setUnits(unitsRes.data as unknown as Unit[])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!newName.trim() || saving) return
    setSaving(true)
    const slug = newSlug.trim() || newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

    const { error } = await supabase.rpc("create_unit", {
      p_company_id: companyId,
      p_name: newName.trim(),
      p_slug: slug,
      p_address: newAddress.trim() || null
    })

    if (!error) {
      setShowCreateModal(false)
      resetForm()
      await loadData()
    }
    setSaving(false)
  }

  const handleUpdate = async () => {
    if (!editingUnit || saving) return
    setSaving(true)
    const slug = newSlug.trim() || editingUnit.slug

    const { error } = await supabase
      .from("units")
      .update({
        name: newName.trim(),
        slug: slug,
        address: newAddress.trim() || null,
        phone: newPhone.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", editingUnit.id)

    if (!error) {
      setEditingUnit(null)
      resetForm()
      await loadData()
    }
    setSaving(false)
  }

  const handleToggleActive = async (unit: Unit) => {
    await supabase
      .from("units")
      .update({ active: !unit.active, updated_at: new Date().toISOString() })
      .eq("id", unit.id)
    await loadData()
  }

  const handleDelete = async () => {
    if (!deleteConfirm || saving) return
    setSaving(true)
    await supabase.from("units").delete().eq("id", deleteConfirm.id)
    setDeleteConfirm(null)
    setSaving(false)
    await loadData()
  }

  const openEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setNewName(unit.name)
    setNewSlug(unit.slug)
    setNewAddress(unit.address || "")
    setNewPhone(unit.phone || "")
  }

  const resetForm = () => {
    setNewName("")
    setNewSlug("")
    setNewAddress("")
    setNewPhone("")
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
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <MapPin size={18} color="#fff" />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#e0e7e3" }}>
              Unidades
            </span>
            <span style={{ marginLeft: 8, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
              {company?.name}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { setShowCreateModal(true); resetForm() }} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: "#10b981", color: "#fff", cursor: "pointer",
            fontSize: "0.82rem", fontWeight: 600
          }}>
            <Plus size={14} /> Nova Unidade
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
      <main style={{ flex: 1, padding: "24px", maxWidth: 960, margin: "0 auto", width: "100%" }}>
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.3)", padding: "40px 0", textAlign: "center" }}>
            Carregando unidades...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {units.length === 0 && (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                color: "rgba(255,255,255,0.3)", fontSize: "0.9rem"
              }}>
                Nenhuma unidade encontrada. Crie a primeira unidade!
              </div>
            )}
            {units.map(unit => (
              <div key={unit.id} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: 16,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 16, opacity: unit.active ? 1 : 0.5
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <MapPin size={15} color="#a78bfa" />
                    <span style={{ fontWeight: 600, color: "#e0e7e3", fontSize: "0.9rem" }}>
                      {unit.name}
                    </span>
                    <span style={{
                      fontSize: "0.6rem", padding: "2px 6px", borderRadius: 4,
                      background: unit.active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      color: unit.active ? "#34d399" : "#f87171",
                      fontWeight: 600, letterSpacing: "0.03em"
                    }}>
                      {unit.active ? "ATIVA" : "INATIVA"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {unit.address && (
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
                        {unit.address}
                      </span>
                    )}
                    {unit.phone && (
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={11} /> {unit.phone}
                      </span>
                    )}
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                      /{unit.slug}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => navigate(`/admin/empresa/${companyId}/unidade/${unit.id}`)} style={{
                    padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.2)",
                    background: "rgba(139,92,246,0.08)", cursor: "pointer",
                    fontSize: "0.75rem", color: "#a78bfa", fontWeight: 500
                  }}>
                    Gerenciar
                  </button>
                  <button onClick={() => openEdit(unit)} style={{
                    padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.05)", cursor: "pointer",
                    color: "rgba(255,255,255,0.5)"
                  }}>
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => handleToggleActive(unit)} style={{
                    padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.05)", cursor: "pointer",
                    color: unit.active ? "#f59e0b" : "#34d399", fontSize: "0.75rem", fontWeight: 500
                  }}>
                    {unit.active ? "Desativar" : "Ativar"}
                  </button>
                  <button onClick={() => setDeleteConfirm(unit)} style={{
                    padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.08)", cursor: "pointer",
                    color: "#f87171"
                  }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUnit) && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 32, maxWidth: 440, width: "100%"
          }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e0e7e3", marginBottom: 16 }}>
              {editingUnit ? "Editar Unidade" : "Nova Unidade"}
            </h2>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                Nome
              </label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Unidade Centro"
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                  color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                Slug
              </label>
              <input type="text" value={newSlug} onChange={e => setNewSlug(e.target.value)}
                placeholder="Ex: unidade-centro"
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                  color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                Endereço
              </label>
              <input type="text" value={newAddress} onChange={e => setNewAddress(e.target.value)}
                placeholder="Ex: Rua ABC, 123"
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                  color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 5, fontWeight: 500 }}>
                Telefone
              </label>
              <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)}
                placeholder="Ex: (11) 99999-9999"
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                  color: "#e0e7e3", fontSize: "0.85rem", outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { editingUnit ? setEditingUnit(null) : setShowCreateModal(false); resetForm() }} style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={editingUnit ? handleUpdate : handleCreate} disabled={!newName.trim() || saving} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: "#10b981", color: "#fff",
                cursor: saving || !newName.trim() ? "not-allowed" : "pointer",
                fontSize: "0.82rem", fontWeight: 600, opacity: !newName.trim() ? 0.4 : 1
              }}>
                {saving ? "Salvando..." : editingUnit ? "Salvar" : "Criar"}
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
            <Trash2 size={32} color="#ef4444" style={{ marginBottom: 12 }} />
            <h3 style={{ fontWeight: 700, color: "#e0e7e3", marginBottom: 8 }}>Excluir unidade?</h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
              A unidade <strong style={{ color: "#e0e7e3" }}>{deleteConfirm.name}</strong> será excluída permanentemente.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={saving} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: "#ef4444", color: "#fff", cursor: "pointer",
                fontSize: "0.82rem", fontWeight: 600
              }}>
                {saving ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
