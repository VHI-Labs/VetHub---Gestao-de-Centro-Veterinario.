import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./AuthContext"

interface DemoConfig {
  isDemo: boolean
  trialExpiresAt: string | null
  daysRemaining: number
  maxPacientes: number
  maxConsultas: number
  maxMedicamentos: number
  maxFaturas: number
  currentPacientes: number
  currentConsultas: number
  currentMedicamentos: number
  currentFaturas: number
  isExpired: boolean
  usagePercent: (table: string) => number
  canCreate: (table: string) => boolean
  refresh: () => Promise<void>
}

const TRIAL_DAYS = 14
const LIMITS = {
  maxPacientes: 10,
  maxConsultas: 15,
  maxMedicamentos: 8,
  maxFaturas: 5,
}

const PREMIUM_FEATURES = [
  'estoque',
  'veterinarios',
  'financeiro',
  'financeiro_avancado',
  'faturamento',
  'multi_unidade',
  'exportacoes',
  'relatorios',
]

const DemoContext = createContext<DemoConfig>(null!)

export function DemoProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth()
  const [isDemo, setIsDemo] = useState(false)
  const [trialExpiresAt, setTrialExpiresAt] = useState<string | null>(null)
  const [counts, setCounts] = useState({ pacientes: 0, consultas: 0, medicamentos: 0, faturas: 0 })

  const isAdmin = role === "admin"

  const fetchCounts = useCallback(async () => {
    if (!user) return
    const [p, c, m, f] = await Promise.all([
      supabase.from('pacientes').select('id', { count: 'exact', head: true }),
      supabase.from('consultas').select('id', { count: 'exact', head: true }),
      supabase.from('medicamentos').select('id', { count: 'exact', head: true }),
      supabase.from('faturas').select('id', { count: 'exact', head: true }),
    ])
    setCounts({
      pacientes: p.count || 0,
      consultas: c.count || 0,
      medicamentos: m.count || 0,
      faturas: f.count || 0,
    })
  }, [user])

  useEffect(() => {
    if (!user || isAdmin) return

    const demoKey = `vethub_demo_${user.id}`
    const stored = localStorage.getItem(demoKey)

    if (stored) {
      const parsed = JSON.parse(stored)
      setIsDemo(parsed.isDemo)
      setTrialExpiresAt(parsed.expiresAt)
    } else {
      const expires = new Date()
      expires.setDate(expires.getDate() + TRIAL_DAYS)
      const config = { isDemo: true, expiresAt: expires.toISOString() }
      localStorage.setItem(demoKey, JSON.stringify(config))
      setIsDemo(true)
      setTrialExpiresAt(expires.toISOString())
    }

    fetchCounts()
  }, [user, isAdmin, fetchCounts])

  const daysRemaining = trialExpiresAt
    ? Math.max(0, Math.ceil((new Date(trialExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 999

  const isExpired = isDemo && daysRemaining <= 0

  const countMap: Record<string, number> = {
    pacientes: counts.pacientes,
    consultas: counts.consultas,
    medicamentos: counts.medicamentos,
    faturas: counts.faturas,
  }

  const maxMap: Record<string, number> = {
    pacientes: LIMITS.maxPacientes,
    consultas: LIMITS.maxConsultas,
    medicamentos: LIMITS.maxMedicamentos,
    faturas: LIMITS.maxFaturas,
  }

  const usagePercent = (table: string) => {
    const max = maxMap[table] || 1
    const cur = countMap[table] || 0
    return Math.min(100, Math.round((cur / max) * 100))
  }

  const canCreate = (table: string) => {
    if (!isDemo) return true
    if (isExpired) return false
    const max = maxMap[table]
    if (max === undefined) return true
    return (countMap[table] || 0) < max
  }

  return (
    <DemoContext.Provider value={{
      isDemo,
      trialExpiresAt,
      daysRemaining,
      maxPacientes: LIMITS.maxPacientes,
      maxConsultas: LIMITS.maxConsultas,
      maxMedicamentos: LIMITS.maxMedicamentos,
      maxFaturas: LIMITS.maxFaturas,
      currentPacientes: counts.pacientes,
      currentConsultas: counts.consultas,
      currentMedicamentos: counts.medicamentos,
      currentFaturas: counts.faturas,
      isExpired,
      usagePercent,
      canCreate,
      refresh: fetchCounts,
    }}>
      {children}
    </DemoContext.Provider>
  )
}

export const useDemo = () => useContext(DemoContext)
export { PREMIUM_FEATURES }
