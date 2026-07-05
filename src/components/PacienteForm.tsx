import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import type { Patient, Species } from "../types"
import { createPatient, updatePatient } from "../core/ehr"
import { X } from "lucide-react"

interface PacienteFormProps {
  patient?: Patient | null
  ownerId?: string
  unidade?: string
  onSave: (patient: Patient) => void
  onClose: () => void
}

export default function PacienteForm({ patient, ownerId, unidade = '', onSave, onClose }: PacienteFormProps) {
  const [nome, setNome] = useState("")
  const [especie, setEspecie] = useState<Species>("Cão")
  const [raca, setRaca] = useState("")
  const [sexo, setSexo] = useState("")
  const [pelagem, setPelagem] = useState("")
  const [peso, setPeso] = useState("")
  const [idade, setIdade] = useState("")
  const [microchip, setMicrochip] = useState("")
  const [alergias, setAlergias] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (patient) {
      setNome(patient.nome)
      setEspecie(patient.especie)
      setRaca(patient.raca || "")
      setSexo(patient.sexo || "")
      setPelagem(patient.pelagem || "")
      setPeso(patient.peso != null ? String(patient.peso) : "")
      setIdade(patient.idade || "")
      setMicrochip(patient.microchip || "")
      setAlergias(patient.alergias || "")
      setObservacoes(patient.observacoes || "")
    }
  }, [patient])

  const handleSave = async () => {
    if (!nome.trim()) return
    setSaving(true)
    const data: Omit<Patient, 'criadoEm' | 'atualizadoEm'> = {
      id: patient?.id || '',
      ownerId: patient?.ownerId || ownerId || undefined,
      nome: nome.trim(),
      especie,
      raca: raca.trim() || undefined,
      sexo: sexo || undefined,
      pelagem: pelagem.trim() || undefined,
      peso: peso ? parseFloat(peso) : undefined,
      idade: idade.trim() || undefined,
      microchip: microchip.trim() || undefined,
      alergias: alergias.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
      unidade
    }
    let result: Patient
    if (patient?.id) {
      await updatePatient(patient.id, data)
      result = { ...patient, ...data, atualizadoEm: new Date().toISOString() }
    } else {
      result = await createPatient(data)
    }
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
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 600, padding: 32, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>
            {patient ? "Editar Paciente" : "Novo Paciente"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={labelStyle}>Nome do Pet *</div>
              <input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do paciente" />
            </div>
            <div>
              <div style={labelStyle}>Espécie *</div>
              <select style={selectStyle} value={especie} onChange={e => setEspecie(e.target.value as Species)}>
                <option value="Cão">Cão</option>
                <option value="Gato">Gato</option>
                <option value="Animais Silvestres">Animais Silvestres</option>
              </select>
            </div>
            <div>
              <div style={labelStyle}>Raça</div>
              <input style={inputStyle} value={raca} onChange={e => setRaca(e.target.value)} placeholder="Ex: Labrador" />
            </div>
            <div>
              <div style={labelStyle}>Sexo</div>
              <select style={selectStyle} value={sexo} onChange={e => setSexo(e.target.value)}>
                <option value="">Selecione</option>
                <option value="Macho">Macho</option>
                <option value="Femea">Fêmea</option>
              </select>
            </div>
            <div>
              <div style={labelStyle}>Pelagem</div>
              <input style={inputStyle} value={pelagem} onChange={e => setPelagem(e.target.value)} placeholder="Ex: Curta, Longa" />
            </div>
            <div>
              <div style={labelStyle}>Peso (kg)</div>
              <input style={inputStyle} type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ex: 12.5" />
            </div>
            <div>
              <div style={labelStyle}>Idade</div>
              <input style={inputStyle} value={idade} onChange={e => setIdade(e.target.value)} placeholder="Ex: 3 anos" />
            </div>
            <div>
              <div style={labelStyle}>Microchip</div>
              <input style={inputStyle} value={microchip} onChange={e => setMicrochip(e.target.value)} placeholder="Número do microchip" />
            </div>
          </div>
          <div>
            <div style={labelStyle}>Alergias Conhecidas</div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={alergias} onChange={e => setAlergias(e.target.value)} placeholder="Descreva alergias conhecidas..." />
          </div>
          <div>
            <div style={labelStyle}>Observações</div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações gerais sobre o paciente..." />
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
