import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import UnidadeSelection from './pages/UnidadeSelection'
import Recepcao from './pages/Recepcao'
import Triagem from './pages/Triagem'
import ProntoAtendimento from './pages/ProntoAtendimento'
import PainelCaes from './pages/PainelCaes'
import PainelGatos from './pages/PainelGatos'
import AdminPage from './pages/AdminPage'
import TvSelection from './pages/TvSelection'
import Prontuario from './pages/Prontuario'
import TutorDetail from './pages/TutorDetail'
import PacienteDetail from './pages/PacienteDetail'
import Agendamentos from './pages/Agendamentos'
import Veterinarios from './pages/Veterinarios'
import Estoque from './pages/Estoque'
import AuditLog from './pages/AuditLog'
import Financeiro from './pages/Financeiro'
import Servicos from './pages/Servicos'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import BottomNavbar from './components/BottomNavbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import PaywallCard from './components/PaywallCard'
import UpsellBanner from './components/UpsellBanner'
import TrialExpiredModal from './components/TrialExpiredModal'
import { useQueueStore } from './store/queueStore'
import { useEffect } from 'react'
import { useStorageSync } from './hooks/useStorageSync'
import { useRealtimeQueue } from './hooks/useRealtimeQueue'
import { useAuth } from './context/AuthContext'

export default function App() {
  useStorageSync()
  useRealtimeQueue()
  const { unidade, role } = useAuth()
  const location = useLocation()
  const hideFooter = ["/login", "/triagem", "/painel-caes", "/painel-gatos"].includes(location.pathname)

  useEffect(() => {
    useQueueStore.getState().setUnidade(unidade, role === 'admin' || role === 'coordinator')
  }, [unidade, role])

  useEffect(() => {
    const id = setInterval(() => {
      useQueueStore.getState().refresh()
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <TrialExpiredModal />
      <BottomNavbar />
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/selecionar-unidade" element={<ProtectedRoute><UnidadeSelection /></ProtectedRoute>} />
      <Route path="/recepcao" element={<ProtectedRoute><UpsellBanner /><Recepcao /></ProtectedRoute>} />
      <Route path="/triagem" element={<Triagem />} />
      <Route path="/pronto-atendimento" element={<ProtectedRoute><ProntoAtendimento /></ProtectedRoute>} />
      <Route path="/painel-caes" element={<PainelCaes />} />
      <Route path="/painel-gatos" element={<PainelGatos />} />
      <Route path="/selecionar-tv" element={<ProtectedRoute><TvSelection /></ProtectedRoute>} />
      <Route path="/prontuario" element={<ProtectedRoute><Prontuario /></ProtectedRoute>} />
      <Route path="/prontuario/tutor/:id" element={<ProtectedRoute><TutorDetail /></ProtectedRoute>} />
      <Route path="/prontuario/paciente/:id" element={<ProtectedRoute><PacienteDetail /></ProtectedRoute>} />
      <Route path="/agendamentos" element={<ProtectedRoute><Agendamentos /></ProtectedRoute>} />
      <Route path="/veterinarios" element={<ProtectedRoute><PaywallCard feature="veterinarios"><Veterinarios /></PaywallCard></ProtectedRoute>} />
      <Route path="/estoque" element={<ProtectedRoute><PaywallCard feature="estoque"><Estoque /></PaywallCard></ProtectedRoute>} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/auditoria" element={<ProtectedRoute requireAdmin><AuditLog /></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute><PaywallCard feature="faturamento"><Financeiro /></PaywallCard></ProtectedRoute>} />
      <Route path="/financeiro/servicos" element={<ProtectedRoute><PaywallCard feature="faturamento"><Servicos /></PaywallCard></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      {!hideFooter && <Footer />}
    </>
  )
}
