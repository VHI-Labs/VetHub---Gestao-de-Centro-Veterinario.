import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"

const CAMPUSES = ["Mooca", "Vila Olímpia", "Paulista", "Piracicaba", "São José dos Campos"]

export default function CampusSelection() {
  const navigate = useNavigate()
  const { user, unidade, funcoes, signOut, refreshProfile } = useAuth()
  const [selected, setSelected] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (funcoes.includes("TV")) {
      navigate("/selecionar-tv", { replace: true })
      return
    }
    if (unidade && unidade !== "Todos") {
      navigate("/recepcao", { replace: true })
    }
  }, [unidade, funcoes, navigate])

  const handleConfirm = async () => {
    if (!selected || saving || !user) return
    setSaving(true)
    await supabase.from("user_profiles").update({
      unidade: selected,
      funcoes: ["Recepcao", "Fila", "Videos", "Relatorios"],
      atualizado_em: new Date().toISOString()
    }).eq("id", user.id)
    await refreshProfile()
    navigate("/recepcao")
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ backgroundImage: "url(/cmv.png)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-[#2d3a2d]/70" />

      <div className="min-h-screen flex flex-col relative z-10">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-white/95 rounded-2xl p-10 shadow-2xl border border-white/30">
            <div className="text-center mb-8">
              <img src="/logo-uam.png" alt="UAM" style={{ height: 48, marginBottom: 12, display: "block", marginLeft: "auto", marginRight: "auto" }} />
              <p style={{ fontSize: "0.85rem", color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Sistema Hovet</p>
              <h2 className="text-2xl font-bold text-[#2d3a2d] mb-2">Selecione o Campus</h2>
              <p className="text-[#6b8e6b] mb-4">Escolha a unidade para iniciar o atendimento</p>
              {user && (
                <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                  {user.email} • <button onClick={signOut} style={{ background: "none", border: "none", color: "#6b8e6b", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "0.8rem" }}>sair</button>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "48px 16px", marginBottom: 32 }}>
              {CAMPUSES.map(campus => (
                <button
                  key={campus}
                  onClick={() => setSelected(campus)}
                  style={{
                    padding: campus === "Piracicaba" || campus === "São José dos Campos" || campus === "Mooca" || campus === "Paulista" ? "0 16px 20px" : "20px 16px",
                    paddingTop: campus === "Piracicaba" || campus === "São José dos Campos" || campus === "Mooca" || campus === "Paulista" ? 0 : 20,
                    borderRadius: 14,
                    border: selected === campus ? "2px solid #6b8e6b" : "2px solid #e5e7eb",
                    background: selected === campus ? "rgba(107,142,107,0.08)" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: "1rem",
                    fontWeight: selected === campus ? 700 : 500,
                    color: selected === campus ? "#2d3a2d" : "#6b7280",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: campus === "Piracicaba" || campus === "São José dos Campos" || campus === "Mooca" || campus === "Paulista" ? 0 : 8,
                    overflow: "visible",
                    position: "relative"
                  }}
                >
                  {campus === "Piracicaba" || campus === "São José dos Campos" || campus === "Mooca" || campus === "Paulista" ? (
                    <img
                      src={campus === "Piracicaba" ? "/piracicaba.svg" : campus === "São José dos Campos" ? "/sjc.svg" : campus === "Mooca" ? "/mooca.svg" : "/paulista.png"}
                      alt={campus}
                      style={{
                        width: campus === "Paulista" ? 100 : 140,
                        height: "auto",
                        marginTop: campus === "Paulista" ? -34 : campus === "São José dos Campos" ? -33 : -35,
                        marginBottom: 0,
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                        pointerEvents: "none"
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "1.8rem" }}>
                      {campus === "Vila Olímpia" ? "🌳" : "☀️"}
                    </span>
                  )}
                  <span style={{ marginTop: campus === "Piracicaba" || campus === "São José dos Campos" || campus === "Mooca" || campus === "Paulista" ? 4 : 0 }}>{campus}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selected || saving}
              className="w-full bg-[#6b8e6b] hover:bg-[#5a7a5a] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Confirmar Campus"}
            </button>
          </div>
        </div>

        <footer className="mt-auto py-4 px-6 text-center border-t border-white/20">
          <p className="text-white/70 text-sm">
            desenvolvido por{" "}
            <a
              href="https://vihisantos.github.io/My.Portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              capybara holding
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
