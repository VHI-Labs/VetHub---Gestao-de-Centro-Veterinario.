import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Hospital, Ambulance, ClipboardList, PawPrint, Tv, Settings } from "lucide-react"

const ADMIN_LINKS = [
  { path: "/recepcao", label: "Recepção", icon: Hospital },
  { path: "/pronto-atendimento", label: "Pronto Atendimento", icon: Ambulance },
  { path: "/triagem", label: "Triagem", icon: ClipboardList },
  { path: "/painel-caes", label: "Cães", icon: PawPrint },
  { path: "/painel-gatos", label: "Gatos", icon: PawPrint },
  { path: "/selecionar-tv", label: "TV", icon: Tv },
  { path: "/admin", label: "Admin", icon: Settings },
]

const COORD_LINKS = [
  { path: "/selecionar-tv", label: "TV", icon: Tv },
  { path: "/painel-caes", label: "Cães", icon: PawPrint },
  { path: "/painel-gatos", label: "Gatos", icon: PawPrint },
]

export default function BottomNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role } = useAuth()

  if (role !== "admin" && role !== "coordinator") return null

  const links = role === "admin" ? ADMIN_LINKS : COORD_LINKS

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
      {links.map(link => {
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
            <link.icon size={16} />
            <span>{link.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
