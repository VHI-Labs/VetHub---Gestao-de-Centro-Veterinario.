import { useDemo } from "../context/DemoContext"
import { AlertTriangle, Crown, X } from "lucide-react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"

export default function TrialExpiredModal() {
  const { isDemo, isExpired } = useDemo()
  const navigate = useNavigate()

  if (!isDemo || !isExpired) return null

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div className="antigravity-card" onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 440, padding: 40, textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: "0 auto 20px",
          background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <AlertTriangle size={32} color="#ef4444" />
        </div>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ef4444", marginBottom: 8 }}>
          Trial Expirado
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
          Seu período de teste de 14 dias expirou. Para continuar usando o sistema, contrate o plano premium.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => window.open("https://wa.me/5500000000000?text=Olá! Meu trial do VetHub expirou, quero assinar!", "_blank")}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #0f766e, #0d9488)", color: "#fff",
              fontSize: "1rem", fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <Crown size={18} /> Assinar Premium
          </button>
          <button
            onClick={() => navigate("/recepcao")}
            style={{
              width: "100%", padding: "12px", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)",
              color: "var(--text-muted)", fontSize: "0.88rem", cursor: "pointer",
            }}
          >
            Continuar no modo limitado
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
