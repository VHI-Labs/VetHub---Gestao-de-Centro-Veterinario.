import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useClock } from "../hooks/useClock"
import { useAuth } from "../context/AuthContext"
import { MapPin, Hospital } from "lucide-react"
import ChangeCampusModal from "./ChangeCampusModal"

interface TopbarProps {
  title?: string
  tabs?: { label: string; onClick: () => void; active: boolean }[]
}

export default function Topbar({ title, tabs }: TopbarProps) {
  const time = useClock()
  const location = useLocation()
  const { role, unidade } = useAuth()
  const [showCampusModal, setShowCampusModal] = useState(false)

  return (
    <>
      <header className="topbar" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 40px", background: "rgba(255,255,255,0.7)",
        backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)",
        borderBottom: "var(--glass-border)", boxShadow: "0 4px 30px rgba(15,118,110,0.03)", zIndex: 10
      }}>
        <div className="topbar-brand" style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 10 }}><Hospital size={28} /> HOVET</span>
          <div style={{ display: "flex", gap: 8, fontSize: "0.9rem" }}>
            <Link to="/recepcao" className="tab-btn" style={{
              textDecoration: "none", padding: "6px 14px", borderRadius: 100, display: "inline-block",
              fontWeight: 700, background: location.pathname === "/recepcao" ? "#fff" : "transparent",
              color: location.pathname === "/recepcao" ? "var(--color-primary)" : "var(--text-muted)",
              boxShadow: location.pathname === "/recepcao" ? "0 4px 15px -2px rgba(15,118,110,0.1)" : "none"
            }}>Recepção</Link>
            <Link to="/pronto-atendimento" className="tab-btn" style={{
              textDecoration: "none", padding: "6px 14px", borderRadius: 100, display: "inline-block",
              fontWeight: 700, background: location.pathname === "/pronto-atendimento" ? "#fff" : "transparent",
              color: location.pathname === "/pronto-atendimento" ? "var(--color-primary)" : "var(--text-muted)",
              boxShadow: location.pathname === "/pronto-atendimento" ? "0 4px 15px -2px rgba(15,118,110,0.1)" : "none"
            }}>Pronto Atendimento</Link>

          </div>
        </div>

        <nav className="navigation-tabs" style={{
          display: "flex", gap: 10, background: "rgba(15,118,110,0.05)",
          padding: 6, borderRadius: 100, border: "1px solid rgba(15,118,110,0.05)"
        }}>
          {tabs && tabs.map((tab, i) => (
            <button
              key={i}
              className={`tab-btn ${tab.active ? "active" : ""}`}
              onClick={tab.onClick}
              style={{
                padding: "10px 24px", border: "none", background: tab.active ? "#fff" : "transparent",
                color: tab.active ? "var(--color-primary)" : "var(--text-muted)",
                fontWeight: 600, fontSize: "0.95rem", borderRadius: 100, cursor: "pointer",
                boxShadow: tab.active ? "0 4px 15px -2px rgba(15,118,110,0.1)" : "none"
              }}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => setShowCampusModal(true)}
            title="Mudar de campus"
            style={{
              padding: "6px 16px", border: "1px solid rgba(15,118,110,0.15)", borderRadius: 100,
              background: "rgba(15,118,110,0.06)", cursor: "pointer", display: "inline-flex",
              alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600,
              color: "var(--color-primary)", whiteSpace: "nowrap"
            }}
          >
            <MapPin size={14} /> {unidade && unidade !== "Todos" ? unidade : "Campus"}
          </button>
        </nav>

        <div style={{ fontWeight: 600, color: "var(--color-primary)", fontSize: "0.95rem" }}>{time}</div>
      </header>

      {showCampusModal && <ChangeCampusModal onClose={() => setShowCampusModal(false)} />}
    </>
  )
}
