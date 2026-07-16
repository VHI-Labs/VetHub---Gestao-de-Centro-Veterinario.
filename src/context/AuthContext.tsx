import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { supabase } from "../lib/supabase"
import type { User, AuthError } from "@supabase/supabase-js"
import { clearSavedUnidade } from "../pages/UnidadeSelection"

interface AuthContextType {
  user: User | null
  role: string
  unidade: string
  funcoes: string[]
  companyId: string
  unitId: string
  forcePasswordChange: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  refreshProfile: () => Promise<void>
  clearForcePasswordChange: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null!)

async function ensureProfile(user: User) {
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!existing) {
    const { data: anyProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1)

    const isFirstUser = !anyProfile || anyProfile.length === 0

    await supabase.from("user_profiles").insert({
      id: user.id,
      email: user.email || "",
      unidade: "",
      funcoes: [],
      role: isFirstUser ? "admin" : "user",
      atualizado_em: new Date().toISOString()
    })
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>("")
  const [unidade, setUnidade] = useState<string>("")
  const [funcoes, setFuncoes] = useState<string[]>([])
  const [companyId, setCompanyId] = useState<string>("")
  const [unitId, setUnitId] = useState<string>("")
  const [forcePasswordChange, setForcePasswordChange] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("user_profiles")
      .select("role, unidade, funcoes, company_id, unit_id, force_password_change")
      .eq("id", uid)
      .single()
    if (data) {
      setRole((data.role as string) || "user")
      setUnidade((data.unidade as string) || "")
      setFuncoes((data.funcoes as string[]) || [])
      setCompanyId((data.company_id as string) || "")
      setUnitId((data.unit_id as string) || "")
      setForcePasswordChange((data.force_password_change as boolean) || false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        ensureProfile(u).then(() => fetchProfile(u.id)).catch(console.warn).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        ensureProfile(u).then(() => fetchProfile(u.id)).catch(console.warn)
      } else {
        setRole("")
        setUnidade("")
        setFuncoes([])
        setCompanyId("")
        setUnitId("")
        setForcePasswordChange(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole("")
    setUnidade("")
    setFuncoes([])
    setCompanyId("")
    setUnitId("")
    setForcePasswordChange(false)
    clearSavedUnidade()
  }

  const clearForcePasswordChange = async () => {
    if (!user) return
    await supabase.from("user_profiles").update({ force_password_change: false }).eq("id", user.id)
    setForcePasswordChange(false)
  }

  return (
    <AuthContext.Provider value={{ user, role, unidade, funcoes, companyId, unitId, forcePasswordChange, loading, signIn, signUp, signOut, resetPassword, refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(), clearForcePasswordChange }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
