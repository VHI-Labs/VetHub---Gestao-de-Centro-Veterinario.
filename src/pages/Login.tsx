import { useState, useEffect, useRef } from "react"
import { Lock, Mail, PawPrint, ArrowLeft, ChevronDown, ChevronUp, Shield, Stethoscope, Receipt, User, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getSavedUnidade } from "./UnidadeSelection"

const TEST_ACCOUNTS = [
  { email: "admin@vethub.com.br", password: "Teste@123", label: "Admin", desc: "Acesso total", icon: Shield, color: "text-amber-400" },
  { email: "vet@vethub.com.br", password: "Teste@123", label: "Veterinário", desc: "Unidade Central", icon: Stethoscope, color: "text-emerald-400" },
  { email: "recepcao@vethub.com.br", password: "Teste@123", label: "Recepção", desc: "Unidade Central", icon: User, color: "text-blue-400" },
  { email: "financeiro@vethub.com.br", password: "Teste@123", label: "Financeiro", desc: "Unidade Central", icon: Receipt, color: "text-purple-400" },
  { email: "user@vethub.com.br", password: "Teste@123", label: "Usuário", desc: "Somente leitura", icon: Eye, color: "text-white/40" },
]

export default function Login() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signIn, resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState("")
  const [showTestAccounts, setShowTestAccounts] = useState(false)
  const testAccountsRef = useRef<HTMLDivElement>(null)

  const fillTestAccount = (acc: typeof TEST_ACCOUNTS[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setShowTestAccounts(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (testAccountsRef.current && !testAccountsRef.current.contains(e.target as Node)) {
        setShowTestAccounts(false)
      }
    }
    if (showTestAccounts) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showTestAccounts])

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) setEmail(savedEmail)
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      navigate(getSavedUnidade() ? "/recepcao" : "/selecionar-unidade")
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    localStorage.setItem("rememberedEmail", email)
    const { error: signInError } = await signIn(email, password)
    setIsLoading(false)
    if (signInError) {
      setError(signInError.message)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) return
    setResetError("")
    const { error } = await resetPassword(resetEmail.trim())
    if (error) setResetError(error.message)
    else setResetSent(true)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f" }}>
        <div className="text-white/60 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ backgroundImage: "url(/cmv.png)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} />

      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <PawPrint className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">VetHub</h1>
          <p className="text-sm text-white/40 mt-1.5">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="bg-red-500/10 text-red-300 text-sm text-center py-2.5 px-4 rounded-xl border border-red-500/15 backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              required
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all backdrop-blur-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="password"
              required
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all backdrop-blur-sm"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ textAlign: "right", marginTop: -8 }}>
            <button type="button" onClick={() => setShowResetModal(true)}
              className="text-xs text-white/30 hover:text-white/50 transition-colors">
              Esqueceu a senha?
            </button>
          </div>

          <div className="relative" ref={testAccountsRef}>
            <button
              type="button"
              onClick={() => setShowTestAccounts(!showTestAccounts)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white/30 hover:text-white/50 hover:bg-white/[0.06] transition-all"
            >
              <span>Contas de teste disponíveis</span>
              {showTestAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTestAccounts && (
              <div className="absolute left-full ml-2 top-0 w-56 p-2 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl z-50" style={{ animation: "fadeIn 0.15s ease" }}>
                {TEST_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillTestAccount(acc)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-white/[0.06] rounded-lg transition-all text-left group"
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center bg-white/[0.04] ${acc.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-white/70 group-hover:text-white/90">{acc.label}</div>
                        <div className="text-[9px] text-white/25">{acc.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-white/90 text-[#0f0f0f] font-semibold py-3 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-center text-white/20 mt-8">
          Fale com nosso time de vendas: <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 underline transition-colors">WhatsApp</a>
        </p>

        <p className="text-center text-white/10 text-[11px] mt-10 tracking-wider">
          v 1.0.0
        </p>
      </div>

      {showResetModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setShowResetModal(false)}>
          <div style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32, maxWidth: 400, width: "100%" }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, color: "#e0e7e3", marginBottom: 8, fontSize: "1.1rem" }}>Redefinir Senha</h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
              Informe seu email para receber o link de redefinição.
            </p>
            {resetSent ? (
              <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(16,185,129,0.1)", color: "#34d399", fontSize: "0.85rem", fontWeight: 500 }}>
                Email enviado! Verifique sua caixa de entrada.
              </div>
            ) : (
              <>
                {resetError && (
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: "0.82rem", marginBottom: 12 }}>
                    {resetError}
                  </div>
                )}
                <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 mb-4"
                  placeholder="Seu email" />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", cursor: "pointer", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                    Cancelar
                  </button>
                  <button onClick={handleResetPassword} disabled={!resetEmail.trim()} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#10b981", color: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, opacity: !resetEmail.trim() ? 0.5 : 1 }}>
                    Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
