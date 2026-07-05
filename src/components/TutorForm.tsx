import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import type { Owner } from "../types"
import { createOwner, updateOwner } from "../core/ehr"
import { X } from "lucide-react"

interface TutorFormProps {
  owner?: Owner | null
  unidade?: string
  onSave: (owner: Owner) => void
  onClose: () => void
}

export default function TutorForm({ owner, unidade = '', onSave, onClose }: TutorFormProps) {
  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [endereco, setEndereco] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (owner) {
      setNome(owner.nome)
      setCpf(owner.cpf || "")
      setTelefone(owner.telefone || "")
      setEmail(owner.email || "")
      setEndereco(owner.endereco || "")
    }
  }, [owner])

  const formatCpf = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 11)
    return nums.replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  const formatPhone = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 10) {
      return nums.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
    }
    return nums.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
  }

  const handleSave = async () => {
    if (!nome.trim()) return
    setSaving(true)
    const data: Omit<Owner, 'criadoEm' | 'atualizadoEm'> = {
      id: owner?.id || '',
      nome: nome.trim(),
      cpf: cpf.replace(/\D/g, '') || undefined,
      telefone: telefone.replace(/\D/g, '') || undefined,
      email: email.trim() || undefined,
      endereco: endereco.trim() || undefined,
      unidade
    }
    let result: Owner
    if (owner?.id) {
      await updateOwner(owner.id, data)
      result = { ...owner, ...data, atualizadoEm: new Date().toISOString() }
    } else {
      result = await createOwner(data)
    }
    setSaving(false)
    onSave(result)
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem",
    background: "rgba(255,255,255,0.8)", outline: "none",
    transition: "border-color 0.2s"
  }
  const labelStyle: React.CSSProperties = {
    fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4
  }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, padding: 32, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>
            {owner ? "Editar Tutor" : "Novo Tutor"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={labelStyle}>Nome Completo *</div>
            <input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do tutor" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>CPF</div>
              <input style={inputStyle} value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} />
            </div>
            <div>
              <div style={labelStyle}>Telefone</div>
              <input style={inputStyle} value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} />
            </div>
          </div>
          <div>
            <div style={labelStyle}>Email</div>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div>
            <div style={labelStyle}>Endereço</div>
            <input style={inputStyle} value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, bairro, cidade" />
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
