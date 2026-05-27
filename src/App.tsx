import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import CampusSelection from './pages/CampusSelection'
import Recepcao from './pages/Recepcao'
import Triagem from './pages/Triagem'
import ProntoAtendimento from './pages/ProntoAtendimento'
import PainelCaes from './pages/PainelCaes'
import PainelGatos from './pages/PainelGatos'
import AdminPage from './pages/AdminPage'
import TvSelection from './pages/TvSelection'
import AdminNavbar from './components/AdminNavbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { useQueueStore } from './store/queueStore'
import { useEffect } from 'react'
import { useStorageSync } from './hooks/useStorageSync'
import { useAuth } from './context/AuthContext'

export default function App() {
  useStorageSync()
  const { unidade, role } = useAuth()
  const location = useLocation()
  const hideFooter = ["/", "/login", "/triagem", "/painel-caes", "/painel-gatos"].includes(location.pathname)

  useEffect(() => {
    useQueueStore.getState().setCampus(unidade, role === 'admin' || role === 'coordinator')
  }, [unidade, role])

  useEffect(() => {
    const id = setInterval(() => {
      useQueueStore.getState().refresh()
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <AdminNavbar />
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/selecionar-campus" element={<ProtectedRoute><CampusSelection /></ProtectedRoute>} />
      <Route path="/recepcao" element={<ProtectedRoute><Recepcao /></ProtectedRoute>} />
      <Route path="/triagem" element={<Triagem />} />
      <Route path="/pronto-atendimento" element={<ProtectedRoute><ProntoAtendimento /></ProtectedRoute>} />
      <Route path="/painel-caes" element={<PainelCaes />} />
      <Route path="/painel-gatos" element={<PainelGatos />} />
      <Route path="/selecionar-tv" element={<ProtectedRoute><TvSelection /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      {!hideFooter && <Footer />}
    </>
  )
}
