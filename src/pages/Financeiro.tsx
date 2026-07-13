import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Topbar from "../components/Topbar"
import FaturaForm from "../components/FaturaForm"
import { getFaturas, getFinanceiroDashboard, deleteFatura, addPagamento } from "../core/financeiro"
import { useAuth } from "../context/AuthContext"
import type { Fatura, Pagamento } from "../types"
import { ArrowLeft, Plus, DollarSign, AlertCircle, CheckCircle, Clock, Trash2, Search } from "lucide-react"

export default function Financeiro() {
  const navigate = useNavigate()
  const { unidade } = useAuth()
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [dashboard, setDashboard] = useState({ totalReceita: 0, totalAberto: 0, faturasAbertas: 0, faturasPagas: 0, pagamentosRecentes: [] as Pagamento[] })
  const [filter, setFilter] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [pagamentoFatura, setPagamentoFatura] = useState<Fatura | null>(null)
  const [pagamentoValor, setPagamentoValor] = useState("")
  const [pagamentoMetodo, setPagamentoMetodo] = useState<Pagamento['metodo']>("Dinheiro")

  const load = async () => {
    setLoading(true)
    const [f, d] = await Promise.all([getFaturas(unidade, filter || undefined), getFinanceiroDashboard(unidade)])
    setFaturas(f)
    setDashboard(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [unidade, filter])

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return
    await deleteFatura(id)
    load()
  }

  const handlePagamento = async () => {
    if (!pagamentoFatura || !pagamentoValor || parseFloat(pagamentoValor) <= 0) return
    await addPagamento({ faturaId: pagamentoFatura.id, valor: parseFloat(pagamentoValor), metodo: pagamentoMetodo, dataPagamento: new Date().toISOString(), unidade })
    setPagamentoFatura(null)
    setPagamentoValor("")
    load()
  }

  const statusColor = (s: string) => s === 'Paga' ? { bg: 'rgba(16,185,129,0.1)', color: '#059669' } : s === 'Cancelada' ? { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' } : s === 'Parcial' ? { bg: 'rgba(245,158,11,0.1)', color: '#d97706' } : { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "url(/cmv_tv.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.015, pointerEvents: "none" }} />
      <Topbar title="Financeiro" />
      <main style={{ flex: 1, padding: "30px 40px", overflow: "auto", position: "relative", zIndex: 1 }}>
        <button onClick={() => navigate('/recepcao')} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Receita Total", value: `R$ ${dashboard.totalReceita.toFixed(2)}`, icon: <DollarSign size={20} />, color: "#059669" },
            { label: "Em Aberto", value: `R$ ${dashboard.totalAberto.toFixed(2)}`, icon: <AlertCircle size={20} />, color: "#d97706" },
            { label: "Faturas Pagas", value: dashboard.faturasPagas.toString(), icon: <CheckCircle size={20} />, color: "#059669" },
            { label: "Faturas Abertas", value: dashboard.faturasAbertas.toString(), icon: <Clock size={20} />, color: "#2563eb" }
          ].map((card, i) => (
            <div key={i} className="antigravity-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ color: card.color }}>{card.icon}</div>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>{card.label}</span>
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary)" }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["", "Aberta", "Paga", "Parcial", "Cancelada"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 100, border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, background: filter === f ? "var(--color-primary)" : "rgba(15,118,110,0.06)", color: filter === f ? "#fff" : "var(--text-muted)" }}>
                {f || "Todas"}
              </button>
            ))}
          </div>
          <button className="btn-magnetic" onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: "0.85rem" }}>
            <Plus size={16} /> Nova Fatura
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Carregando...</div>
        ) : faturas.length === 0 ? (
          <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>Nenhuma fatura encontrada.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faturas.map(f => {
              const sc = statusColor(f.status)
              return (
                <div key={f.id} className="antigravity-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Fatura #{f.id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {new Date(f.criadoEm).toLocaleDateString('pt-BR')} • Total: R$ {f.valorTotal.toFixed(2)} • Pago: R$ {f.valorPago.toFixed(2)}
                    </div>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600, background: sc.bg, color: sc.color }}>{f.status}</span>
                  {f.status !== 'Paga' && f.status !== 'Cancelada' && (
                    <button onClick={() => { setPagamentoFatura(f); setPagamentoValor((f.valorTotal - f.valorPago).toFixed(2)) }} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.08)", cursor: "pointer", fontSize: "0.8rem", color: "#059669", fontWeight: 600 }}>
                      Registrar Pagamento
                    </button>
                  )}
                  <button onClick={() => handleDelete(f.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", cursor: "pointer", color: "#ef4444" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showForm && (
        <FaturaForm pacienteId="" unidade={unidade} onSave={() => { setShowForm(false); load() }} onClose={() => setShowForm(false)} />
      )}

      {pagamentoFatura && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setPagamentoFatura(null)}>
          <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, padding: 32 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 16 }}>Registrar Pagamento</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, marginBottom: 4 }}>Valor (R$)</div>
                <input type="number" step="0.01" value={pagamentoValor} onChange={e => setPagamentoValor(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem", background: "rgba(255,255,255,0.8)", outline: "none" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, marginBottom: 4 }}>Método</div>
                <select value={pagamentoMetodo} onChange={e => setPagamentoMetodo(e.target.value as Pagamento['metodo'])} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem", background: "rgba(255,255,255,0.8)", cursor: "pointer" }}>
                  <option value="Dinheiro">Dinheiro</option><option value="Cartao Credito">Cartão Crédito</option><option value="Cartao Debito">Cartão Débito</option><option value="Pix">Pix</option><option value="Transferencia">Transferência</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setPagamentoFatura(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-muted)" }}>Cancelar</button>
              <button onClick={handlePagamento} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#10b981", color: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
