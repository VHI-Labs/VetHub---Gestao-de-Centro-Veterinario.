import { useState } from "react"
import { createPortal } from "react-dom"
import type { Cirurgia } from "../types"
import { createCirurgia } from "../core/ehr"
import { X } from "lucide-react"

interface CirurgiaFormProps {
  patientId: string
  unidade?: string
  onSave: (cirurgia: Cirurgia) => void
  onClose: () => void
}

export default function CirurgiaForm({ patientId, unidade = '', onSave, onClose }: CirurgiaFormProps) {
  const [tipo, setTipo] = useState("")
  const [dataCirurgia, setDataCirurgia] = useState("")
  const [veterinario, setVeterinario] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!tipo.trim() || !dataCirurgia) return
    setSaving(true)
    const result = await createCirurgia({
      id: '',
      patientId,
      tipo: tipo.trim(),
      dataCirurgia: new Date(dataCirurgia).toISOString(),
      veterinario: veterinario.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
      unidade
    })
    setSaving(false)
    onSave(result)
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem",
    background: "rgba(255,255,255,0.8)", outline: "none"
  }
  const labelStyle: React.CSSProperties = {
    fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4
  }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>Nova Cirurgia</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={labelStyle}>Tipo de Cirurgia *</div>
            <input style={inputStyle} value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Ex: Castração, Ortopedia" />
          </div>
          <div>
            <div style={labelStyle}>Data e Hora *</div>
            <input style={inputStyle} type="datetime-local" value={dataCirurgia} onChange={e => setDataCirurgia(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Veterinário</div>
            <input style={inputStyle} value={veterinario} onChange={e => setVeterinario(e.target.value)} placeholder="Nome do cirurgião" />
          </div>
          <div>
            <div style={labelStyle}>Observações</div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Detalhes da cirurgia..." />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn-magnetic btn-secondary" onClick={onClose} style={{ padding: "10px 20px" }}>Cancelar</button>
          <button className="btn-magnetic" onClick={handleSave} disabled={saving || !tipo.trim()}
            style={{ padding: "10px 24px", opacity: saving || !tipo.trim() ? 0.5 : 1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
