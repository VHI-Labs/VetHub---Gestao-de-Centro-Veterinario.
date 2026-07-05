import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Topbar from "../components/Topbar"
import { getAgendamentos, updateAgendamentoStatus, getPatient } from "../core/ehr"
import type { Agendamento, Patient } from "../types"
import { useAuth } from "../context/AuthContext"
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Check, X, Clock } from "lucide-react"

export default function Agendamentos() {
  const { unidade } = useAuth()
  const navigate = useNavigate()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [patients, setPatients] = useState<Map<string, Patient>>(new Map())
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filter, setFilter] = useState<string>('Todos')

  const loadData = useCallback(async () => {
    setLoading(true)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const inicio = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const fim = month === 11 ? `${year + 1}-01-01` : `${year}-${String(month + 2).padStart(2, '0')}-01`
    const agg = await getAgendamentos(unidade, inicio, fim)
    setAgendamentos(agg)

    const patientIds = [...new Set(agg.map(a => a.patientId))]
    if (patientIds.length > 0) {
      const pMap = new Map<string, Patient>()
      await Promise.all(patientIds.map(async pid => {
        const p = await getPatient(pid)
        if (p) pMap.set(pid, p)
      }))
      setPatients(pMap)
    }
    setLoading(false)
  }, [currentDate, unidade])

  useEffect(() => { loadData() }, [loadData])

  const handleStatus = async (id: string, status: Agendamento['status']) => {
    await updateAgendamentoStatus(id, status)
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const filtered = filter === 'Todos' ? agendamentos : agendamentos.filter(a => a.status === filter)

  const statusColor = (s: string) => {
    if (s === 'Confirmado') return { bg: 'rgba(16,185,129,0.1)', color: '#059669' }
    if (s === 'Cancelado') return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' }
    if (s === 'Concluido') return { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' }
    return { bg: 'rgba(245,158,11,0.1)', color: '#d97706' }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "url(/cmv_tv.png)", backgroundSize: "cover",
        backgroundPosition: "center", opacity: 0.015, pointerEvents: "none", backgroundRepeat: "no-repeat"
      }} />
      <Topbar title="Agendamentos" />

      <main style={{ flex: 1, padding: "30px 40px", overflow: "auto", position: "relative", zIndex: 1 }}>
        <button onClick={() => navigate('/prontuario')} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Voltar ao Prontuário
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)" }}><ChevronLeft size={24} /></button>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-main)", minWidth: 200, textAlign: "center" }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)" }}><ChevronRight size={24} /></button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {['Todos', 'Pendente', 'Confirmado', 'Cancelado', 'Concluido'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: "6px 14px", borderRadius: 100, border: "none", cursor: "pointer",
                  fontSize: "0.8rem", fontWeight: 600,
                  background: filter === f ? "var(--color-primary)" : "rgba(15,118,110,0.06)",
                  color: filter === f ? "#fff" : "var(--text-muted)"
                }}>
                {f === 'Concluido' ? 'Concluído' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="antigravity-card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>
            <Calendar size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p>Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(a => {
              const patient = patients.get(a.patientId)
              const sc = statusColor(a.status)
              return (
                <div key={a.id} className="antigravity-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 56, textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary)" }}>{new Date(a.dataHora).getDate()}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{monthNames[new Date(a.dataHora).getMonth()].slice(0, 3)}</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>{formatTime(a.dataHora)}</div>
                  </div>
                  <div style={{ width: 1, height: 40, background: "rgba(15,118,110,0.1)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{patient?.nome || 'Paciente'}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: sc.bg, color: sc.color }}>
                        {a.status === 'Concluido' ? 'Concluído' : a.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {a.tipo} {a.veterinario && `• Dr(a). ${a.veterinario}`}
                    </div>
                  </div>
                  {a.status === 'Pendente' && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleStatus(a.id, 'Confirmado')} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #10b981", background: "rgba(16,185,129,0.05)", color: "#059669", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                        <Check size={14} /> Confirmar
                      </button>
                      <button onClick={() => handleStatus(a.id, 'Cancelado')} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ef4444", background: "rgba(239,68,68,0.05)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                        <X size={14} /> Cancelar
                      </button>
                    </div>
                  )}
                  {a.status === 'Confirmado' && (
                    <button onClick={() => handleStatus(a.id, 'Concluido')} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #3b82f6", background: "rgba(59,130,246,0.05)", color: "#2563eb", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                      <Clock size={14} /> Concluir
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
