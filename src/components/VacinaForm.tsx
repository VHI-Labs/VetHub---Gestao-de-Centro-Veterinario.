import { useState } from "react"
import { createPortal } from "react-dom"
import type { Vacina } from "../types"
import { createVacina } from "../core/ehr"
import { X } from "lucide-react"

interface VacinaFormProps {
  patientId: string
  unidade?: string
  onSave: (vacina: Vacina) => void
  onClose: () => void
}

export default function VacinaForm({ patientId, unidade = '', onSave, onClose }: VacinaFormProps) {
  const [nome, setNome] = useState("")
  const [dataAplicacao, setDataAplicacao] = useState(new Date().toISOString().split('T')[0])
  const [dataProxima, setDataProxima] = useState("")
  const [lote, setLote] = useState("")
  const [veterinario, setVeterinario] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!nome.trim() || !dataAplicacao) return
    setSaving(true)
    const result = await createVacina({
      id: '',
      patientId,
      nome: nome.trim(),
      dataAplicacao,
      dataProxima: dataProxima || undefined,
      lote: lote.trim() || undefined,
      veterinario: veterinario.trim() || undefined,
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
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>Nova Vacina</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={labelStyle}>Nome da Vacina *</div>
            <input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: V8, V10, Raiva" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>Data de Aplicação *</div>
              <input style={inputStyle} type="date" value={dataAplicacao} onChange={e => setDataAplicacao(e.target.value)} />
            </div>
            <div>
              <div style={labelStyle}>Próxima Dose</div>
              <input style={inputStyle} type="date" value={dataProxima} onChange={e => setDataProxima(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>Lote</div>
              <input style={inputStyle} value={lote} onChange={e => setLote(e.target.value)} placeholder="Número do lote" />
            </div>
            <div>
              <div style={labelStyle}>Veterinário</div>
              <input style={inputStyle} value={veterinario} onChange={e => setVeterinario(e.target.value)} placeholder="Nome do veterinário" />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn-magnetic btn-secondary" onClick={onClose} style={{ padding: "10px 20px" }}>Cancelar</button>
          <button className="btn-magnetic" onClick={handleSave} disabled={saving || !nome.trim()}
            style={{ padding: "10px 24px", opacity: saving || !nome.trim() ? 0.5 : 1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
