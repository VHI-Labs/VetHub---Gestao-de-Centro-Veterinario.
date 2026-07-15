import { useEffect, useState, useRef, useCallback } from "react"
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValueEvent } from "framer-motion"
import {
  PawPrint, ArrowRight, ClipboardList, Users, Calendar, Tv,
  Sparkles, ChevronDown, Mail, Phone, MapPin, Check,
  Globe, MessageCircle, Zap, Shield,
  BarChart3, Smartphone, Quote, Heart, Activity, Clock,
  Menu, X, Search, Star, ArrowUp, MousePointer2, Bell, Send, Plus
} from "lucide-react"

function GithubIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={{ ...style, fill: (style?.color as string) || "currentColor" }} viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}

function LinkedinIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={{ ...style, fill: (style?.color as string) || "currentColor" }} viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getSavedUnidade } from "./UnidadeSelection"


const features = [
  {
    icon: ClipboardList, title: "Fila de Espera Inteligente",
    desc: "Triagem por prioridade, chamada automática por voz e exibição em tempo real nos painéis da clínica.",
    items: ["Prioridade vermelha/amarela/verde", "Chamada por voz (TTS)", "Histórico de chamadas"]
  },
  {
    icon: Users, title: "Prontuários Completos",
    desc: "Cadastro de tutores e pacientes com histórico detalhado de todas as consultas e procedimentos.",
    items: ["Busca rápida por nome ou espécie", "Histórico de atendimentos", "Upload de exames e documentos"]
  },
  {
    icon: Calendar, title: "Agendamentos",
    desc: "Gerencie consultas, cirurgias, exames e vacinas em uma interface simples e intuitiva.",
    items: ["Consultas e retornos", "Cirurgias agendadas", "Calendário visual"]
  },
  {
    icon: Tv, title: "Painéis de TV",
    desc: "Exiba a fila de espera e vídeos informativos na sala de espera com estilo profissional.",
    items: ["Layout personalizado", "Vídeos institucionais", "Design responsivo"]
  },
  {
    icon: BarChart3, title: "Relatórios e Métricas",
    desc: "Acompanhe o desempenho da clínica com gráficos e relatórios detalhados.",
    items: ["Métricas em tempo real", "Relatórios mensais", "Exportação de dados"]
  },
  {
    icon: Shield, title: "Controle de Acesso",
    desc: "Defina permissões por cargo — administrador, coordenador, atendente — com total segurança.",
    items: ["Autenticação Supabase", "Perfis por função", "Log de auditoria"]
  },
  {
    icon: Smartphone, title: "Responsivo",
    desc: "Acesse de qualquer lugar. O sistema funciona perfeitamente no celular, tablet e desktop.",
    items: ["Design adaptável", "PWA instalável", "Offline progressivo"]
  },
  {
    icon: Zap, title: "Atendimento Rápido",
    desc: "Fluxo otimizado para reduzir o tempo de espera e aumentar a produtividade da equipe.",
    items: ["Senha dinâmica", "Encaminhamento ágil", "Notificações sonoras"]
  }
]

const faqs = [
  { q: "O sistema é gratuito?", a: "Sim! Atualmente estamos em fase de implantação e o acesso é totalmente gratuito. Você paga apenas R$ 0,00 — sem pegadinhas." },
  { q: "Precisa instalar algum software?", a: "Não. O VetHub é 100% online, funciona direto do navegador. Basta fazer o cadastro e começar a usar." },
  { q: "Os dados da minha clínica ficam seguros?", a: "Sim. Utilizamos Supabase como banco de dados, com autenticação segura e políticas de acesso por linha (RLS). Seus dados são protegidos." },
  { q: "Posso usar no celular?", a: "Sim! O sistema é responsivo e pode ser instalado como um aplicativo (PWA) no seu celular ou tablet." },
  { q: "Como cadastro minha equipe?", a: "Entre em contato com o administrador da sua clínica para criar os acessos. Cada usuário tem permissões específicas." },
  { q: "Funciona para clínicas de grande porte?", a: "Com certeza. O VetHub foi desenvolvido pensando em fluxos intensos, com fila de espera, múltiplos consultórios e painéis de TV simultâneos." },
]

const plans = [
  {
    name: "Básico", price: "R$ 0,00", popular: false,
    features: [
      "Fila de espera inteligente",
      "Prontuários de pacientes",
      "Agendamento de consultas",
      "Painéis de TV",
      "Suporte por email"
    ]
  },
  {
    name: "Profissional", price: "R$ 0,00", popular: true,
    features: [
      "Tudo do Básico",
      "Relatórios e métricas",
      "Múltiplos consultórios",
      "Integração com exames",
      "Suporte prioritário"
    ]
  },
  {
    name: "Enterprise", price: "R$ 0,00", popular: false,
    features: [
      "Tudo do Profissional",
      "Auditoria completa",
      "API de integração",
      "Personalização de marca",
      "Gerente de conta dedicado"
    ]
  }
]

