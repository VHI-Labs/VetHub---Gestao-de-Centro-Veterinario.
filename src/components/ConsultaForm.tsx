import { useState } from "react"
import { createPortal } from "react-dom"
import type { Consulta } from "../types"
import { createConsulta } from "../core/ehr"
import { X } from "lucide-react"

interface ConsultaFormProps {
  patientId: string
  unidade?: string
  onSave: (consulta: Consulta) => void
  onClose: () => void
}

export default function ConsultaForm({ patientId, unidade = '', onSave, onClose }: ConsultaFormProps) {
  const [veterinario, setVeterinario] = useState("")
  const [motivo, setMotivo] = useState("")
  const [exameFisico, setExameFisico] = useState("")
  const [diagnostico, setDiagnostico] = useState("")
  const [prescricao, setPrescricao] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!motivo.trim() || !veterinario.trim()) return
    setSaving(true)
    const result = await createConsulta({
      id: '',
      patientId,
      veterinario: veterinario.trim(),
      motivo: motivo.trim(),
      exameFisico: exameFisico.trim() || undefined,
      diagnostico: diagnostico.trim() || undefined,
      prescricao: prescricao.trim() || undefined,
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
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 640, padding: 32, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>Nova Consulta</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={labelStyle}>Veterinário Responsável *</div>
            <input style={inputStyle} value={veterinario} onChange={e => setVeterinario(e.target.value)} placeholder="Nome do veterinário" />
          </div>
          <div>
            <div style={labelStyle}>Motivo da Consulta *</div>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Queixa principal do tutor..." />
          </div>
          <div>
            <div style={labelStyle}>Exame Físico</div>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={exameFisico} onChange={e => setExameFisico(e.target.value)} placeholder="Achados do exame clínico..." />
          </div>
          <div>
            <div style={labelStyle}>Diagnóstico</div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={diagnostico} onChange={e => setDiagnostico(e.target.value)} placeholder="Hipótese diagnóstica..." />
          </div>
          <div>
            <div style={labelStyle}>Prescrição</div>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={prescricao} onChange={e => setPrescricao(e.target.value)} placeholder="Medicamentos, dosagens, orientações..." />
          </div>
          <div>
            <div style={labelStyle}>Observações</div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações adicionais..." />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn-magnetic btn-secondary" onClick={onClose} style={{ padding: "10px 20px" }}>Cancelar</button>
          <button className="btn-magnetic" onClick={handleSave} disabled={saving || !motivo.trim() || !veterinario.trim()}
            style={{ padding: "10px 24px", opacity: saving || !motivo.trim() || !veterinario.trim() ? 0.5 : 1 }}>
            {saving ? "Salvando..." : "Salvar Consulta"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
