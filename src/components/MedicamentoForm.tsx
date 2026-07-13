import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import type { Medicamento } from "../types"
import { createMedicamento, updateMedicamento } from "../core/estoque"
import { X } from "lucide-react"

interface MedicamentoFormProps {
  medicamento?: Medicamento
  unidade?: string
  onSave: (m: Medicamento) => void
  onClose: () => void
}

export default function MedicamentoForm({ medicamento, unidade = '', onSave, onClose }: MedicamentoFormProps) {
  const [nome, setNome] = useState("")
  const [principioAtivo, setPrincipioAtivo] = useState("")
  const [fabricante, setFabricante] = useState("")
  const [formaFarmaceutica, setFormaFarmaceutica] = useState("")
  const [concentracao, setConcentracao] = useState("")
  const [unidadeMedida, setUnidadeMedida] = useState("")
  const [precoCusto, setPrecoCusto] = useState("")
  const [precoVenda, setPrecoVenda] = useState("")
  const [estoqueMinimo, setEstoqueMinimo] = useState("")
  const [estoqueAtual, setEstoqueAtual] = useState("")
  const [validade, setValidade] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (medicamento) {
      setNome(medicamento.nome || '')
      setPrincipioAtivo(medicamento.principioAtivo || '')
      setFabricante(medicamento.fabricante || '')
      setFormaFarmaceutica(medicamento.formaFarmaceutica || '')
      setConcentracao(medicamento.concentracao || '')
      setUnidadeMedida(medicamento.unidadeMedida || '')
      setPrecoCusto(medicamento.precoCusto?.toString() || '')
      setPrecoVenda(medicamento.precoVenda?.toString() || '')
      setEstoqueMinimo(medicamento.estoqueMinimo?.toString() || '')
      setEstoqueAtual(medicamento.estoqueAtual?.toString() || '')
      setValidade(medicamento.validade || '')
    }
  }, [medicamento])

  const handleSave = async () => {
    if (!nome.trim()) return
    setSaving(true)
    const payload = {
      nome: nome.trim(),
      principioAtivo: principioAtivo.trim() || undefined,
      fabricante: fabricante.trim() || undefined,
      formaFarmaceutica: formaFarmaceutica.trim() || undefined,
      concentracao: concentracao.trim() || undefined,
      unidadeMedida: unidadeMedida.trim() || undefined,
      precoCusto: precoCusto ? parseFloat(precoCusto) : undefined,
      precoVenda: precoVenda ? parseFloat(precoVenda) : undefined,
      estoqueMinimo: parseInt(estoqueMinimo) || 0,
      estoqueAtual: parseInt(estoqueAtual) || 0,
      validade: validade || undefined,
      unidade
    }
    if (medicamento?.id) {
      await updateMedicamento(medicamento.id, payload)
      onSave({ ...medicamento, ...payload })
    } else {
      const result = await createMedicamento({ id: '', ...payload, ativo: true })
      onSave(result)
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem", background: "rgba(255,255,255,0.8)", outline: "none" }
  const labelStyle: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, padding: 32, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary)" }}>{medicamento ? 'Editar Medicamento' : 'Novo Medicamento'}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={22} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><div style={labelStyle}>Nome *</div><input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do medicamento" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Princípio Ativo</div><input style={inputStyle} value={principioAtivo} onChange={e => setPrincipioAtivo(e.target.value)} placeholder="Ex: Amoxicilina" /></div>
            <div><div style={labelStyle}>Fabricante</div><input style={inputStyle} value={fabricante} onChange={e => setFabricante(e.target.value)} placeholder="Ex: Zoetis" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Forma</div><input style={inputStyle} value={formaFarmaceutica} onChange={e => setFormaFarmaceutica(e.target.value)} placeholder="Comprimido" /></div>
            <div><div style={labelStyle}>Concentração</div><input style={inputStyle} value={concentracao} onChange={e => setConcentracao(e.target.value)} placeholder="500mg" /></div>
            <div><div style={labelStyle}>Unidade</div><input style={inputStyle} value={unidadeMedida} onChange={e => setUnidadeMedida(e.target.value)} placeholder="Caixa" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Preço Custo (R$)</div><input style={inputStyle} type="number" step="0.01" value={precoCusto} onChange={e => setPrecoCusto(e.target.value)} placeholder="0.00" /></div>
            <div><div style={labelStyle}>Preço Venda (R$)</div><input style={inputStyle} type="number" step="0.01" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} placeholder="0.00" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Estoque Mínimo</div><input style={inputStyle} type="number" value={estoqueMinimo} onChange={e => setEstoqueMinimo(e.target.value)} placeholder="0" /></div>
            <div><div style={labelStyle}>Estoque Atual</div><input style={inputStyle} type="number" value={estoqueAtual} onChange={e => setEstoqueAtual(e.target.value)} placeholder="0" /></div>
            <div><div style={labelStyle}>Validade</div><input style={inputStyle} type="date" value={validade} onChange={e => setValidade(e.target.value)} /></div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn-magnetic btn-secondary" onClick={onClose} style={{ padding: "10px 20px" }}>Cancelar</button>
          <button className="btn-magnetic" onClick={handleSave} disabled={saving || !nome.trim()} style={{ padding: "10px 24px", opacity: saving || !nome.trim() ? 0.5 : 1 }}>
            {saving ? "Salvando..." : (medicamento ? "Atualizar" : "Salvar")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
