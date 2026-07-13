import { useState } from "react"
import { createPortal } from "react-dom"
import type { EstoqueMovimentacaoTipo } from "../types"
import { createMovimentacao } from "../core/estoque"
import { useAuth } from "../context/AuthContext"
import { X } from "lucide-react"

interface MovimentacaoEstoqueFormProps {
  medicamentoId: string
  medicamentoNome: string
  onSave: () => void
  onClose: () => void
}

export default function MovimentacaoEstoqueForm({ medicamentoId, medicamentoNome, onSave, onClose }: MovimentacaoEstoqueFormProps) {
  const { user, unidade } = useAuth()
  const [tipo, setTipo] = useState<EstoqueMovimentacaoTipo>('Entrada')
  const [quantidade, setQuantidade] = useState("")
  const [motivo, setMotivo] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!quantidade || parseInt(quantidade) <= 0) return
    setSaving(true)
    await createMovimentacao({
      medicamentoId,
      tipo,
      quantidade: parseInt(quantidade),
      motivo: motivo.trim() || undefined,
      usuarioId: user?.id,
      unidade
    })
    setSaving(false)
    onSave()
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem", background: "rgba(255,255,255,0.8)", outline: "none" }
  const labelStyle: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-primary)" }}>Movimentar Estoque</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={22} /></button>
        </div>
        <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(15,118,110,0.06)", marginBottom: 16, fontSize: "0.9rem", fontWeight: 600 }}>{medicamentoNome}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={labelStyle}>Tipo *</div>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={tipo} onChange={e => setTipo(e.target.value as EstoqueMovimentacaoTipo)}>
              <option value="Entrada">Entrada</option>
              <option value="Saida">Saída</option>
              <option value="Ajuste">Ajuste</option>
              <option value="Perda">Perda</option>
            </select>
          </div>
          <div>
            <div style={labelStyle}>Quantidade *</div>
            <input style={inputStyle} type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" />
          </div>
          <div>
            <div style={labelStyle}>Motivo</div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Motivo da movimentação..." />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn-magnetic btn-secondary" onClick={onClose} style={{ padding: "10px 20px" }}>Cancelar</button>
          <button className="btn-magnetic" onClick={handleSave} disabled={saving || !quantidade || parseInt(quantidade) <= 0} style={{ padding: "10px 24px", opacity: saving ? 0.5 : 1 }}>
            {saving ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
