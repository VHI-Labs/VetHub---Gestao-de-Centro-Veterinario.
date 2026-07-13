import { useDemo } from "../context/DemoContext"
import { Crown, Clock, AlertTriangle, X } from "lucide-react"
import { useState } from "react"

export default function UpsellBanner() {
  const { isDemo, daysRemaining, isExpired, usagePercent } = useDemo()
  const [dismissed, setDismissed] = useState(false)

  if (!isDemo || dismissed) return null

  if (isExpired) {
    return (
      <div style={{
        background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.08))",
        border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px",
        marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <AlertTriangle size={18} color="#ef4444" />
        <span style={{ fontSize: "0.85rem", color: "#dc2626", fontWeight: 600 }}>
          Seu trial expirou! Contrate o plano premium para continuar usando.
        </span>
        <button
          onClick={() => window.open("https://wa.me/5500000000000?text=Olá! Meu trial do VetHub expirou, quero assinar!", "_blank")}
          style={{
            marginLeft: "auto", padding: "6px 16px", borderRadius: 8, border: "none",
            background: "#ef4444", color: "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
          }}
        >
          Contratar Agora
        </button>
        <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }}>
          <X size={16} />
        </button>
      </div>
    )
  }

  const lowStock = Object.keys({ a: 1 }).some(() => {
    const pcts = [usagePercent('pacientes'), usagePercent('consultas'), usagePercent('medicamentos'), usagePercent('faturas')]
    return pcts.some(p => p >= 80)
  })

  return (
    <div style={{
      background: lowStock
        ? "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(234,88,12,0.06))"
        : "linear-gradient(135deg, rgba(15,118,110,0.04), rgba(16,185,129,0.04))",
      border: lowStock ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(15,118,110,0.1)",
      borderRadius: 12, padding: "10px 16px", marginBottom: 16,
      display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
    }}>
      <Crown size={16} color={lowStock ? "#f59e0b" : "#0f766e"} />
      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>
        {daysRemaining <= 3 ? (
          <span style={{ color: "#ef4444", fontWeight: 700 }}>
            <Clock size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            Trial expira em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}!
          </span>
        ) : (
          <>Modo demonstração — <strong>{daysRemaining} dias</strong> restantes</>
        )}
      </span>

      {lowStock && (
        <span style={{
          fontSize: "0.75rem", color: "#d97706", fontWeight: 600,
          padding: "2px 8px", borderRadius: 100, background: "rgba(245,158,11,0.1)",
        }}>
          Limite próximo
        </span>
      )}

      <button
        onClick={() => window.open("https://wa.me/5500000000000?text=Olá! Quero assinar o plano premium do VetHub!", "_blank")}
        style={{
          marginLeft: "auto", padding: "5px 14px", borderRadius: 8, border: "none",
          background: lowStock ? "#f59e0b" : "var(--color-primary)", color: "#fff",
          fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
        }}
      >
        <Crown size={13} /> Upgrade
      </button>
      <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
        <X size={14} />
      </button>
    </div>
  )
}
