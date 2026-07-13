import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Topbar from "../components/Topbar"
import ServicoForm from "../components/ServicoForm"
import { searchServicos, deleteServico } from "../core/financeiro"
import { useAuth } from "../context/AuthContext"
import type { Servico } from "../types"
import { ArrowLeft, Plus, Search, Edit, Trash2, Tag } from "lucide-react"

export default function Servicos() {
  const navigate = useNavigate()
  const { unidade } = useAuth()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)

  const load = async () => {
    setLoading(true)
    setServicos(await searchServicos(query, unidade))
    setLoading(false)
  }

  useEffect(() => { load() }, [query, unidade])

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return
    await deleteServico(id)
    setServicos(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "url(/cmv_tv.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.015, pointerEvents: "none" }} />
      <Topbar title="Serviços" />
      <main style={{ flex: 1, padding: "30px 40px", overflow: "auto", position: "relative", zIndex: 1 }}>
        <button onClick={() => navigate('/financeiro')} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar serviços..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.9rem", background: "rgba(255,255,255,0.8)", outline: "none" }} />
          </div>
          <button className="btn-magnetic" onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: "0.85rem" }}>
            <Plus size={16} /> Novo Serviço
          </button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Carregando...</div>
        ) : servicos.length === 0 ? (
          <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>Nenhum serviço encontrado.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {servicos.map(s => (
              <div key={s.id} className="antigravity-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(15,118,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Tag size={20} color="var(--color-primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.nome}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{s.categoria} • R$ {s.preco.toFixed(2)}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setEditing(s)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(15,118,110,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <Edit size={13} /> Editar
                  </button>
                  <button onClick={() => handleDelete(s.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", cursor: "pointer", color: "#ef4444" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {showForm && !editing && <ServicoForm unidade={unidade} onSave={(s) => { setServicos(prev => [s, ...prev]); setShowForm(false) }} onClose={() => setShowForm(false)} />}
      {editing && <ServicoForm servico={editing} onSave={(s) => { setServicos(prev => prev.map(x => x.id === s.id ? s : x)); setEditing(null) }} onClose={() => setEditing(null)} />}
    </div>
  )
}
