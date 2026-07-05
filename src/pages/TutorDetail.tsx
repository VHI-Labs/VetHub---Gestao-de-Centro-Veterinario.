import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Topbar from "../components/Topbar"
import TutorForm from "../components/TutorForm"
import PacienteForm from "../components/PacienteForm"
import { getOwner, getPatientsByOwner, deleteOwner } from "../core/ehr"
import type { Owner, Patient } from "../types"
import { ArrowLeft, Edit, Trash2, PawPrint, ChevronRight, Phone, Mail, MapPin, FileText } from "lucide-react"

export default function TutorDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [owner, setOwner] = useState<Owner | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPatientForm, setShowPatientForm] = useState(false)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    const [o, p] = await Promise.all([getOwner(id), getPatientsByOwner(id)])
    setOwner(o)
    setPatients(p)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [id])

  const handleDelete = async () => {
    if (!id || !confirm("Tem certeza que deseja excluir este tutor?")) return
    await deleteOwner(id)
    navigate('/prontuario')
  }

  const speciesBadge = (especie: string) => {
    if (especie === 'Cão') return { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' }
    if (especie === 'Gato') return { bg: 'rgba(236,72,153,0.1)', color: '#db2777' }
    return { bg: 'rgba(16,185,129,0.1)', color: '#059669' }
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Carregando...</div>
  if (!owner) return <div style={{ padding: 40, textAlign: "center" }}>Tutor não encontrado.</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "url(/cmv_tv.png)", backgroundSize: "cover",
        backgroundPosition: "center", opacity: 0.015, pointerEvents: "none", backgroundRepeat: "no-repeat"
      }} />
      <Topbar title="Prontuário Eletrônico" />

      <main style={{ flex: 1, padding: "30px 40px", overflow: "auto", position: "relative", zIndex: 1 }}>
        <button onClick={() => navigate('/prontuario')} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="antigravity-card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary)", marginBottom: 4 }}>{owner.nome}</h1>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
                {owner.cpf && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    <FileText size={14} /> CPF: {owner.cpf}
                  </div>
                )}
                {owner.telefone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    <Phone size={14} /> {owner.telefone}
                  </div>
                )}
                {owner.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    <Mail size={14} /> {owner.email}
                  </div>
                )}
                {owner.endereco && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    <MapPin size={14} /> {owner.endereco}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-magnetic btn-secondary" onClick={() => setShowEditForm(true)} style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 4 }}>
                <Edit size={14} /> Editar
              </button>
              <button onClick={handleDelete} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ef4444", background: "rgba(239,68,68,0.05)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem", fontWeight: 600 }}>
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>Pets Cadastrados</h2>
          <button className="btn-magnetic" onClick={() => setShowPatientForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: "0.85rem" }}>
            <PawPrint size={16} /> Novo Pet
          </button>
        </div>

        {patients.length === 0 ? (
          <div className="antigravity-card" style={{ padding: 32, textAlign: "center", color: "var(--text-light)" }}>
            <PawPrint size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p>Nenhum pet cadastrado para este tutor.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {patients.map(patient => {
              const badge = speciesBadge(patient.especie)
              return (
                <div key={patient.id} className="antigravity-card" onClick={() => navigate(`/prontuario/paciente/${patient.id}`)}
                  style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: badge.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                    {patient.especie === 'Cão' ? '🐕' : patient.especie === 'Gato' ? '🐈' : '🦜'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{patient.nome}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: badge.bg, color: badge.color }}>
                        {patient.especie}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {patient.raca && patient.raca}
                      {patient.idade && ` • ${patient.idade}`}
                      {patient.peso && ` • ${patient.peso}kg`}
                      {patient.microchip && ` • Chip: ${patient.microchip}`}
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showEditForm && (
        <TutorForm owner={owner} onSave={(o) => { setOwner(o); setShowEditForm(false) }} onClose={() => setShowEditForm(false)} />
      )}
      {showPatientForm && (
        <PacienteForm ownerId={owner.id} unidade={owner.unidade} onSave={(p) => { setPatients(prev => [...prev, p]); setShowPatientForm(false) }} onClose={() => setShowPatientForm(false)} />
      )}
    </div>
  )
}
