import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Topbar from "../components/Topbar"
import VeterinarioForm from "../components/VeterinarioForm"
import { searchVeterinarios, deleteVeterinario } from "../core/veterinarios"
import { useAuth } from "../context/AuthContext"
import type { Veterinario } from "../types"
import { ArrowLeft, Plus, Search, Edit, Trash2, Stethoscope } from "lucide-react"

export default function Veterinarios() {
  const navigate = useNavigate()
  const { unidade } = useAuth()
  const [vets, setVets] = useState<Veterinario[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVet, setEditingVet] = useState<Veterinario | null>(null)

  const load = async () => {
    setLoading(true)
    const data = await searchVeterinarios(query, unidade)
    setVets(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [query, unidade])

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este veterinário?")) return
    await deleteVeterinario(id)
    setVets(prev => prev.filter(v => v.id !== id))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "url(/cmv_tv.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.015, pointerEvents: "none" }} />
      <Topbar title="Veterinários" />
      <main style={{ flex: 1, padding: "30px 40px", overflow: "auto", position: "relative", zIndex: 1 }}>
        <button onClick={() => navigate('/recepcao')} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar veterinários..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.9rem", background: "rgba(255,255,255,0.8)", outline: "none" }} />
          </div>
          <button className="btn-magnetic" onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: "0.85rem" }}>
            <Plus size={16} /> Novo Veterinário
          </button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Carregando...</div>
        ) : vets.length === 0 ? (
          <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>Nenhum veterinário encontrado.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {vets.map(v => (
              <div key={v.id} className="antigravity-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(15,118,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Stethoscope size={20} color="var(--color-primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Dr(a). {v.nome}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {v.crmv && <span>CRMV: {v.crmv}</span>}
                    {v.especialidade && <span>{v.especialidade}</span>}
                    {v.telefone && <span>{v.telefone}</span>}
                    {v.email && <span>{v.email}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setEditingVet(v)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(15,118,110,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <Edit size={13} /> Editar
                  </button>
                  <button onClick={() => handleDelete(v.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "#ef4444" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {showForm && !editingVet && (
        <VeterinarioForm unidade={unidade} onSave={(v) => { setVets(prev => [v, ...prev]); setShowForm(false) }} onClose={() => setShowForm(false)} />
      )}
      {editingVet && (
        <VeterinarioForm veterinario={editingVet} onSave={(v) => { setVets(prev => prev.map(x => x.id === v.id ? v : x)); setEditingVet(null) }} onClose={() => setEditingVet(null)} />
      )}
    </div>
  )
}
