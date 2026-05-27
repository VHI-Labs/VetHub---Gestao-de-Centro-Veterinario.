import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const LINKS = [
  { path: "/recepcao", label: "Recepção", icon: "🏥" },
  { path: "/pronto-atendimento", label: "Pronto Atendimento", icon: "🚑" },
  { path: "/triagem", label: "Triagem", icon: "📋" },
  { path: "/painel-caes", label: "Cães", icon: "🐶" },
  { path: "/painel-gatos", label: "Gatos", icon: "🐱" },
  { path: "/selecionar-tv", label: "TV", icon: "📺" },
  { path: "/admin", label: "Admin", icon: "⚙️" },
]

export default function AdminNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role } = useAuth()

  if (role !== "admin") return null

  return (
    <nav style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999,
      display: "flex", alignItems: "center", gap: 2,
      background: "rgba(45,58,45,0.92)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      padding: "6px 10px", borderRadius: 100,
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      {LINKS.map(link => {
        const isActive = location.pathname === link.path
        return (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            title={link.label}
            style={{
              background: isActive ? "rgba(107,142,107,0.3)" : "transparent",
              border: "none", color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
              cursor: "pointer", padding: "8px 12px", borderRadius: 100,
              fontSize: "0.78rem", fontWeight: isActive ? 700 : 500,
              display: "flex", alignItems: "center", gap: 4,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(107,142,107,0.15)"; e.currentTarget.style.color = "#fff" }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)" } }}
          >
            <span style={{ fontSize: "0.9rem" }}>{link.icon}</span>
            <span>{link.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
