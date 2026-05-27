import { useState, useEffect } from "react"
import { Lock, Mail, PawPrint, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/selecionar-campus")
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email)
    } else {
      localStorage.removeItem("rememberedEmail")
    }

    const { error: signInError } = await signIn(email, password)
    setIsLoading(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#2d3a2d" }}>
        <div className="text-white text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ backgroundImage: "url(/cmv.png)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-[#2d3a2d]/70" />

      <div className="min-h-screen flex flex-col relative z-10">
        <header className="lg:hidden bg-white/90 border-b border-white/20 py-4 px-6">
          <div className="flex items-center justify-center gap-2">
            <PawPrint className="w-6 h-6 text-[#6b8e6b]" />
            <span className="font-medium text-[#2d3a2d]">HOVET - Sistema de Gestão</span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-end p-6 lg:pr-20">
          <div className="w-full max-w-md bg-white/95 rounded-2xl p-8 shadow-2xl border border-white/30">
            <div className="lg:hidden text-center mb-8">
              <div className="w-14 h-14 bg-[#6b8e6b] rounded-xl flex items-center justify-center mx-auto mb-3">
                <PawPrint className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#2d3a2d]">Fila Hovet</h2>
              <p className="text-[#6b8e6b] text-sm">Sistema de Gestão</p>
            </div>

            <div className="hidden lg:block mb-6 text-center">
              <h2 className="text-3xl font-bold text-[#2d3a2d] mb-2">Bem-vindo</h2>
              <p className="text-[#2d3a2d]/70">Entre com suas credenciais para acessar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center font-medium border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2d3a2d]">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-[#6b8e6b]" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 border border-[#c9b896] rounded-xl bg-white text-[#2d3a2d] focus:ring-2 focus:ring-[#6b8e6b] focus:border-[#6b8e6b] focus:outline-none transition-all shadow-sm"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2d3a2d]">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-[#6b8e6b]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-11 pr-12 py-3.5 border border-[#c9b896] rounded-xl bg-white text-[#2d3a2d] focus:ring-2 focus:ring-[#6b8e6b] focus:border-[#6b8e6b] focus:outline-none transition-all shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPasswordError("")
                      setPassword(e.target.value)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6b8e6b] hover:text-[#5a7a5a]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              <label className="flex items-center cursor-pointer mb-4 group">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ${rememberMe ? 'bg-[#6b8e6b] border-[#6b8e6b]' : 'border-[#c9b896] group-hover:border-[#6b8e6b]'}`}>
                    {rememberMe && (
                      <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-[#2d3a2d] group-hover:text-[#6b8e6b] transition-colors">
                  Deixe-me conectado
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#6b8e6b] hover:bg-[#5a7a5a] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div style={{ marginTop: 24, padding: "16px", borderRadius: 12, background: "rgba(107,142,107,0.06)", border: "1px solid rgba(107,142,107,0.15)", textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
                Para cadastro, entre em contato com o administrador
              </p>
            </div>
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
              Vitor Santos
            </a>{" "}
            (NSI — Piracicaba) &{" "}
            <a
              href="https://ingridbrito.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              Ingrid Brito
            </a>{" "}
            (NSI — Mooca)
          </p>
        </footer>
      </div>
    </div>
  )
}
