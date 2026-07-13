import { useDemo } from "../context/DemoContext"
import { Crown } from "lucide-react"

interface UsageLimitsBarProps {
  table: string
  label: string
}

export default function UsageLimitsBar({ table, label }: UsageLimitsBarProps) {
  const { isDemo, usagePercent, maxPacientes, maxConsultas, maxMedicamentos, maxFaturas, currentPacientes, currentConsultas, currentMedicamentos, currentFaturas } = useDemo()

  if (!isDemo) return null

  const limits: Record<string, { max: number; current: number }> = {
    pacientes: { max: maxPacientes, current: currentPacientes },
    consultas: { max: maxConsultas, current: currentConsultas },
    medicamentos: { max: maxMedicamentos, current: currentMedicamentos },
    faturas: { max: maxFaturas, current: currentFaturas },
  }

  const l = limits[table]
  if (!l) return null

  const pct = usagePercent(table)
  const isHigh = pct >= 80
  const isFull = pct >= 100

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
      borderRadius: 10, background: isFull ? "rgba(239,68,68,0.06)" : isHigh ? "rgba(245,158,11,0.06)" : "rgba(15,118,110,0.04)",
      border: isFull ? "1px solid rgba(239,68,68,0.15)" : isHigh ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(15,118,110,0.1)",
      marginBottom: 12,
    }}>
      <Crown size={14} color={isFull ? "#ef4444" : isHigh ? "#f59e0b" : "#0f766e"} />
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0 }}>
        {label}: <strong>{l.current}/{l.max}</strong>
      </span>
      <div style={{
        flex: 1, height: 4, borderRadius: 4, background: "rgba(15,118,110,0.08)", overflow: "hidden", maxWidth: 120,
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 4,
          background: isFull ? "#ef4444" : isHigh ? "#f59e0b" : "#0f766e",
          transition: "width 0.3s ease",
        }} />
      </div>
      {isFull && (
        <button
          onClick={() => window.open("https://wa.me/5500000000000?text=Olá! Preciso de mais registros no meu plano VetHub!", "_blank")}
          style={{
            padding: "3px 10px", borderRadius: 6, border: "none",
            background: "#ef4444", color: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
          }}
        >
          Expandir
        </button>
      )}
    </div>
  )
}
