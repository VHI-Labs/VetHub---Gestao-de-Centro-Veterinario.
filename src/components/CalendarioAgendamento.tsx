import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Agendamento } from "../types"

interface Props {
  agendamentos: Agendamento[]
  mes: number
  ano: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onDayClick?: (date: string) => void
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

function statusColor(s: string) {
  if (s === "Confirmado") return "#059669"
  if (s === "Cancelado") return "#ef4444"
  if (s === "Concluido") return "#2563eb"
  return "#d97706"
}

export default function CalendarioAgendamento({ agendamentos, mes, ano, onPrevMonth, onNextMonth, onDayClick }: Props) {
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
  const hoje = new Date()

  const agendamentosPorDia = useMemo(() => {
    const map = new Map<string, Agendamento[]>()
    for (const a of agendamentos) {
      const key = a.dataHora.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(a)
    }
    return map
  }, [agendamentos])

  const days: { day: number; agendamentos: Agendamento[]; isToday: boolean; dateStr: string }[] = []
  for (let d = 1; d <= diasNoMes; d++) {
    const dateStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    const isToday = dateStr === `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`
    days.push({ day: d, agendamentos: agendamentosPorDia.get(dateStr) || [], isToday, dateStr })
  }

  const formatTime = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="antigravity-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onPrevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)", padding: 4 }}>
          <ChevronLeft size={22} />
        </button>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>
          {MESES[mes]} {ano}
        </h3>
        <button onClick={onNextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)", padding: 4 }}>
          <ChevronRight size={22} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(d => (
          <div
            key={d.day}
            onClick={() => onDayClick?.(d.dateStr)}
            style={{
              minHeight: 80, borderRadius: 8, padding: 6, cursor: onDayClick ? "pointer" : "default",
              background: d.isToday ? "rgba(15,118,110,0.08)" : "rgba(255,255,255,0.5)",
              border: d.isToday ? "2px solid var(--color-primary)" : "1px solid rgba(15,118,110,0.06)",
              display: "flex", flexDirection: "column", transition: "background 0.15s"
            }}
          >
            <span style={{
              fontSize: "0.85rem", fontWeight: d.isToday ? 800 : 600,
              color: d.isToday ? "var(--color-primary)" : "var(--text-main)", marginBottom: 2
            }}>
              {d.day}
            </span>
            {d.agendamentos.slice(0, 3).map(a => (
              <span key={a.id} style={{
                fontSize: "0.65rem", padding: "1px 4px", borderRadius: 4, marginBottom: 1,
                background: `${statusColor(a.status)}15`, color: statusColor(a.status),
                fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {formatTime(a.dataHora)} {a.tipo}
              </span>
            ))}
            {d.agendamentos.length > 3 && (
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, textAlign: "center" }}>
                +{d.agendamentos.length - 3}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
