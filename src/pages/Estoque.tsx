import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Topbar from "../components/Topbar"
import MedicamentoForm from "../components/MedicamentoForm"
import MovimentacaoEstoqueForm from "../components/MovimentacaoEstoqueForm"
import { searchMedicamentos, getEstoqueAlertas, deleteMedicamento } from "../core/estoque"
import { useAuth } from "../context/AuthContext"
import type { Medicamento } from "../types"
import { ArrowLeft, Plus, Search, AlertTriangle, Package, ArrowRightLeft, Edit, Trash2 } from "lucide-react"

export default function Estoque() {
  const navigate = useNavigate()
  const { unidade } = useAuth()
  const [meds, setMeds] = useState<Medicamento[]>([])
  const [alertas, setAlertas] = useState<Medicamento[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMed, setEditingMed] = useState<Medicamento | null>(null)
  const [movimentacaoMed, setMovimentacaoMed] = useState<Medicamento | null>(null)

  const load = async () => {
    setLoading(true)
    const [m, a] = await Promise.all([searchMedicamentos(query, unidade), getEstoqueAlertas(unidade)])
    setMeds(m)
    setAlertas(a)
    setLoading(false)
  }

  useEffect(() => { load() }, [query, unidade])

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este medicamento?")) return
    await deleteMedicamento(id)
    setMeds(prev => prev.filter(m => m.id !== id))
  }

  const formatCurrency = (v?: number) => v != null ? `R$ ${v.toFixed(2)}` : '—'

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "url(/cmv_tv.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.015, pointerEvents: "none" }} />
      <Topbar title="Estoque & Farmácia" />
      <main style={{ flex: 1, padding: "30px 40px", overflow: "auto", position: "relative", zIndex: 1 }}>
        <button onClick={() => navigate('/recepcao')} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        {alertas.length > 0 && (
          <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700, color: "#d97706", fontSize: "0.9rem" }}>
              <AlertTriangle size={16} /> Alertas de Estoque
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {alertas.map(a => (
                <span key={a.id} style={{ padding: "4px 10px", borderRadius: 100, fontSize: "0.78rem", fontWeight: 600, background: a.estoqueAtual <= a.estoqueMinimo ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", color: a.estoqueAtual <= a.estoqueMinimo ? "#ef4444" : "#d97706" }}>
                  {a.nome} — {a.estoqueAtual} {a.estoqueAtual <= a.estoqueMinimo ? '(estoque baixo)' : '(vencido)'}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar medicamentos..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.9rem", background: "rgba(255,255,255,0.8)", outline: "none" }} />
          </div>
          <button className="btn-magnetic" onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: "0.85rem" }}>
            <Plus size={16} /> Novo Medicamento
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Carregando...</div>
        ) : meds.length === 0 ? (
          <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>Nenhum medicamento encontrado.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {meds.map(m => (
              <div key={m.id} className="antigravity-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: m.estoqueAtual <= m.estoqueMinimo ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={20} color={m.estoqueAtual <= m.estoqueMinimo ? "#ef4444" : "#059669"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{m.nome}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {m.principioAtivo && <span>{m.principioAtivo}</span>}
                    {m.concentracao && <span>{m.concentracao}</span>}
                    {m.formaFarmaceutica && <span>{m.formaFarmaceutica}</span>}
                    <span>Estoque: <strong style={{ color: m.estoqueAtual <= m.estoqueMinimo ? "#ef4444" : "inherit" }}>{m.estoqueAtual}</strong></span>
                    <span>{formatCurrency(m.precoVenda)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setMovimentacaoMed(m)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(15,118,110,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "var(--color-primary)" }}>
                    <ArrowRightLeft size={13} /> Mover
                  </button>
                  <button onClick={() => setEditingMed(m)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(15,118,110,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <Edit size={13} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "#ef4444" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && !editingMed && (
        <MedicamentoForm unidade={unidade} onSave={(m) => { setMeds(prev => [m, ...prev]); setShowForm(false) }} onClose={() => setShowForm(false)} />
      )}
      {editingMed && (
        <MedicamentoForm medicamento={editingMed} onSave={(m) => { setMeds(prev => prev.map(x => x.id === m.id ? m : x)); setEditingMed(null) }} onClose={() => setEditingMed(null)} />
      )}
      {movimentacaoMed && (
        <MovimentacaoEstoqueForm medicamentoId={movimentacaoMed.id} medicamentoNome={movimentacaoMed.nome} onSave={() => { setMovimentacaoMed(null); load() }} onClose={() => setMovimentacaoMed(null)} />
      )}
    </div>
  )
}
