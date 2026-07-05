import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Topbar from "../components/Topbar"
import TutorForm from "../components/TutorForm"
import PacienteForm from "../components/PacienteForm"
import { searchOwners, searchPatients, getEhrDashboardMetrics } from "../core/ehr"
import type { EhrDashboardMetrics } from "../core/ehr"
import type { Owner, Patient } from "../types"
import { useAuth } from "../context/AuthContext"
import { Search, UserPlus, PawPrint, Users, Calendar, ChevronRight, BarChart3, Activity, Syringe, Stethoscope } from "lucide-react"

type Tab = 'dashboard' | 'tutores' | 'pacientes'

export default function Prontuario() {
  const { unidade } = useAuth()
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState<Tab>('pacientes')
  const [query, setQuery] = useState("")
  const [owners, setOwners] = useState<Owner[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [showOwnerForm, setShowOwnerForm] = useState(false)
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [dashMetrics, setDashMetrics] = useState<EhrDashboardMetrics | null>(null)
  const [dashLoading, setDashLoading] = useState(false)

  const doSearch = useCallback(async () => {
    setLoading(true)
    if (currentTab === 'tutores') {
      setOwners(await searchOwners(query, unidade))
    } else {
      setPatients(await searchPatients(query, unidade))
    }
    setLoading(false)
  }, [query, currentTab, unidade])

  useEffect(() => { doSearch() }, [doSearch])

  useEffect(() => {
    if (currentTab !== 'dashboard') return
    setDashLoading(true)
    getEhrDashboardMetrics(unidade).then(m => { setDashMetrics(m); setDashLoading(false) })
  }, [currentTab, unidade])

  const tabs = [
    { label: "Dashboard", onClick: () => setCurrentTab('dashboard'), active: currentTab === 'dashboard' },
    { label: "Pacientes", onClick: () => setCurrentTab('pacientes'), active: currentTab === 'pacientes' },
    { label: "Tutores", onClick: () => setCurrentTab('tutores'), active: currentTab === 'tutores' },
    { label: "Agendamentos", onClick: () => navigate('/agendamentos'), active: false },
  ]

  const speciesBadge = (especie: string) => {
    if (especie === 'Cão') return { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' }
    if (especie === 'Gato') return { bg: 'rgba(236,72,153,0.1)', color: '#db2777' }
    return { bg: 'rgba(16,185,129,0.1)', color: '#059669' }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "url(/cmv_tv.png)", backgroundSize: "cover",
        backgroundPosition: "center", opacity: 0.015, pointerEvents: "none", backgroundRepeat: "no-repeat"
      }} />
      <Topbar title="Prontuário Eletrônico" tabs={tabs} />

      <main style={{ flex: 1, padding: "30px 40px", overflow: "auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={currentTab === 'tutores' ? "Buscar por nome, CPF ou telefone..." : "Buscar por nome, raça ou microchip..."}
              style={{
                width: "100%", padding: "12px 14px 12px 42px", borderRadius: 10,
                border: "1.5px solid rgba(15,118,110,0.15)", fontSize: "0.95rem",
                background: "rgba(255,255,255,0.8)", outline: "none"
              }}
            />
          </div>
          <button className="btn-magnetic" onClick={() => currentTab === 'tutores' ? setShowOwnerForm(true) : setShowPatientForm(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", whiteSpace: "nowrap" }}>
            {currentTab === 'tutores' ? <UserPlus size={18} /> : <PawPrint size={18} />}
            {currentTab === 'tutores' ? "Novo Tutor" : "Novo Paciente"}
          </button>
        </div>

        {currentTab === 'dashboard' ? (
          dashLoading ? (
            <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>Carregando...</div>
          ) : dashMetrics ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                <div className="antigravity-card" style={{ padding: 20, borderLeft: "5px solid var(--color-primary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <PawPrint size={20} color="var(--color-primary)" />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Pacientes</span>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)" }}>{dashMetrics.totalPacientes}</div>
                </div>
                <div className="antigravity-card" style={{ padding: 20, borderLeft: "5px solid #3b82f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <Stethoscope size={20} color="#3b82f6" />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Consultas</span>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#3b82f6" }}>{dashMetrics.totalConsultas}</div>
                </div>
                <div className="antigravity-card" style={{ padding: 20, borderLeft: "5px solid #10b981" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <Users size={20} color="#10b981" />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Tutores</span>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981" }}>{dashMetrics.totalTutores}</div>
                </div>
                <div className="antigravity-card" style={{ padding: 20, borderLeft: "5px solid #f59e0b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <Syringe size={20} color="#f59e0b" />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Vacinas a Vencer</span>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b" }}>{dashMetrics.totalVacinasAVencer}</div>
                </div>
              </div>

              <div className="antigravity-card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <BarChart3 size={18} /> Distribuição por Sexo
                </h3>
                {dashMetrics.sexoBreakdown.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhum paciente com sexo registrado.</p>
                ) : (
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    {dashMetrics.sexoBreakdown.map(({ sexo, count }) => {
                      const pct = dashMetrics.totalPacientes > 0 ? Math.round((count / dashMetrics.totalPacientes) * 100) : 0
                      const isMacho = sexo === 'Macho' || sexo === 'M'
                      return (
                        <div key={sexo} style={{ flex: 1, minWidth: 140 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: "1.3rem" }}>{isMacho ? '♂️' : '♀️'}</span>
                            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{sexo}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 12, borderRadius: 100, background: "rgba(15,118,110,0.08)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 100, background: isMacho ? "#3b82f6" : "#ec4899" }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="antigravity-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>
                  Sexo por Espécie
                </h3>
                {dashMetrics.especieSexoBreakdown.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhum dado disponível.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                    {dashMetrics.especieSexoBreakdown.map(({ especie, sexo, count }) => {
                      const emoji = especie === 'Cão' ? '🐕' : especie === 'Gato' ? '🐈' : '🦜'
                      return (
                        <div key={`${especie}-${sexo}`} className="antigravity-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "1.5rem" }}>{emoji}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{especie}</div>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{sexo}: <strong>{count}</strong></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null
        ) : loading ? (
          <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>
            Carregando...
          </div>
        ) : currentTab === 'tutores' ? (
          owners.length === 0 ? (
            <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>
              <Users size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p>Nenhum tutor encontrado.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {owners.map(owner => (
                <div key={owner.id} className="antigravity-card" onClick={() => navigate(`/prontuario/tutor/${owner.id}`)}
                  style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(15,118,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={22} color="var(--color-primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>{owner.nome}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {owner.telefone && `Tel: ${owner.telefone}`}
                      {owner.cpf && ` • CPF: ${owner.cpf}`}
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )
        ) : (
          patients.length === 0 ? (
            <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>
              <PawPrint size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p>Nenhum paciente encontrado.</p>
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
                        <span style={{ fontWeight: 700, fontSize: "1rem" }}>{patient.nome}</span>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: badge.bg, color: badge.color }}>
                          {patient.especie}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {patient.raca && `${patient.raca}`}
                        {patient.idade && ` • ${patient.idade}`}
                        {patient.peso && ` • ${patient.peso}kg`}
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                )
              })}
            </div>
          )
        )}
      </main>

      {showOwnerForm && (
        <TutorForm unidade={unidade} onSave={(o) => { setShowOwnerForm(false); navigate(`/prontuario/tutor/${o.id}`) }} onClose={() => setShowOwnerForm(false)} />
      )}
      {showPatientForm && (
        <PacienteForm unidade={unidade} onSave={(p) => { setShowPatientForm(false); navigate(`/prontuario/paciente/${p.id}`) }} onClose={() => setShowPatientForm(false)} />
      )}
    </div>
  )
}
