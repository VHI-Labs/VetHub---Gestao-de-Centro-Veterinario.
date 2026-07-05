import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import {
  PawPrint, ArrowRight, ClipboardList, Users, Calendar, Tv,
  Sparkles, ChevronDown, Mail, Phone, MapPin, Check,
  Github, Linkedin, Globe, MessageCircle, Zap, Shield,
  BarChart3, Smartphone, Quote, Heart, Activity, Clock
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

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
    links: { github: "https://github.com/vihisantos", portfolio: "https://vihisantos.github.io/My.Portfolio/", linkedin: "#" },
    campus: "NSI — Piracicaba"
  },
  {
    name: "Ingrid Brito", role: "Desenvolvedora Full Stack",
    bio: "Cocriadora do VetHub. Apaixonada por tecnologia e soluções que transformam o dia a dia das clínicas veterinárias.",
    links: { github: "#", portfolio: "https://ingridbrito.dev", linkedin: "#" },
    campus: "NSI — Mooca"
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
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
  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(0,0,0,0.06)", background: "#f4f1ec" }}>
      {/* Browser top bar */}
      <div className="flex items-center gap-2 px-5 py-3.5" style={{ background: "#e8e4de", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
        <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
        <div className="ml-4 flex-1 max-w-md mx-auto rounded-lg py-1.5 px-3 text-center text-xs" style={{ background: "rgba(255,255,255,0.5)", color: "rgba(45,58,45,0.3)" }}>
          app.vethub.com.br
        </div>
      </div>

      {/* Dashboard layout */}
      <div className="flex h-[400px] sm:h-[480px]">
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
              {[ClipboardList, Users, Calendar, BarChart3][i] && (
                <span className="w-4 h-4 flex items-center justify-center">
                  {i === 0 && <ClipboardList className="w-3.5 h-3.5" />}
                  {i === 1 && <Users className="w-3.5 h-3.5" />}
                  {i === 2 && <Calendar className="w-3.5 h-3.5" />}
                  {i === 3 && <BarChart3 className="w-3.5 h-3.5" />}
                </span>
              )}
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
              <div className="h-8 w-20 rounded-lg" style={{ background: "rgba(45,58,45,0.08)" }} />
              <div className="h-8 w-20 rounded-lg" style={{ background: "#2d3a2d" }} />
            </div>
          </div>

          {/* Queue items */}
          <div className="space-y-3">
            {[
              { priority: "red", name: "Thor", tutor: "Carlos Silva", senha: "A001", specie: "🐕" },
              { priority: "yellow", name: "Luna", tutor: "Mariana Souza", senha: "A002", specie: "🐱" },
              { priority: "green", name: "Bolinha", tutor: "Pedro Alves", senha: "A003", specie: "🐕" },
              { priority: "green", name: "Pipoca", tutor: "Ana Costa", senha: "A004", specie: "🐰" },
            ].map((pet) => (
              <div key={pet.senha} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.04)" }}>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.95])

  useEffect(() => {
    if (!loading && user) navigate("/selecionar-campus")
  }, [user, loading, navigate])

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

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
      `}</style>

      {/* ===== NAVBAR ===== */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "rgba(232,228,222,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(107,142,107,0.12)" }}>
              <PawPrint className="w-4 h-4" style={{ color: "#6b8e6b" }} />
            </div>
            <span className="text-[#2d3a2d] font-semibold text-sm tracking-tight">VetHub</span>
          </motion.button>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Funcionalidades", id: "funcionalidades" },
              { label: "Quem Somos", id: "quem-somos" },
              { label: "Preços", id: "precos" },
              { label: "FAQ", id: "faq" },
              { label: "Contato", id: "contato" },
            ].map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => scrollTo(item.id)}
                className="text-[#2d3a2d]/40 hover:text-[#2d3a2d]/80 text-sm transition-colors"
              >
                {item.label}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
              style={{ background: "#2d3a2d", color: "white" }}
            >
              Entrar
            </motion.button>
          </div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate("/login")}
            className="md:hidden text-sm font-medium px-4 py-2 rounded-xl"
            style={{ background: "rgba(45,58,45,0.08)", color: "#2d3a2d" }}
          >
            Entrar
          </motion.button>
        </div>
      </motion.nav>

      {/* ===== HERO ===== */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24"
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 1, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-20 w-72 h-72 rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #6b8e6b 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, -1, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 -right-20 w-96 h-96 rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #6b8e6b 0%, transparent 70%)" }}
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium"
              style={{ background: "rgba(107,142,107,0.08)", border: "1px solid rgba(107,142,107,0.15)", color: "#6b8e6b" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sistema de gestão veterinária
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.04)" }}
            >
              <PawPrint className="w-10 h-10" style={{ color: "#6b8e6b" }} />
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-5 leading-[1.08]" style={{ color: "#1a2e1a" }}>
              Gestão veterinária{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #6b8e6b, #4a7a4a)" }}>
                simplificada
              </span>
            </h1>

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
                whileHover={{ scale: 1.03 }}
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
      <section className="px-6 py-24" style={{ background: "#ede9e4" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
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
      </section>

      {/* ===== FUNCIONALIDADES ===== */}
      <section id="funcionalidades" className="px-6 py-32">
        <SectionTitle
          badge="funcionalidades"
          title="Tudo que sua clínica precisa"
          desc="Do check-in à saída do paciente, o VetHub acompanha cada etapa do atendimento com ferramentas pensadas para a rotina veterinária."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
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
      <section id="quem-somos" className="px-6 py-32" style={{ background: "#ede9e4" }}>
        <SectionTitle
          title="Quem somos"
          desc="Dois estudantes de NSI que uniram forças para criar uma solução que faz diferença no dia a dia das clínicas veterinárias."
        />

        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4 }}
              className="rounded-2xl p-8 text-center"
              style={{ background: "#e8e4de", border: "1px solid rgba(0,0,0,0.04)" }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className="w-28 h-28 rounded-2xl mx-auto mb-5 overflow-hidden shadow-lg flex items-center justify-center"
                style={{ background: "rgba(107,142,107,0.08)" }}
              >
                <PawPrint className="w-10 h-10" style={{ color: "rgba(107,142,107,0.3)" }} />
              </motion.div>
              <h3 className="text-[#2d3a2d] font-semibold text-lg mb-1">{member.name}</h3>
              <p className="text-sm mb-3 font-medium" style={{ color: "#6b8e6b" }}>{member.role}</p>
              <p className="text-[#2d3a2d]/40 text-xs leading-relaxed mb-5 max-w-xs mx-auto">{member.bio}</p>
              <p className="text-[#2d3a2d]/25 text-xs mb-5">{member.campus}</p>
              <div className="flex items-center justify-center gap-3">
                {[
                  { icon: Globe, href: member.links.portfolio },
                  { icon: Github, href: member.links.github },
                  { icon: Linkedin, href: member.links.linkedin },
                ].map((link) => {
                  const LinkIcon = link.icon
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.15, y: -2 }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: "rgba(107,142,107,0.08)" }}
                    >
                      <LinkIcon className="w-4 h-4" style={{ color: "#6b8e6b" }} />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== PREÇOS ===== */}
      <section id="precos" className="px-6 py-32">
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
                whileHover={{ scale: 1.02 }}
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
      <section className="px-6 py-24" style={{ background: "#ede9e4" }}>
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
              <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-6" style={{ color: "rgba(26,46,26,0.7)" }}>
                "{testimonials[testimonialIdx].quote}"
              </blockquote>
              <p className="text-sm font-semibold" style={{ color: "#2d3a2d" }}>— {testimonials[testimonialIdx].author}</p>
              <p className="text-xs" style={{ color: "rgba(45,58,45,0.35)" }}>{testimonials[testimonialIdx].clinic}</p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
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
        </FadeInView>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="px-6 py-32">
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
      <section id="contato" className="px-6 py-32" style={{ background: "#ede9e4" }}>
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
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 rounded-2xl p-5 transition-all duration-200"
                  style={{ background: "#e8e4de", border: "1px solid rgba(0,0,0,0.04)" }}
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
            <div className="rounded-2xl p-8" style={{ background: "#e8e4de", border: "1px solid rgba(0,0,0,0.04)" }}>
              <h3 className="text-[#2d3a2d] font-semibold text-base mb-5">Mande uma mensagem</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <motion.input whileFocus={{ scale: 1.01 }} type="text" placeholder="Nome" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ background: "#f4f1ec", border: "1px solid rgba(0,0,0,0.06)", color: "#2d3a2d" }} />
                  <motion.input whileFocus={{ scale: 1.01 }} type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ background: "#f4f1ec", border: "1px solid rgba(0,0,0,0.06)", color: "#2d3a2d" }} />
                </div>
                <motion.input whileFocus={{ scale: 1.01 }} type="text" placeholder="Assunto" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ background: "#f4f1ec", border: "1px solid rgba(0,0,0,0.06)", color: "#2d3a2d" }} />
                <motion.textarea whileFocus={{ scale: 1.01 }} rows={4} placeholder="Mensagem" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none" style={{ background: "#f4f1ec", border: "1px solid rgba(0,0,0,0.06)", color: "#2d3a2d" }} />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full font-semibold py-3 rounded-xl transition-all duration-200 text-sm"
                  style={{ background: "#2d3a2d", color: "white" }}
                >
                  Enviar mensagem
                </motion.button>
              </form>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="px-6 py-32">
        <FadeInView className="max-w-3xl mx-auto text-center rounded-3xl p-12 sm:p-16" style={{ background: "#2d3a2d" }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Vamos transformar sua clínica?
          </h2>
          <p className="text-white/50 max-w-md mx-auto text-sm leading-relaxed mb-8">
            Cadastre-se agora e comece a usar o VetHub de graça. Sem compromisso, sem cartão de crédito.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            className="group inline-flex items-center gap-2.5 bg-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl"
            style={{ color: "#2d3a2d" }}
          >
            Começar agora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </FadeInView>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative overflow-hidden" style={{ background: "#e8e6e0", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
        <style>{`
          @keyframes floatParticle {
            0% { transform: translateY(0) scale(1); opacity: 0.2; }
            100% { transform: translateY(-24px) scale(1.3); opacity: 0.4; }
          }
        `}</style>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + (i % 2) * 2}px`,
                height: `${2 + (i % 2) * 2}px`,
                background: "rgba(107,142,107,0.2)",
                left: `${15 + i * 20}%`,
                top: `${30 + (i * 12) % 50}%`,
                animation: `floatParticle ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite alternate`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(107,142,107,0.12)" }}>
                  <PawPrint className="w-4 h-4" style={{ color: "#6b8e6b" }} />
                </div>
                <span className="text-[#2d3a2d] font-semibold text-sm">VetHub</span>
              </div>
              <p className="text-[#2d3a2d]/35 text-xs leading-relaxed">
                Sistema de gestão veterinária desenvolvido por estudantes de NSI para transformar o atendimento em clínicas de todo o Brasil.
              </p>
            </motion.div>

            {[
              {
                title: "Produto",
                links: [
                  { label: "Funcionalidades", id: "funcionalidades" },
                  { label: "Preços", id: "precos" },
                  { label: "FAQ", id: "faq" },
                ]
              },
              {
                title: "Empresa",
                links: [
                  { label: "Quem Somos", id: "quem-somos" },
                  { label: "Contato", id: "contato" },
                  { label: "Blog", href: "#" },
                ]
              },
              {
                title: "Redes",
                links: [
                  { label: "GitHub", href: "https://github.com/vihisantos" },
                  { label: "Portfolio Vitor", href: "https://vihisantos.github.io/My.Portfolio/" },
                  { label: "Portfolio Ingrid", href: "https://ingridbrito.dev" },
                ]
              },
            ].map((col) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h4 className="text-[#2d3a2d]/50 text-xs font-semibold uppercase tracking-widest mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link: { label: string; id?: string; href?: string }) => (
                    <li key={link.label}>
                      <motion.button
                        whileHover={{ x: 3 }}
                        onClick={() => {
                          if ("id" in link && link.id) scrollTo(link.id)
                          else if ("href" in link && link.href) window.open(link.href, "_blank")
                        }}
                        className="text-[#2d3a2d]/30 hover:text-[#2d3a2d]/60 text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-black/5 py-6 px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#2d3a2d]/25 text-xs text-center sm:text-left">
              &copy; {new Date().getFullYear()} VetHub. Feito com dedicação por{" "}
              <a href="https://vihisantos.github.io/My.Portfolio/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[#2d3a2d]/50 transition-colors">Vitor Santos</a>
              {" "}&{" "}
              <a href="https://ingridbrito.dev" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[#2d3a2d]/50 transition-colors">Ingrid Brito</a>
              .
            </p>
            <p className="text-[#2d3a2d]/15 text-[11px] tracking-widest">v 1.0.0</p>
            <div className="flex items-center gap-4">
              {[Github, Linkedin, Mail].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -2, scale: 1.1 }}
                  className="transition-colors"
                  style={{ color: "rgba(45,58,45,0.2)" }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
