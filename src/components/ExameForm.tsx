import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import type { Exame } from "../types"
import { createExame, updateExame } from "../core/ehr"
import { X } from "lucide-react"

interface ExameFormProps {
  patientId: string
  unidade?: string
  exame?: Exame
  onSave: (exame: Exame) => void
  onClose: () => void
}

export default function ExameForm({ patientId, unidade = '', exame, onSave, onClose }: ExameFormProps) {
  const [tipoExame, setTipoExame] = useState("")
  const [dataExame, setDataExame] = useState(new Date().toISOString().split('T')[0])
  const [resultado, setResultado] = useState("")
  const [veterinario, setVeterinario] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (exame) {
      setTipoExame(exame.tipoExame || '')
      setDataExame(exame.dataExame || '')
      setResultado(exame.resultado || '')
      setVeterinario(exame.veterinario || '')
    }
  }, [exame])

  const handleSave = async () => {
    if (!tipoExame.trim() || !dataExame) return
    setSaving(true)
    if (exame?.id) {
      await updateExame(exame.id, {
        tipoExame: tipoExame.trim(),
        resultado: resultado.trim() || undefined,
        dataExame,
        veterinario: veterinario.trim() || undefined
      })
      onSave({ ...exame, tipoExame: tipoExame.trim(), dataExame })
    } else {
      const result = await createExame({
        id: '',
        patientId,
        tipoExame: tipoExame.trim(),
        resultado: resultado.trim() || undefined,
        dataExame,
        veterinario: veterinario.trim() || undefined,
        unidade
      })
      onSave(result)
    }
    setSaving(false)
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
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>{exame ? 'Editar Exame' : 'Novo Exame'}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={labelStyle}>Tipo de Exame *</div>
            <input style={inputStyle} value={tipoExame} onChange={e => setTipoExame(e.target.value)} placeholder="Ex: Hemograma, Raio-X, Ultrassom" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>Data do Exame *</div>
              <input style={inputStyle} type="date" value={dataExame} onChange={e => setDataExame(e.target.value)} />
            </div>
            <div>
              <div style={labelStyle}>Veterinário</div>
              <input style={inputStyle} value={veterinario} onChange={e => setVeterinario(e.target.value)} placeholder="Nome do veterinário" />
            </div>
          </div>
          <div>
            <div style={labelStyle}>Resultado</div>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={resultado} onChange={e => setResultado(e.target.value)} placeholder="Resultado do exame..." />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn-magnetic btn-secondary" onClick={onClose} style={{ padding: "10px 20px" }}>Cancelar</button>
          <button className="btn-magnetic" onClick={handleSave} disabled={saving || !tipoExame.trim()}
            style={{ padding: "10px 24px", opacity: saving || !tipoExame.trim() ? 0.5 : 1 }}>
            {saving ? "Salvando..." : (exame ? "Atualizar" : "Salvar")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
