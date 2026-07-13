import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { PawPrint, MapPin, Check } from "lucide-react"

const UNIDADES = [
  { id: "unidade-central", name: "Unidade Central", address: "Centro da cidade" },
  { id: "unidade-norte", name: "Unidade Norte", address: "Região norte" },
  { id: "unidade-sul", name: "Unidade Sul", address: "Região sul" },
]

const STORAGE_KEY = "vethub_unidade"

export function getSavedUnidade(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function clearSavedUnidade() {
  localStorage.removeItem(STORAGE_KEY)
}

export default function UnidadeSelection() {
  const navigate = useNavigate()
  const { user, unidade, funcoes, role, signOut, refreshProfile } = useAuth()
  const [selected, setSelected] = useState("")
  const [remember, setRemember] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (funcoes.includes("TV")) {
      navigate("/selecionar-tv", { replace: true })
      return
    }
    if (unidade && unidade !== "Todos" && role !== "admin" && role !== "coordinator") {
      navigate("/recepcao", { replace: true })
    }
  }, [unidade, funcoes, role, navigate])

  const handleConfirm = async () => {
    if (!selected || saving || !user) return
    setSaving(true)

    const unitName = UNIDADES.find(u => u.id === selected)?.name || selected

    await supabase.from("user_profiles").update({
      unidade: unitName,
      atualizado_em: new Date().toISOString()
    }).eq("id", user.id)

    if (remember) {
      localStorage.setItem(STORAGE_KEY, selected)
    }

    await refreshProfile()
    setSaving(false)
    setLoading(true)

    setTimeout(() => navigate("/recepcao"), 1800)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundImage: "url(/cmv.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-[#6b8e6b]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <PawPrint className="w-8 h-8 text-[#6b8e6b]" />
          </div>
          <p className="text-white/60 text-sm mb-3">Entrando na unidade...</p>
          <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-[#6b8e6b] rounded-full" style={{
              animation: "loadingBar 1.8s ease-in-out forwards"
            }} />
          </div>
          <style>{`
            @keyframes loadingBar {
              0% { width: 0%; }
              60% { width: 80%; }
              100% { width: 100%; }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundImage: "url(/cmv.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black/60" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#6b8e6b]/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <PawPrint className="w-8 h-8 text-[#6b8e6b]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo ao VetHub</h1>
          <p className="text-white/40 text-sm">Selecione a unidade para continuar</p>
        </div>

        <div className="space-y-3 mb-6">
          {UNIDADES.map(unit => {
            const isSelected = selected === unit.id
            return (
              <button
                key={unit.id}
                onClick={() => setSelected(unit.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "bg-[#6b8e6b]/10 border-[#6b8e6b]/50"
                    : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isSelected ? "bg-[#6b8e6b]/20" : "bg-white/[0.05]"
                }`}>
                  <MapPin className={`w-5 h-5 ${isSelected ? "text-[#6b8e6b]" : "text-white/30"}`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${isSelected ? "text-white" : "text-white/70"}`}>
                    {unit.name}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">{unit.address}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? "border-[#6b8e6b] bg-[#6b8e6b]" : "border-white/15"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            )
          })}
        </div>

        <label className="flex items-center gap-3 mb-6 cursor-pointer group">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            remember ? "border-[#6b8e6b] bg-[#6b8e6b]" : "border-white/15 group-hover:border-white/25"
          }`}>
            {remember && <Check className="w-3 h-3 text-white" />}
          </div>
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            className="sr-only"
          />
          <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
            Lembrar minha escolha
          </span>
        </label>

        <button
          onClick={handleConfirm}
          disabled={!selected || saving}
          className="w-full bg-[#6b8e6b] hover:bg-[#5a7a5a] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Salvando..." : "Confirmar"}
        </button>

        {user && (
          <p className="text-center text-white/20 text-xs mt-6">
            {user.email} •{" "}
            <button onClick={signOut} className="text-white/40 hover:text-white/60 underline transition-colors">
              sair
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