const team = [
  {
    name: "Vitor Santos", role: "Desenvolvedor Full Stack",
    bio: "Criador do VetHub. Especialista em sistemas web modernos com foco em experiência do usuário e performance.",
    links: { github: "https://github.com/vihisantos", portfolio: "https://vihisantos.github.io/My.Portfolio/", linkedin: "https://www.linkedin.com/in/vihisantos/" },
    unidade: "Gestão Piracicaba - SP",
    image: "/team/vitor.png",
    video: "/team/koda.mp4"
  },
  {
    name: "Ingrid Brito", role: "Desenvolvedora Full Stack",
    bio: "Criadora do VetHub. Apaixonada por tecnologia e soluções que transformam o dia a dia das clínicas veterinárias.",
    links: { github: "https://github.com/IngridBrito", portfolio: "https://ingridbrito.github.io/ingrid-portfolio/", linkedin: "https://www.linkedin.com/in/ingrid-brito-5957b2333/" },
    unidade: "Gestão Grande São Paulo Capital",
    image: "/team/ingrid.png",
    video: "/team/cat.mp4"
  }
]

const stats = [
  { icon: Heart, value: 120, suffix: "+", label: "Clínicas atendidas" },
  { icon: Users, value: 15, suffix: "k+", label: "Pacientes registrados", k: true },
  { icon: Activity, value: 98, suffix: "%", label: "Satisfação" },
  { icon: Clock, value: 3, suffix: "s", label: "Tempo médio de resposta" },
]

const testimonials = [
  {
    quote: "O VetHub transformou a forma como organizamos nossa clínica. A fila de espera inteligente e os painéis de TV fizeram toda a diferença no atendimento.",
    author: "Dra. Ana Beatriz", clinic: "Clínica VetCare, São Paulo"
  },
  {
    quote: "Reduzimos o tempo de espera dos pacientes em mais de 40% desde que implementamos o VetHub. Simplesmente essencial para nossa rotina.",
    author: "Dr. Carlos Mendes", clinic: "Hospital Animal, Campinas"
  },
  {
    quote: "A interface é incrivelmente intuitiva. Em uma semana toda a equipe já estava usando sem dificuldade. Recomendo de olhos fechados.",
    author: "Dra. Juliana Costa", clinic: "PetCare Center, Ribeirão Preto"
  }
]

const howItWorks = [
  {
    step: 1,
    icon: ClipboardList,
    title: "Fale com nosso time",
    desc: "Entre em contato com nosso time de vendas, conheça o sistema e comece a usar."
  },
  {
    step: 2,
    icon: Settings,
    title: "Configure o sistema",
    desc: "Personalize a fila de espera, cadastre sua equipe e configure os prontuários e agendamentos."
  },
  {
    step: 3,
    icon: Zap,
    title: "Comece a atender",
    desc: "A fila inteligente cuida do fluxo. Seus pacientes são chamados automaticamente — é só atender."
  }
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } }
}

