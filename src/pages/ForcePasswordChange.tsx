import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { PawPrint, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"

export default function ForcePasswordChange() {
  const navigate = useNavigate()
  const { user, forcePasswordChange, clearForcePasswordChange, signOut } = useAuth()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true })
      return
    }
    if (!forcePasswordChange) {
      navigate("/recepcao", { replace: true })
      return
    }
    setLoading(false)
  }, [user, forcePasswordChange, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    await clearForcePasswordChange()
    setSaving(false)
    navigate("/recepcao", { replace: true })
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundImage: "url(/cmv.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black/60" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Primeiro acesso</h1>
          <p className="text-white/40 text-sm">
            Por segurança, defina uma nova senha para sua conta.
          </p>
        </div>

        <div className="antigravity-card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Nova senha
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 outline-none focus:border-[#6b8e6b]/50 transition-colors"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 outline-none focus:border-[#6b8e6b]/50 transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !newPassword || !confirmPassword}
              className="btn-magnetic w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Definir nova senha"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={signOut} className="text-xs text-white/30 hover:text-white/50 transition-colors">
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
