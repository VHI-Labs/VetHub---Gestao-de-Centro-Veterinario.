import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { PawPrint, Monitor, LogOut } from "lucide-react"
import IconMDogFace from "react-fluentui-emoji/lib/modern/icons/IconMDogFace"
import IconMCatFace from "react-fluentui-emoji/lib/modern/icons/IconMCatFace"

export default function TvSelection() {
  const navigate = useNavigate()
  const { user, unidade, funcoes, role, signOut } = useAuth()

  if (!funcoes.includes("TV") && role !== "admin" && role !== "coordinator") return null

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", flexDirection: "column" }}>
      <header style={{
        background: "#2d3a2d", color: "#fff", padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PawPrint className="w-6 h-6 text-[#6b8e6b]" />
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>HOVET</span>
          <span style={{
            background: "rgba(107,142,107,0.2)", color: "#6b8e6b",
            padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600
          }}>
            <Monitor size={12} style={{ marginRight: 4 }} />
            TV
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>{user?.email}</span>
          <button onClick={signOut} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.6)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem"
          }}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 32 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2d3a2d", marginBottom: 4 }}>Selecionar TV</h1>
          <p style={{ color: "#6b7280" }}>
            Transmitindo: <strong>{unidade || "Nenhum campus"}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/painel-caes")}
            style={{
              width: 280, height: 280, borderRadius: 20,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 16, cursor: "pointer",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              border: "none", color: "#fff",
              boxShadow: "0 8px 32px rgba(59,130,246,0.3)",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(59,130,246,0.4)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(59,130,246,0.3)" }}
          >
            <IconMDogFace size={80} />
            <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>TV Cachorros</span>
          </button>

          <button
            onClick={() => navigate("/painel-gatos")}
            style={{
              width: 280, height: 280, borderRadius: 20,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 16, cursor: "pointer",
              background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
              border: "none", color: "#fff",
              boxShadow: "0 8px 32px rgba(236,72,153,0.3)",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(236,72,153,0.4)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(236,72,153,0.3)" }}
          >
            <IconMCatFace size={80} />
            <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>TV Gatos & Silvestres</span>
          </button>
        </div>
      </main>
    </div>
  )
}
