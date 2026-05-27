import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#2d3a2d" }}>
        <div className="text-white text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (requireAdmin && role !== "admin") return <Navigate to="/recepcao" replace />

  return <>{children}</>
}
