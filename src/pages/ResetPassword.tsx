import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { PawPrint, ArrowLeft, Lock } from "lucide-react"

export default function ResetPassword() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) navigate("/selecionar-campus")
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }
    setIsLoading(true)
    setError("")
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setIsLoading(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2000)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ backgroundImage: "url(/cmv.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} />
      <button onClick={() => navigate("/login")} className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar ao login
      </button>
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <PawPrint className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Redefinir Senha</h1>
          <p className="text-sm text-white/40 mt-1.5">Digite sua nova senha</p>
        </div>
        {!sessionReady ? (
          <div className="text-center text-white/40 text-sm py-8">Carregando...</div>
        ) : success ? (
          <div className="bg-green-500/10 text-green-300 text-sm text-center py-4 px-4 rounded-xl border border-green-500/15">
            Senha redefinida com sucesso! Redirecionando...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="bg-red-500/10 text-red-300 text-sm text-center py-2.5 px-4 rounded-xl border border-red-500/15">
                {error}
              </div>
            )}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="password" required minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                placeholder="Nova senha" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="password" required minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                placeholder="Confirmar senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-white hover:bg-white/90 text-[#0f0f0f] font-semibold py-3 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 shadow-xl shadow-white/5">
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
