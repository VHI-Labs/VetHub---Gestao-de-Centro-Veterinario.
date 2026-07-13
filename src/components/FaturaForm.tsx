import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import type { Fatura, FaturaItem, Servico } from "../types"
import { createFatura, searchServicos, addFaturaItem, addPagamento } from "../core/financeiro"
import { useAuth } from "../context/AuthContext"
import { X, Plus, Trash2 } from "lucide-react"

interface FaturaFormProps { pacienteId: string; ownerId?: string; unidade?: string; onSave: (f: Fatura) => void; onClose: () => void }

export default function FaturaForm({ pacienteId, ownerId, unidade = '', onSave, onClose }: FaturaFormProps) {
  const { user } = useAuth()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [itens, setItens] = useState<{ descricao: string; quantidade: number; precoUnitario: number; servicoId?: string }[]>([])
  const [selectedServico, setSelectedServico] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => { searchServicos('', unidade).then(setServicos) }, [unidade])

  const addItem = () => {
    const srv = servicos.find(s => s.id === selectedServico)
    if (srv) {
      setItens(prev => [...prev, { descricao: srv.nome, quantidade: 1, precoUnitario: srv.preco, servicoId: srv.id }])
      setSelectedServico("")
    }
  }

  const removeItem = (idx: number) => setItens(prev => prev.filter((_, i) => i !== idx))

  const total = itens.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0)

  const handleSave = async () => {
    if (itens.length === 0) return
    setSaving(true)
    const fatura = await createFatura({ id: '', pacienteId, ownerId, status: 'Aberta', valorTotal: total, valorPago: 0, observacoes: observacoes.trim() || undefined, unidade })
    for (const item of itens) {
      await addFaturaItem({ faturaId: fatura.id, servicoId: item.servicoId, descricao: item.descricao, quantidade: item.quantidade, precoUnitario: item.precoUnitario, subtotal: item.quantidade * item.precoUnitario })
    }
    onSave({ ...fatura, valorTotal: total })
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem", background: "rgba(255,255,255,0.8)", outline: "none" }
  const labelStyle: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, padding: 32, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>Nova Fatura</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={22} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Adicionar Serviço</div>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={selectedServico} onChange={e => setSelectedServico(e.target.value)}>
                <option value="">Selecione...</option>
                {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} — R$ {s.preco.toFixed(2)}</option>)}
              </select>
            </div>
            <button onClick={addItem} disabled={!selectedServico} style={{ alignSelf: "flex-end", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(15,118,110,0.15)", background: "rgba(15,118,110,0.06)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem", color: "var(--color-primary)", fontWeight: 600, opacity: !selectedServico ? 0.5 : 1 }}>
              <Plus size={14} /> Adicionar
            </button>
          </div>
          {itens.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {itens.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(15,118,110,0.04)" }}>
                  <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: 600 }}>{item.descricao}</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Qtd: {item.quantidade}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</span>
                  <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Trash2 size={14} /></button>
                </div>
              ))}
              <div style={{ textAlign: "right", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-primary)", marginTop: 4 }}>
                Total: R$ {total.toFixed(2)}
              </div>
            </div>
          )}
          <div><div style={labelStyle}>Observações</div><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações..." /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn-magnetic btn-secondary" onClick={onClose} style={{ padding: "10px 20px" }}>Cancelar</button>
          <button className="btn-magnetic" onClick={handleSave} disabled={saving || itens.length === 0} style={{ padding: "10px 24px", opacity: saving ? 0.5 : 1 }}>
            {saving ? "Salvando..." : "Criar Fatura"}
          </button>
        </div>
      </div>
    </div>, document.body
  )
}
