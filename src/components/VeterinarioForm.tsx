import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import type { Veterinario } from "../types"
import { createVeterinario, updateVeterinario } from "../core/veterinarios"
import { X } from "lucide-react"

interface VeterinarioFormProps {
  veterinario?: Veterinario
  unidade?: string
  onSave: (v: Veterinario) => void
  onClose: () => void
}

export default function VeterinarioForm({ veterinario, unidade = '', onSave, onClose }: VeterinarioFormProps) {
  const [nome, setNome] = useState("")
  const [crmv, setCrmv] = useState("")
  const [especialidade, setEspecialidade] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (veterinario) {
      setNome(veterinario.nome || '')
      setCrmv(veterinario.crmv || '')
      setEspecialidade(veterinario.especialidade || '')
      setTelefone(veterinario.telefone || '')
      setEmail(veterinario.email || '')
    }
  }, [veterinario])

  const handleSave = async () => {
    if (!nome.trim()) return
    setSaving(true)
    if (veterinario?.id) {
      await updateVeterinario(veterinario.id, {
        nome: nome.trim(),
        crmv: crmv.trim() || undefined,
        especialidade: especialidade.trim() || undefined,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined
      })
      onSave({ ...veterinario, nome: nome.trim(), crmv: crmv.trim() || undefined, especialidade: especialidade.trim() || undefined, telefone: telefone.trim() || undefined, email: email.trim() || undefined })
    } else {
      const result = await createVeterinario({
        id: '', nome: nome.trim(), crmv: crmv.trim() || undefined,
        especialidade: especialidade.trim() || undefined, telefone: telefone.trim() || undefined,
        email: email.trim() || undefined, ativo: true, unidade
      })
      onSave(result)
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem", background: "rgba(255,255,255,0.8)", outline: "none" }
  const labelStyle: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>{veterinario ? 'Editar Veterinário' : 'Novo Veterinário'}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={22} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={labelStyle}>Nome *</div>
            <input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>CRMV</div>
              <input style={inputStyle} value={crmv} onChange={e => setCrmv(e.target.value)} placeholder="Registro CRMV" />
            </div>
            <div>
              <div style={labelStyle}>Especialidade</div>
              <input style={inputStyle} value={especialidade} onChange={e => setEspecialidade(e.target.value)} placeholder="Ex: Clínica Geral" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>Telefone</div>
              <input style={inputStyle} value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <div style={labelStyle}>Email</div>
              <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn-magnetic btn-secondary" onClick={onClose} style={{ padding: "10px 20px" }}>Cancelar</button>
          <button className="btn-magnetic" onClick={handleSave} disabled={saving || !nome.trim()} style={{ padding: "10px 24px", opacity: saving || !nome.trim() ? 0.5 : 1 }}>
            {saving ? "Salvando..." : (veterinario ? "Atualizar" : "Salvar")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
