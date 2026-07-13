import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Topbar from "../components/Topbar"
import PacienteForm from "../components/PacienteForm"
import ConsultaForm from "../components/ConsultaForm"
import VacinaForm from "../components/VacinaForm"
import CirurgiaForm from "../components/CirurgiaForm"
import ExameForm from "../components/ExameForm"
import { getPatient, deletePatient, getConsultasByPatient, getVacinasByPatient, getCirurgiasByPatient, getExamesByPatient, getAgendamentosByPatient, deleteConsulta, deleteVacina, deleteCirurgia, deleteExame } from "../core/ehr"
import type { Patient, Consulta, Vacina, Cirurgia, Exame, Agendamento } from "../types"
import { ArrowLeft, Edit, Trash2, Plus, Calendar } from "lucide-react"

type MedTab = 'consultas' | 'vacinas' | 'cirurgias' | 'exames' | 'agendamentos'

export default function PacienteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [medTab, setMedTab] = useState<MedTab>('consultas')
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [vacinas, setVacinas] = useState<Vacina[]>([])
  const [cirurgias, setCirurgias] = useState<Cirurgia[]>([])
  const [exames, setExames] = useState<Exame[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showConsultaForm, setShowConsultaForm] = useState(false)
  const [showVacinaForm, setShowVacinaForm] = useState(false)
  const [showCirurgiaForm, setShowCirurgiaForm] = useState(false)
  const [showExameForm, setShowExameForm] = useState(false)
  const [editingConsulta, setEditingConsulta] = useState<Consulta | null>(null)
  const [editingVacina, setEditingVacina] = useState<Vacina | null>(null)
  const [editingCirurgia, setEditingCirurgia] = useState<Cirurgia | null>(null)
  const [editingExame, setEditingExame] = useState<Exame | null>(null)

  const loadAll = async () => {
    if (!id) return
    setLoading(true)
    const [p, c, v, ci, e, a] = await Promise.all([
      getPatient(id),
      getConsultasByPatient(id),
      getVacinasByPatient(id),
      getCirurgiasByPatient(id),
      getExamesByPatient(id),
      getAgendamentosByPatient(id)
    ])
    setPatient(p)
    setConsultas(c)
    setVacinas(v)
    setCirurgias(ci)
    setExames(e)
    setAgendamentos(a)
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [id])

  const handleDelete = async () => {
    if (!id || !confirm("Tem certeza que deseja excluir este paciente?")) return
    await deletePatient(id)
    navigate('/prontuario')
  }

  const handleDeleteConsulta = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta consulta?")) return
    await deleteConsulta(id)
    setConsultas(prev => prev.filter(c => c.id !== id))
  }
  const handleDeleteVacina = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta vacina?")) return
    await deleteVacina(id)
    setVacinas(prev => prev.filter(v => v.id !== id))
  }
  const handleDeleteCirurgia = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta cirurgia?")) return
    await deleteCirurgia(id)
    setCirurgias(prev => prev.filter(c => c.id !== id))
  }
  const handleDeleteExame = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este exame?")) return
    await deleteExame(id)
    setExames(prev => prev.filter(e => e.id !== id))
  }

  const speciesBadge = (especie: string) => {
    if (especie === 'Cão') return { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', emoji: '🐕' }
    if (especie === 'Gato') return { bg: 'rgba(236,72,153,0.1)', color: '#db2777', emoji: '🐈' }
    return { bg: 'rgba(16,185,129,0.1)', color: '#059669', emoji: '🦜' }
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Carregando...</div>
  if (!patient) return <div style={{ padding: 40, textAlign: "center" }}>Paciente não encontrado.</div>

  const badge = speciesBadge(patient.especie)
  const medTabs: { key: MedTab; label: string; count: number }[] = [
    { key: 'consultas', label: 'Consultas', count: consultas.length },
    { key: 'vacinas', label: 'Vacinas', count: vacinas.length },
    { key: 'cirurgias', label: 'Cirurgias', count: cirurgias.length },
    { key: 'exames', label: 'Exames', count: exames.length },
    { key: 'agendamentos', label: 'Agendamentos', count: agendamentos.length },
  ]

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')
  const formatDateTime = (d: string) => new Date(d).toLocaleString('pt-BR')

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

        {/* Patient Header */}
        <div className="antigravity-card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ width: 72, height: 72, borderRadius: 16, background: badge.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", flexShrink: 0 }}>
              {badge.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary)" }}>{patient.nome}</h1>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: badge.bg, color: badge.color }}>{patient.especie}</span>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                {patient.raca && <span>Raça: {patient.raca}</span>}
                {patient.sexo && <span>Sexo: {patient.sexo}</span>}
                {patient.idade && <span>Idade: {patient.idade}</span>}
                {patient.peso && <span>Peso: {patient.peso}kg</span>}
                {patient.pelagem && <span>Pelagem: {patient.pelagem}</span>}
                {patient.microchip && <span>Microchip: {patient.microchip}</span>}
              </div>
              {patient.alergias && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", fontSize: "0.85rem", color: "#b91c1c" }}>
                  ⚠️ Alergias: {patient.alergias}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button className="btn-magnetic btn-secondary" onClick={() => setShowEditForm(true)} style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 4 }}>
                <Edit size={14} /> Editar
              </button>
              <button onClick={handleDelete} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ef4444", background: "rgba(239,68,68,0.05)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem", fontWeight: 600 }}>
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        </div>

        {/* Medical Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto" }}>
          {medTabs.map(tab => (
            <button key={tab.key} onClick={() => setMedTab(tab.key)}
              style={{
                padding: "10px 18px", borderRadius: 100, border: "none", cursor: "pointer",
                fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap",
                background: medTab === tab.key ? "var(--color-primary)" : "rgba(15,118,110,0.06)",
                color: medTab === tab.key ? "#fff" : "var(--text-muted)",
                transition: "all 0.2s"
              }}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {medTab === 'consultas' && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button className="btn-magnetic" onClick={() => setShowConsultaForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: "0.85rem" }}>
                <Plus size={16} /> Nova Consulta
              </button>
            </div>
            {consultas.length === 0 ? (
              <div className="antigravity-card" style={{ padding: 32, textAlign: "center", color: "var(--text-light)" }}>Nenhuma consulta registrada.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {consultas.map(c => (
                  <div key={c.id} className="antigravity-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>{formatDateTime(c.criadoEm)}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Dr(a). {c.veterinario}</div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          <button onClick={() => setEditingConsulta(c)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(15,118,110,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            <Edit size={12} /> Editar
                          </button>
                          <button onClick={() => handleDeleteConsulta(c.id)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontSize: "0.75rem", color: "#ef4444" }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Motivo</div>
                        <div style={{ fontSize: "0.9rem" }}>{c.motivo}</div>
                      </div>
                      {c.exameFisico && (
                        <div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Exame Físico</div>
                          <div style={{ fontSize: "0.9rem" }}>{c.exameFisico}</div>
                        </div>
                      )}
                      {c.diagnostico && (
                        <div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Diagnóstico</div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{c.diagnostico}</div>
                        </div>
                      )}
                      {c.prescricao && (
                        <div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Prescrição</div>
                          <div style={{ fontSize: "0.9rem" }}>{c.prescricao}</div>
                        </div>
                      )}
                    </div>
                    {c.observacoes && (
                      <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(15,118,110,0.04)", fontSize: "0.85rem" }}>
                        {c.observacoes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {medTab === 'vacinas' && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button className="btn-magnetic" onClick={() => setShowVacinaForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: "0.85rem" }}>
                <Plus size={16} /> Nova Vacina
              </button>
            </div>
            {vacinas.length === 0 ? (
              <div className="antigravity-card" style={{ padding: 32, textAlign: "center", color: "var(--text-light)" }}>Nenhuma vacina registrada.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {vacinas.map(v => (
                  <div key={v.id} className="antigravity-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>💉</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{v.nome}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Aplicada: {formatDate(v.dataAplicacao)}
                        {v.dataProxima && ` • Próxima: ${formatDate(v.dataProxima)}`}
                        {v.veterinario && ` • Dr(a). ${v.veterinario}`}
                      </div>
                    </div>
                    {v.lote && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Lote: {v.lote}</span>}
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => setEditingVacina(v)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(15,118,110,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Edit size={12} /> Editar
                      </button>
                      <button onClick={() => handleDeleteVacina(v.id)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontSize: "0.75rem", color: "#ef4444" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {medTab === 'cirurgias' && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button className="btn-magnetic" onClick={() => setShowCirurgiaForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: "0.85rem" }}>
                <Plus size={16} /> Nova Cirurgia
              </button>
            </div>
            {cirurgias.length === 0 ? (
              <div className="antigravity-card" style={{ padding: 32, textAlign: "center", color: "var(--text-light)" }}>Nenhuma cirurgia registrada.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cirurgias.map(c => (
                  <div key={c.id} className="antigravity-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🏥</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{c.tipo}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {formatDateTime(c.dataCirurgia)}
                        {c.veterinario && ` • Dr(a). ${c.veterinario}`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => setEditingCirurgia(c)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(15,118,110,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Edit size={12} /> Editar
                      </button>
                      <button onClick={() => handleDeleteCirurgia(c.id)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontSize: "0.75rem", color: "#ef4444" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {medTab === 'exames' && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button className="btn-magnetic" onClick={() => setShowExameForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: "0.85rem" }}>
                <Plus size={16} /> Novo Exame
              </button>
            </div>
            {exames.length === 0 ? (
              <div className="antigravity-card" style={{ padding: 32, textAlign: "center", color: "var(--text-light)" }}>Nenhum exame registrado.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {exames.map(e => (
                  <div key={e.id} className="antigravity-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(168,85,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🔬</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{e.tipoExame}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {formatDate(e.dataExame)}
                        {e.veterinario && ` • Dr(a). ${e.veterinario}`}
                      </div>
                      {e.resultado && <div style={{ fontSize: "0.85rem", marginTop: 4 }}>{e.resultado}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => setEditingExame(e)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(15,118,110,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Edit size={12} /> Editar
                      </button>
                      <button onClick={() => handleDeleteExame(e.id)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontSize: "0.75rem", color: "#ef4444" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {medTab === 'agendamentos' && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button className="btn-magnetic" onClick={() => navigate('/agendamentos')} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: "0.85rem" }}>
                <Calendar size={16} /> Ver Calendário
              </button>
            </div>
            {agendamentos.length === 0 ? (
              <div className="antigravity-card" style={{ padding: 32, textAlign: "center", color: "var(--text-light)" }}>Nenhum agendamento registrado.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {agendamentos.map(a => (
                  <div key={a.id} className="antigravity-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Calendar size={20} color="#f59e0b" /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{a.tipo}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {formatDateTime(a.dataHora)}
                        {a.veterinario && ` • Dr(a). ${a.veterinario}`}
                      </div>
                    </div>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 600, padding: "4px 10px", borderRadius: 100,
                      background: a.status === 'Confirmado' ? 'rgba(16,185,129,0.1)' : a.status === 'Cancelado' ? 'rgba(239,68,68,0.1)' : a.status === 'Concluido' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                      color: a.status === 'Confirmado' ? '#059669' : a.status === 'Cancelado' ? '#ef4444' : a.status === 'Concluido' ? '#2563eb' : '#d97706'
                    }}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showEditForm && (
        <PacienteForm patient={patient} onSave={(p) => { setPatient(p); setShowEditForm(false) }} onClose={() => setShowEditForm(false)} />
      )}
      {showConsultaForm && !editingConsulta && (
        <ConsultaForm patientId={patient.id} unidade={patient.unidade} onSave={(c) => { setConsultas(prev => [c, ...prev]); setShowConsultaForm(false) }} onClose={() => setShowConsultaForm(false)} />
      )}
      {editingConsulta && (
        <ConsultaForm patientId={patient.id} unidade={patient.unidade} consulta={editingConsulta} onSave={(c) => { setConsultas(prev => prev.map(x => x.id === c.id ? c : x)); setEditingConsulta(null) }} onClose={() => setEditingConsulta(null)} />
      )}
      {showVacinaForm && !editingVacina && (
        <VacinaForm patientId={patient.id} unidade={patient.unidade} onSave={(v) => { setVacinas(prev => [v, ...prev]); setShowVacinaForm(false) }} onClose={() => setShowVacinaForm(false)} />
      )}
      {editingVacina && (
        <VacinaForm patientId={patient.id} unidade={patient.unidade} vacina={editingVacina} onSave={(v) => { setVacinas(prev => prev.map(x => x.id === v.id ? v : x)); setEditingVacina(null) }} onClose={() => setEditingVacina(null)} />
      )}
      {showCirurgiaForm && !editingCirurgia && (
        <CirurgiaForm patientId={patient.id} unidade={patient.unidade} onSave={(c) => { setCirurgias(prev => [c, ...prev]); setShowCirurgiaForm(false) }} onClose={() => setShowCirurgiaForm(false)} />
      )}
      {editingCirurgia && (
        <CirurgiaForm patientId={patient.id} unidade={patient.unidade} cirurgia={editingCirurgia} onSave={(c) => { setCirurgias(prev => prev.map(x => x.id === c.id ? c : x)); setEditingCirurgia(null) }} onClose={() => setEditingCirurgia(null)} />
      )}
      {showExameForm && !editingExame && (
        <ExameForm patientId={patient.id} unidade={patient.unidade} onSave={(e) => { setExames(prev => [e, ...prev]); setShowExameForm(false) }} onClose={() => setShowExameForm(false)} />
      )}
      {editingExame && (
        <ExameForm patientId={patient.id} unidade={patient.unidade} exame={editingExame} onSave={(e) => { setExames(prev => prev.map(x => x.id === e.id ? e : x)); setEditingExame(null) }} onClose={() => setEditingExame(null)} />
      )}
    </div>
  )
}