function AnimatedCounter({ target, suffix = "", k = false }: { target: number; suffix?: string; k?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const steps = 30
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{k ? (count / 1000).toFixed(1).replace(".", ",") : count}{suffix}</span>
}

function FAQItem({ question, answer, open, onToggle }: { question: string; answer: string; open: boolean; onToggle: () => void }) {
  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden"
      style={{ background: "#f4f1ec", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-[#f8f7f4]"
      >
        <span className="text-[#2d3a2d]/80 font-medium text-sm">{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-[#6b8e6b]" />
        </motion.div>
      </button>
      <motion.div
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-5 text-[#2d3a2d]/50 text-sm leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  )
}

function SectionTitle({ badge, title, desc }: { badge?: string; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center mb-16"
    >
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-medium"
          style={{ background: "rgba(107,142,107,0.08)", border: "1px solid rgba(107,142,107,0.15)", color: "#6b8e6b" }}
        >
          {badge === "precos" ? <Zap className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          {badge === "precos" ? "Simulação de preços" : badge === "funcionalidades" ? "Tudo que sua clínica precisa" : badge}
        </motion.div>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-[#2d3a2d] tracking-tight mb-4">{title}</h2>
      <p className="text-[#2d3a2d]/40 max-w-xl mx-auto text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function FadeInView({ children, delay = 0, className = "", style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

function DashboardMockup() {
  const [searchText, setSearchText] = useState("")
  const [showToast, setShowToast] = useState(false)
  const searchTarget = "Buscar paciente..."

  useEffect(() => {
    let idx = 0
    const typeInterval = setInterval(() => {
      if (idx < searchTarget.length) {
        setSearchText(searchTarget.slice(0, idx + 1))
        idx++
      } else {
        clearInterval(typeInterval)
      }
    }, 80)
    return () => clearInterval(typeInterval)
  }, [])

  useEffect(() => {
    const toastTimer = setTimeout(() => setShowToast(true), 2500)
    const hideTimer = setTimeout(() => setShowToast(false), 5000)
    return () => { clearTimeout(toastTimer); clearTimeout(hideTimer) }
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl relative" style={{ border: "1px solid rgba(0,0,0,0.06)", background: "#f4f1ec" }}>
      {/* Rotating gradient border effect */}
      <div className="absolute -inset-[1px] rounded-2xl opacity-40 pointer-events-none" style={{ background: "conic-gradient(from 0deg, transparent, rgba(107,142,107,0.3), transparent, rgba(107,142,107,0.2), transparent)", animation: "spin 8s linear infinite" }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Browser top bar */}
      <div className="relative flex items-center gap-2 px-5 py-3.5 z-10" style={{ background: "#e8e4de", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
        <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
        <div className="ml-4 flex-1 max-w-md mx-auto rounded-lg py-1.5 px-3 text-center text-xs" style={{ background: "rgba(255,255,255,0.5)", color: "rgba(45,58,45,0.3)" }}>
          app.vethub.com.br
        </div>
      </div>

      {/* Dashboard layout */}
      <div className="relative flex h-[400px] sm:h-[480px] z-10">
        {/* Sidebar */}
        <div className="w-16 sm:w-56 p-4 shrink-0 hidden sm:flex flex-col gap-1" style={{ background: "#2d3a2d", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-6 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
            <PawPrint className="w-4 h-4" style={{ color: "#8bb88b" }} />
            <span className="text-white text-xs font-semibold hidden sm:inline">VetHub</span>
          </div>
          {["Fila", "Prontuários", "Agendamentos", "Relatórios"].map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors"
              style={{ background: i === 0 ? "rgba(255,255,255,0.08)" : "transparent", color: i === 0 ? "white" : "rgba(255,255,255,0.4)" }}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                {i === 0 && <ClipboardList className="w-3.5 h-3.5" />}
                {i === 1 && <Users className="w-3.5 h-3.5" />}
                {i === 2 && <Calendar className="w-3.5 h-3.5" />}
                {i === 3 && <BarChart3 className="w-3.5 h-3.5" />}
              </span>
              <span className="hidden sm:inline">{item}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="h-3 w-28 rounded-full mb-2" style={{ background: "rgba(45,58,45,0.1)" }} />
              <div className="h-2.5 w-40 rounded-full" style={{ background: "rgba(45,58,45,0.06)" }} />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded-lg flex items-center justify-center gap-1.5" style={{ background: "rgba(45,58,45,0.08)" }}>
                <Search className="w-3 h-3" style={{ color: "rgba(45,58,45,0.3)" }} />
                <span className="text-[10px]" style={{ color: "rgba(45,58,45,0.3)" }}>{searchText}<span className="animate-pulse">|</span></span>
              </div>
              <div className="h-8 w-20 rounded-lg flex items-center justify-center gap-1.5" style={{ background: "#2d3a2d" }}>
                <Plus className="w-3 h-3 text-white" />
                <span className="text-white text-[10px] hidden sm:inline">Novo</span>
              </div>
            </div>
          </div>

          {/* Queue items */}
          <div className="space-y-3">
            {[
              { priority: "red", name: "Thor", tutor: "Carlos Silva", senha: "A001", specie: "🐕", highlight: true },
              { priority: "yellow", name: "Luna", tutor: "Mariana Souza", senha: "A002", specie: "🐱", highlight: false },
              { priority: "green", name: "Bolinha", tutor: "Pedro Alves", senha: "A003", specie: "🐕", highlight: false },
              { priority: "green", name: "Pipoca", tutor: "Ana Costa", senha: "A004", specie: "🐰", highlight: false },
            ].map((pet, idx) => (
              <motion.div
                key={pet.senha}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.15 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: pet.highlight ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.6)",
                  border: pet.highlight ? "1px solid rgba(239,68,68,0.12)" : "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <span className="text-sm">{pet.specie}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#2d3a2d]">{pet.name}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold" style={{
                      background: pet.priority === "red" ? "rgba(239,68,68,0.1)" : pet.priority === "yellow" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                      color: pet.priority === "red" ? "#ef4444" : pet.priority === "yellow" ? "#f59e0b" : "#10b981",
                    }}>
                      {pet.priority === "red" ? "Urgente" : pet.priority === "yellow" ? "Média" : "Normal"}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: "rgba(45,58,45,0.35)" }}>{pet.tutor}</div>
                </div>
                <div className="text-sm font-bold" style={{ color: "#6b8e6b" }}>{pet.senha}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Animated cursor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: [0, 20, 40, 60], y: [0, 10, 5, 15] }}
          transition={{ duration: 3, delay: 1.5, ease: "easeInOut" }}
          className="absolute hidden sm:block pointer-events-none"
          style={{ top: "100px", right: "120px", zIndex: 20 }}
        >
          <MousePointer2 className="w-4 h-4 drop-shadow-md" style={{ color: "#2d3a2d" }} />
        </motion.div>

        {/* Toast notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-6 right-6 z-20 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
                <Bell className="w-4 h-4" style={{ color: "#ef4444" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#2d3a2d]">Chamando: Thor</p>
                <p className="text-[10px]" style={{ color: "rgba(45,58,45,0.4)" }}>Consultório 2 — Prioridade urgente</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function MobileMenuDrawer({ open, onClose, onNavigate, scrollTo }: { open: boolean; onClose: () => void; onNavigate: (path: string) => void; scrollTo: (id: string) => void }) {
  const navItems = [
    { label: "Funcionalidades", id: "funcionalidades" },
    { label: "Como Funciona", id: "como-funciona" },
    { label: "Quem Somos", id: "quem-somos" },
    { label: "Preços", id: "precos" },
    { label: "FAQ", id: "faq" },
    { label: "Contato", id: "contato" },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-72 flex flex-col"
            style={{ background: "#f8f7f4", borderLeft: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(107,142,107,0.12)" }}>
                  <PawPrint className="w-4 h-4" style={{ color: "#6b8e6b" }} />
                </div>
                <span className="text-[#2d3a2d] font-semibold text-sm">VetHub</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(45,58,45,0.06)" }}
              >
                <X className="w-4 h-4 text-[#2d3a2d]" />
              </motion.button>
            </div>

            <div className="flex-1 px-4 py-2 space-y-1">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onClick={() => { scrollTo(item.id); onClose() }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium relative overflow-hidden group"
                  style={{ color: "rgba(45,58,45,0.6)" }}
                >
                  <span className="absolute inset-0 rounded-xl bg-[rgba(107,142,107,0.06)] scale-0 group-hover:scale-100 transition-transform duration-300 ease-out origin-left" />
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {item.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ color: "#6b8e6b" }} />
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="p-4 space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onNavigate("/login"); onClose() }}
                className="w-full text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200"
                style={{ background: "#2d3a2d", color: "white" }}
              >
                Entrar no sistema
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.95])

  useEffect(() => {
    if (!loading && user) navigate(getSavedUnidade() ? "/recepcao" : "/selecionar-unidade")
  }, [user, loading, navigate])

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setShowBackToTop(latest > 0.15)
    setScrolled(latest > 0.02)
  })

  useEffect(() => {
    const sectionIds = ["funcionalidades", "como-funciona", "quem-somos", "precos", "faq", "contato"]
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f7f4" }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[#2d3a2d]/40 text-sm"
        >
          Carregando...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "#e8e4de" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #e8e4de; }
        ::-webkit-scrollbar-thumb { background: rgba(107,142,107,0.25); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(107,142,107,0.4); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes dots {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .hero-dots {
          background-image: radial-gradient(circle, rgba(107,142,107,0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: dots 20s linear infinite;
        }
      `}</style>

      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={(path) => navigate(path)}
        scrollTo={scrollTo}
      />

      {/* ===== NAVBAR ===== */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(232,228,222,0.95)" : "rgba(232,228,222,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
              style={{ background: "rgba(107,142,107,0.12)" }}
              whileHover={{ rotate: [0, -8, 8, 0], background: "rgba(107,142,107,0.18)" }}
              transition={{ duration: 0.4 }}
            >
              <PawPrint className="w-4 h-4 transition-colors duration-300" style={{ color: "#6b8e6b" }} />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="text-[#2d3a2d] font-semibold text-sm tracking-tight">VetHub</span>
              <span className="text-[#2d3a2d]/35 text-[9px] tracking-wide">Gestão Veterinária</span>
            </div>
          </motion.button>
          <div className="hidden md:flex items-center gap-2">
            {[
              { label: "Funcionalidades", id: "funcionalidades" },
              { label: "Como Funciona", id: "como-funciona" },
              { label: "Quem Somos", id: "quem-somos" },
              { label: "Preços", id: "precos" },
              { label: "FAQ", id: "faq" },
              { label: "Contato", id: "contato" },
            ].map((item, i) => {
              const isActive = activeSection === item.id
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onClick={() => scrollTo(item.id)}
                  className="relative px-3.5 py-2 rounded-lg text-sm overflow-hidden group"
                  style={{ color: isActive ? "#2d3a2d" : "rgba(45,58,45,0.45)", fontWeight: isActive ? 600 : 400 }}
                >
                  {/* Hover background pill */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    initial={false}
                    animate={{
                      backgroundColor: isActive ? "rgba(107,142,107,0.08)" : "rgba(107,142,107,0)",
                      scale: isActive ? 1 : 0.8,
                    }}
                    whileHover={{ backgroundColor: "rgba(107,142,107,0.06)", scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                  {/* Text */}
                  <span className="relative z-10 inline-block transition-transform duration-200 group-hover:-translate-y-0.5">
                    {item.label}
                  </span>
                  {/* Underline indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg, #6b8e6b, #4a7a4a)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                  {/* Hover underline */}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] rounded-full group-hover:w-[60%] transition-all duration-300 ease-out" style={{ background: "rgba(107,142,107,0.25)" }} />
                </motion.button>
              )
            })}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.04, boxShadow: "0 6px 20px rgba(45,58,45,0.18)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-200 relative overflow-hidden group"
              style={{ background: "#2d3a2d", color: "white" }}
            >
              <span className="relative z-10">Entrar</span>
              <div className="absolute inset-0 bg-[#3d4a3d] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl" />
            </motion.button>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => navigate("/login")}
              className="text-sm font-medium px-4 py-2 rounded-xl"
              style={{ background: "rgba(45,58,45,0.08)", color: "#2d3a2d" }}
            >
              Entrar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(45,58,45,0.08)" }}
            >
              <Menu className="w-5 h-5 text-[#2d3a2d]" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ===== HERO ===== */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24"
      >
        {/* Dots pattern background */}
        <div className="absolute inset-0 hero-dots pointer-events-none" />

        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 2, 0], x: [0, 10, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-20 w-80 h-80 rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #6b8e6b 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, -2, 0], y: [0, -15, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #6b8e6b 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
            style={{ background: "radial-gradient(circle, #4a7a4a 0%, transparent 60%)" }}
          />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 40%, rgba(107,142,107,0.06) 0%, transparent 100%)" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium relative overflow-hidden"
              style={{ background: "rgba(107,142,107,0.08)", border: "1px solid rgba(107,142,107,0.15)", color: "#6b8e6b" }}
            >
              <motion.div
                animate={{ x: [-20, 200] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                className="absolute inset-0 w-8 h-full opacity-30"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
              />
              <Sparkles className="w-3.5 h-3.5" />
              Sistema de gestão veterinária
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl relative"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.04)" }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl"
                style={{ background: "rgba(107,142,107,0.05)" }}
              />
              <PawPrint className="w-10 h-10 relative z-10" style={{ color: "#6b8e6b" }} />
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-5 leading-[1.08]" style={{ color: "#1a2e1a" }}>
              Gestão veterinária{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #6b8e6b, #3d6b3d, #6b8e6b)", backgroundSize: "200% auto", animation: "shimmer 4s ease-in-out infinite" }}>
                simplificada
              </span>
            </h1>
            <style>{`@keyframes shimmer { 0%,100% { background-position: 0% center; } 50% { background-position: 200% center; } }`}</style>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg max-w-lg mx-auto mb-10 leading-relaxed"
              style={{ color: "rgba(26,46,26,0.45)" }}
            >
              Organize a fila de espera, gerencie prontuários, agende consultas e exiba tudo nos painéis da sua clínica — de um jeito simples e eficiente.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center justify-center gap-4 flex-wrap mb-16"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(45,58,45,0.2)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="group inline-flex items-center gap-2.5 font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl"
                style={{ background: "#2d3a2d", color: "white" }}
              >
                Acessar o sistema
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.button>
              <motion.button
                whileHover={{ x: 3 }}
                onClick={() => scrollTo("funcionalidades")}
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: "rgba(26,46,26,0.4)" }}
              >
                Ver funcionalidades
              </motion.button>
            </motion.div>

            {/* Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
              className="px-4"
            >
              <DashboardMockup />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5" style={{ border: "1px solid rgba(45,58,45,0.15)" }}>
              <div className="w-1 h-2 rounded-full" style={{ background: "rgba(45,58,45,0.25)" }} />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ===== NÚMEROS ===== */}
      <section className="px-6 py-24 overflow-hidden" style={{ background: "#ede9e4" }}>
        <style>{`
          @keyframes stats-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .stats-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="max-w-5xl mx-auto hidden lg:grid lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(107,142,107,0.1)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#6b8e6b" }} />
                </motion.div>
                <div className="text-3xl sm:text-4xl font-bold text-[#2d3a2d] mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} k={!!stat.k} />
                </div>
                <p className="text-sm" style={{ color: "rgba(45,58,45,0.45)" }}>{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
        <div className="lg:hidden">
          <div className="stats-track flex gap-8" style={{ animation: "stats-marquee 12s linear infinite", width: "max-content" }}>
            {[...stats, ...stats].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={`${stat.label}-${i}`} className="text-center min-w-[140px] shrink-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(107,142,107,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#6b8e6b" }} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-[#2d3a2d] mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} k={!!stat.k} />
                  </div>
                  <p className="text-sm" style={{ color: "rgba(45,58,45,0.45)" }}>{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="px-6 py-32">
        <SectionTitle
          badge="simples e rápido"
          title="Como funciona"
          desc="Do cadastro ao primeiro atendimento, tudo é rápido e intuitivo. Três passos para transformar sua clínica."
        />

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(107,142,107,0.2), transparent)" }} />

          {howItWorks.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="text-center relative"
              >
                <motion.div
                  whileHover={{ scale: 1.1, y: -4 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10"
                  style={{ background: "rgba(107,142,107,0.1)", border: "1px solid rgba(107,142,107,0.12)" }}
                >
                  <Icon className="w-7 h-7" style={{ color: "#6b8e6b" }} />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.3 + i * 0.15 }}
                  className="absolute top-0 right-[calc(50%-40px)] w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-20"
                  style={{ background: "#6b8e6b" }}
                >
                  {step.step}
                </motion.div>
                <h3 className="text-[#2d3a2d] font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-[#2d3a2d]/40 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ===== FUNCIONALIDADES ===== */}
      <section id="funcionalidades" className="px-6 py-32" style={{ background: "#ede9e4" }}>
        <SectionTitle
          badge="ferramentas pensadas pra você"
          title="Tudo que sua clínica precisa"
          desc="Do check-in à saída do paciente, o VetHub acompanha cada etapa do atendimento com ferramentas pensadas para a rotina veterinária."
        />

        {/* Featured feature - first one */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto mb-8"
        >
          <div className="rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8" style={{ background: "#f4f1ec", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }}>
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(107,142,107,0.1)" }}
            >
              <ClipboardList className="w-10 h-10" style={{ color: "#6b8e6b" }} />
            </motion.div>
            <div className="text-center sm:text-left">
              <h3 className="text-[#2d3a2d] font-bold text-xl mb-2">Fila de Espera Inteligente</h3>
              <p className="text-[#2d3a2d]/40 text-sm leading-relaxed mb-4">Triagem por prioridade com cores, chamada automática por voz (TTS) e exibição em tempo real nos painéis da clínica. Reduza o tempo de espera e organize o fluxo de atendimento.</p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {["Prioridade vermelha/amarela/verde", "Chamada por voz (TTS)", "Histórico de chamadas"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(107,142,107,0.08)", color: "#6b8e6b" }}>
                    <Check className="w-3 h-3" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rest of features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.slice(1).map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 }, boxShadow: "0 8px 32px rgba(107,142,107,0.06)" }}
                className="rounded-2xl p-6"
                style={{ background: "#f4f1ec", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}
              >
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(107,142,107,0.1)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#6b8e6b" }} />
                </motion.div>
                <h3 className="text-[#2d3a2d] font-semibold text-sm mb-2">{item.title}</h3>
                <p className="text-[#2d3a2d]/40 text-xs leading-relaxed mb-4">{item.desc}</p>
                <ul className="space-y-1.5">
                  {item.items.map((sub) => (
                    <li key={sub} className="flex items-center gap-2 text-xs" style={{ color: "rgba(107,142,107,0.65)" }}>
                      <Check className="w-3 h-3 shrink-0" />
                      {sub}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ===== QUEM SOMOS ===== */}
      <section id="quem-somos" className="px-6 py-32">
        <SectionTitle
          title="Quem somos"
          desc="Desenvolvemos tecnologia para tornar a gestão do atendimento veterinário mais simples, eficiente e transparente, ajudando clínicas a oferecerem uma experiência cada vez melhor aos seus pacientes e responsáveis."
        />

        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-8 items-stretch">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ 
                y: -8, 
                boxShadow: "0 20px 50px rgba(107,142,107,0.15), 0 0 0 1px rgba(107,142,107,0.1)",
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="rounded-3xl overflow-hidden text-center flex flex-col items-center cursor-default group"
              style={{ 
                background: "linear-gradient(145deg, #f0ece6 0%, #e8e4de 100%)", 
                border: "1px solid rgba(0,0,0,0.04)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)"
              }}
            >
              {/* Cover Video / Header */}
              <div className="relative w-full h-40 overflow-hidden">
                {member.video ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  >
                    <source src={member.video} type="video/mp4" />
                  </video>
                ) : (
                  <div 
                    className="w-full h-full"
                    style={{ 
                      background: "linear-gradient(135deg, rgba(107,142,107,0.15) 0%, rgba(107,142,107,0.05) 100%)" 
                    }}
                  />
                )}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.2) 100%)" }}
                />
              </div>

              {/* Profile Photo - overlapping the cover */}
              <div className="relative -mt-16 mb-4 z-10">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                  whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.15, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg relative"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(107,142,107,0.12) 0%, rgba(107,142,107,0.05) 100%)",
                    boxShadow: "0 8px 32px rgba(107,142,107,0.12), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 0 4px #f0ece6"
                  }}
                >
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold" style={{ color: "rgba(107,142,107,0.3)" }}>
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                  )}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: "linear-gradient(135deg, rgba(107,142,107,0.1) 0%, transparent 50%)" }}
                  />
                </motion.div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 pt-0 flex flex-col items-center flex-1 w-full">
                <motion.h3 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
                  className="text-[#2d3a2d] font-semibold text-lg mb-1"
                >
                  {member.name}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                  className="text-sm mb-3 font-medium" 
                  style={{ color: "#6b8e6b" }}
                >
                  {member.role}
                </motion.p>
                <p className="text-[#2d3a2d]/40 text-xs leading-relaxed mb-5 max-w-xs mx-auto">{member.bio}</p>
                <p className="text-[#2d3a2d]/25 text-xs mb-5">{member.unidade}</p>
                <div className="flex items-center justify-center gap-3 mt-auto">
                  {[
                    { icon: Globe, href: member.links.portfolio },
                    { icon: GithubIcon, href: member.links.github },
                    { icon: LinkedinIcon, href: member.links.linkedin },
                  ].map((link, j) => {
                    const LinkIcon = link.icon
                    return (
                    <motion.a
                      key={`${member.name}-${j}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.8 + i * 0.15 + j * 0.1 }}
                      whileHover={{ 
                        scale: 1.2, 
                        y: -3,
                        boxShadow: "0 6px 20px rgba(107,142,107,0.2)"
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{ 
                        background: "rgba(107,142,107,0.08)",
                        boxShadow: "0 2px 8px rgba(107,142,107,0.08)"
                      }}
                    >
                      <LinkIcon className="w-4 h-4 transition-colors duration-300" style={{ color: "#6b8e6b" }} />
                    </motion.a>
                  )
                })}
              </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== PREÇOS ===== */}
      <section id="precos" className="px-6 py-32" style={{ background: "#ede9e4" }}>
        <SectionTitle
          badge="precos"
          title="Planos transparentes"
          desc="Todos os planos estão avaliados em R$ 0,00 — isso mesmo, você não leu errado. Teste à vontade."
        />

        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative rounded-2xl p-8"
              style={{
                background: plan.popular ? "#f4f1ec" : "#e8e4de",
                border: plan.popular ? "2px solid rgba(107,142,107,0.2)" : "1px solid rgba(0,0,0,0.04)",
                boxShadow: plan.popular ? "0 8px 32px rgba(107,142,107,0.08)" : "none",
              }}
            >
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "#6b8e6b", color: "white" }}
                >
                  Mais popular
                </motion.div>
              )}
              <h3 className="text-[#2d3a2d] font-semibold text-lg mb-1">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-[#2d3a2d]">{plan.price}</span>
                <span className="text-[#2d3a2d]/20 text-sm ml-1">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: "rgba(45,58,45,0.55)" }}
                  >
                    <Check className="w-4 h-4 shrink-0" style={{ color: "#6b8e6b" }} />
                    {f}
                  </motion.li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: plan.popular ? "0 8px 24px rgba(45,58,45,0.2)" : undefined }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: plan.popular ? "#2d3a2d" : "rgba(45,58,45,0.08)",
                  color: plan.popular ? "white" : "#2d3a2d",
                }}
              >
                Começar agora
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== DEPOIMENTOS ===== */}
      <section className="px-6 py-24">
        <FadeInView className="max-w-2xl mx-auto text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(107,142,107,0.08)" }}
          >
            <Quote className="w-5 h-5" style={{ color: "#6b8e6b" }} />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Star rating */}
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.div
                    key={star}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: star * 0.05 }}
                  >
                    <Star className="w-4 h-4 fill-current" style={{ color: "#f59e0b" }} />
                  </motion.div>
                ))}
              </div>

              <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-6" style={{ color: "rgba(26,46,26,0.7)" }}>
                "{testimonials[testimonialIdx].quote}"
              </blockquote>

              {/* Author with avatar */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(107,142,107,0.1)" }}>
                  <span className="text-xs font-bold" style={{ color: "#6b8e6b" }}>
                    {testimonials[testimonialIdx].author.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: "#2d3a2d" }}>{testimonials[testimonialIdx].author}</p>
                  <p className="text-xs" style={{ color: "rgba(45,58,45,0.35)" }}>{testimonials[testimonialIdx].clinic}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows + dots */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(107,142,107,0.1)" }}
            >
              <ChevronDown className="w-4 h-4 rotate-90" style={{ color: "#6b8e6b" }} />
            </motion.button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i === testimonialIdx ? "#6b8e6b" : "rgba(107,142,107,0.2)",
                    width: i === testimonialIdx ? 24 : 8,
                  }}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTestimonialIdx((prev) => (prev + 1) % testimonials.length)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(107,142,107,0.1)" }}
            >
              <ChevronDown className="w-4 h-4 -rotate-90" style={{ color: "#6b8e6b" }} />
            </motion.button>
          </div>
        </FadeInView>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="px-6 py-32" style={{ background: "#ede9e4" }}>
        <SectionTitle
          title="Perguntas frequentes"
          desc="Dúvidas comuns sobre o VetHub. Se não encontrar o que procura, fale com a gente."
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-3"
        >
          {faqs.map((faq, i) => (
            <FadeInView key={i} delay={i * 0.05}>
              <FAQItem
                question={faq.q}
                answer={faq.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            </FadeInView>
          ))}
        </motion.div>
      </section>

      {/* ===== CONTATO ===== */}
      <section id="contato" className="px-6 py-32">
        <SectionTitle
          title="Entre em contato"
          desc="Tem alguma dúvida, sugestão ou quer saber mais? Mande uma mensagem para a gente."
        />

        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "contato@vethub.com.br", href: "mailto:contato@vethub.com.br" },
              { icon: Phone, label: "Telefone", value: "(19) 99999-9999", href: "tel:+5519999999999" },
              { icon: MapPin, label: "Localização", value: "Piracicaba & Mooca — SP", href: "#" },
              { icon: MessageCircle, label: "WhatsApp", value: "(19) 99999-9999", href: "#" },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ x: 4, boxShadow: "0 4px 16px rgba(107,142,107,0.06)" }}
                  className="flex items-center gap-4 rounded-2xl p-5 transition-all duration-200"
                  style={{ background: "#f4f1ec", border: "1px solid rgba(0,0,0,0.04)" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(107,142,107,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#6b8e6b" }} />
                  </div>
                  <div>
                    <p className="text-[#2d3a2d]/30 text-xs mb-0.5">{item.label}</p>
                    <p className="text-[#2d3a2d] text-sm font-medium">{item.value}</p>
                  </div>
                </motion.a>
              )
            })}
          </div>

          <FadeInView delay={0.2}>
            <div className="rounded-2xl p-8" style={{ background: "#f4f1ec", border: "1px solid rgba(0,0,0,0.04)" }}>
              <h3 className="text-[#2d3a2d] font-semibold text-base mb-5">Mande uma mensagem</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <motion.input whileFocus={{ scale: 1.01, borderColor: "rgba(107,142,107,0.3)" }} type="text" placeholder="Nome" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ background: "#ede9e4", border: "1px solid rgba(0,0,0,0.06)", color: "#2d3a2d" }} />
                  <motion.input whileFocus={{ scale: 1.01, borderColor: "rgba(107,142,107,0.3)" }} type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ background: "#ede9e4", border: "1px solid rgba(0,0,0,0.06)", color: "#2d3a2d" }} />
                </div>
                <motion.input whileFocus={{ scale: 1.01, borderColor: "rgba(107,142,107,0.3)" }} type="text" placeholder="Assunto" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ background: "#ede9e4", border: "1px solid rgba(0,0,0,0.06)", color: "#2d3a2d" }} />
                <motion.textarea whileFocus={{ scale: 1.01, borderColor: "rgba(107,142,107,0.3)" }} rows={4} placeholder="Mensagem" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none" style={{ background: "#ede9e4", border: "1px solid rgba(0,0,0,0.06)", color: "#2d3a2d" }} />
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(45,58,45,0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full font-semibold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
                  style={{ background: "#2d3a2d", color: "white" }}
                >
                  <Send className="w-4 h-4" />
                  Enviar mensagem
                </motion.button>
              </form>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="px-6 py-32" style={{ background: "#ede9e4" }}>
        <FadeInView className="max-w-3xl mx-auto text-center rounded-3xl p-12 sm:p-16 relative overflow-hidden" style={{ background: "#2d3a2d" }}>
          {/* Decorative gradient orbs in CTA */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6b8e6b, transparent 70%)" }} />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #8bb88b, transparent 70%)" }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Vamos transformar sua clínica?
            </h2>
            <p className="text-white/50 max-w-md mx-auto text-sm leading-relaxed mb-8">
              Fale com nosso time de vendas e descubra como o VetHub pode transformar sua clínica.
            </p>
            <motion.a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2.5 bg-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl"
              style={{ color: "#2d3a2d" }}
            >
              Falar com vendas
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </FadeInView>
      </section>

      {/* ===== BACK TO TOP ===== */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1, boxShadow: "0 8px 24px rgba(45,58,45,0.15)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all"
            style={{ background: "#2d3a2d", color: "white" }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
