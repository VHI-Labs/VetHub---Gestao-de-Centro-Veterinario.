import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import type { Servico } from "../types"
import { createServico, updateServico } from "../core/financeiro"
import { X } from "lucide-react"

interface ServicoFormProps { servico?: Servico; unidade?: string; onSave: (s: Servico) => void; onClose: () => void }

export default function ServicoForm({ servico, unidade = '', onSave, onClose }: ServicoFormProps) {
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState("Consulta")
  const [preco, setPreco] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (servico) { setNome(servico.nome || ''); setDescricao(servico.descricao || ''); setCategoria(servico.categoria || 'Consulta'); setPreco(servico.preco?.toString() || '') }
  }, [servico])

  const handleSave = async () => {
    if (!nome.trim() || !preco) return
    setSaving(true)
    const payload = { nome: nome.trim(), descricao: descricao.trim() || undefined, categoria, preco: parseFloat(preco), ativo: true, unidade }
    if (servico?.id) { await updateServico(servico.id, payload); onSave({ ...servico, ...payload }) }
    else { const r = await createServico({ id: '', ...payload }); onSave(r) }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem", background: "rgba(255,255,255,0.8)", outline: "none" }
  const labelStyle: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>{servico ? 'Editar Serviço' : 'Novo Serviço'}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={22} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><div style={labelStyle}>Nome *</div><input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do serviço" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Categoria</div>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="Consulta">Consulta</option><option value="Cirurgia">Cirurgia</option><option value="Exame">Exame</option><option value="Vacina">Vacina</option><option value="Procedimento">Procedimento</option>
              </select>
            </div>
            <div><div style={labelStyle}>Preço (R$) *</div><input style={inputStyle} type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0.00" /></div>
          </div>
          <div><div style={labelStyle}>Descrição</div><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição do serviço..." /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn-magnetic btn-secondary" onClick={onClose} style={{ padding: "10px 20px" }}>Cancelar</button>
          <button className="btn-magnetic" onClick={handleSave} disabled={saving || !nome.trim() || !preco} style={{ padding: "10px 24px", opacity: saving ? 0.5 : 1 }}>
            {saving ? "Salvando..." : (servico ? "Atualizar" : "Salvar")}
          </button>
        </div>
      </div>
    </div>, document.body
  )
}
