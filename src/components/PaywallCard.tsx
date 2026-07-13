import { useDemo } from "../context/DemoContext"
import { Lock, Crown, Zap, Shield, BarChart3, Building2, FileDown, CreditCard } from "lucide-react"
import type { ReactNode } from "react"

const FEATURE_META: Record<string, { title: string; description: string; icon: ReactNode; benefits: string[] }> = {
  estoque: {
    title: "Estoque & Farmácia",
    description: "Gerencie medicamentos, controle entradas/saídas, alertas de validade e estoque mínimo.",
    icon: <Zap size={28} />,
    benefits: [
      "Cadastro completo de medicamentos",
      "Controle de entradas e saídas",
      "Alertas de estoque baixo e vencido",
      "Relatório de consumo por período",
      "Histórico completo de movimentações",
    ],
  },
  veterinarios: {
    title: "Gestão de Veterinários",
    description: "Cadastre veterinários, CRMV, especialidades e acompanhe a performance da equipe.",
    icon: <Shield size={28} />,
    benefits: [
      "Cadastro com CRMV e especialidade",
      "Vinculação a unidades",
      "Relatórios de atendimento por vet",
      "Gestão de agenda e disponibilidade",
    ],
  },
  financeiro: {
    title: "Financeiro Completo",
    description: "Dashboard financeiro, faturamento, pagamentos, DRE e conciliação bancária.",
    icon: <BarChart3 size={28} />,
    benefits: [
      "Dashboard com KPIs em tempo real",
      "Demonstração do Resultado (DRE)",
      "Conciliação bancária",
      "Relatórios por período e unidade",
      "Fechamento de caixa diário",
    ],
  },
  faturamento: {
    title: "Faturamento & Cobrança",
    description: "Crie faturas, registre pagamentos, gere boletos e acompanhe o fluxo de caixa.",
    icon: <CreditCard size={28} />,
    benefits: [
      "Criação de faturas com itens",
      "Múltiplos métodos de pagamento",
      "Geração de boletos",
      "Status: Aberta, Parcial, Paga, Cancelada",
      "Histórico completo de pagamentos",
    ],
  },
  multi_unidade: {
    title: "Multi-Unidade",
    description: "Gerencie múltiplas filiais com dados consolidados e isolados por unidade.",
    icon: <Building2 size={28} />,
    benefits: [
      "Cadastro ilimitado de filiais",
      "Dados isolados por unidade",
      "Dashboard consolidado",
      "Gestão centralizada de equipe",
    ],
  },
  exportacoes: {
    title: "Exportações & Relatórios",
    description: "Exporte dados em PDF e CSV, gere relatórios mensais e análises detalhadas.",
    icon: <FileDown size={28} />,
    benefits: [
      "Exportação em PDF formatado",
      "Exportação em CSV para Excel",
      "Relatórios mensais automáticos",
      "Relatórios de consumo e financeiro",
    ],
  },
  financeiro_avancado: {
    title: "Financeiro Avançado",
    description: "DRE, conciliação bancária, relatórios gerenciais e análise de rentabilidade.",
    icon: <BarChart3 size={28} />,
    benefits: [
      "Demonstração do Resultado (DRE)",
      "Conciliação bancária automática",
      "Análise de rentabilidade por serviço",
      "Relatórios gerenciais avançados",
      "Projeções financeiras",
    ],
  },
  relatorios: {
    title: "Relatórios Avançados",
    description: "Relatórios completos com gráficos, análises comparativas e indicadores.",
    icon: <BarChart3 size={28} />,
    benefits: [
      "Relatórios mensais consolidados",
      "Gráficos e análises visuais",
      "Comparativo entre períodos",
      "Indicadores de performance",
    ],
  },
}

interface PaywallCardProps {
  feature: string
  children?: ReactNode
}

export default function PaywallCard({ feature, children }: PaywallCardProps) {
  const { isDemo } = useDemo()

  if (!isDemo) return <>{children}</>

  const meta = FEATURE_META[feature] || {
    title: feature,
    description: "Esta feature está disponível no plano premium.",
    icon: <Crown size={28} />,
    benefits: [],
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", padding: 40, textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,88,12,0.15))",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24, color: "#f59e0b",
      }}>
        {meta.icon}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Lock size={18} color="#f59e0b" />
        <span style={{
          fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const,
          letterSpacing: "0.08em", color: "#f59e0b",
          padding: "4px 12px", borderRadius: 100,
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
        }}>
          Premium
        </span>
      </div>

      <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-primary)", marginBottom: 8 }}>
        {meta.title}
      </h2>
      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", maxWidth: 480, marginBottom: 28, lineHeight: 1.6 }}>
        {meta.description}
      </p>

      {meta.benefits.length > 0 && (
        <div style={{
          background: "rgba(15,118,110,0.04)", border: "1px solid rgba(15,118,110,0.1)",
          borderRadius: 14, padding: "20px 28px", marginBottom: 28, maxWidth: 440, width: "100%",
          textAlign: "left",
        }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
            O que está incluso:
          </div>
          {meta.benefits.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: "0.88rem", color: "var(--text-dark)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-primary)", flexShrink: 0 }} />
              {b}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => window.open("https://wa.me/5500000000000?text=Olá! Quero assinar o plano premium do VetHub!", "_blank")}
        className="btn-magnetic"
        style={{
          padding: "14px 36px", fontSize: "1rem", fontWeight: 700, borderRadius: 12,
          background: "linear-gradient(135deg, #0f766e, #0d9488)", color: "#fff",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 4px 16px rgba(15,118,110,0.3)",
        }}
      >
        <Crown size={18} /> Assinar Premium
      </button>

      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 16 }}>
        Acesso liberado imediatamente após confirmação
      </p>
    </div>
  )
}
