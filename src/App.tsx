import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing'
import Login from './pages/Login'
import UnidadeSelection from './pages/UnidadeSelection'
import Recepcao from './pages/Recepcao'
import Triagem from './pages/Triagem'
import ProntoAtendimento from './pages/ProntoAtendimento'
import PainelCaes from './pages/PainelCaes'
import PainelGatos from './pages/PainelGatos'
import AdminPage from './pages/AdminPage'
import CompanySelection from './pages/CompanySelection'
import CompanyDashboard from './pages/CompanyDashboard'
import UnitManagement from './pages/UnitManagement'
import CompanyUsers from './pages/CompanyUsers'
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
import ForcePasswordChange from './pages/ForcePasswordChange'
import BottomNavbar from './components/BottomNavbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import PaywallCard from './components/PaywallCard'
import UpsellBanner from './components/UpsellBanner'
import TrialExpiredModal from './components/TrialExpiredModal'
import PageTransition from './components/PageTransition'
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
  const hideFooter = ["/login", "/triagem", "/painel-caes", "/painel-gatos", "/trocar-senha"].includes(location.pathname)

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
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/selecionar-unidade" element={<PageTransition><ProtectedRoute><UnidadeSelection /></ProtectedRoute></PageTransition>} />
          <Route path="/recepcao" element={<PageTransition><ProtectedRoute><UpsellBanner /><Recepcao /></ProtectedRoute></PageTransition>} />
          <Route path="/triagem" element={<PageTransition><Triagem /></PageTransition>} />
          <Route path="/pronto-atendimento" element={<PageTransition><ProtectedRoute><ProntoAtendimento /></ProtectedRoute></PageTransition>} />
          <Route path="/painel-caes" element={<PageTransition><PainelCaes /></PageTransition>} />
          <Route path="/painel-gatos" element={<PageTransition><PainelGatos /></PageTransition>} />
          <Route path="/selecionar-tv" element={<PageTransition><ProtectedRoute><TvSelection /></ProtectedRoute></PageTransition>} />
          <Route path="/prontuario" element={<PageTransition><ProtectedRoute><Prontuario /></ProtectedRoute></PageTransition>} />
          <Route path="/prontuario/tutor/:id" element={<PageTransition><ProtectedRoute><TutorDetail /></ProtectedRoute></PageTransition>} />
          <Route path="/prontuario/paciente/:id" element={<PageTransition><ProtectedRoute><PacienteDetail /></ProtectedRoute></PageTransition>} />
          <Route path="/agendamentos" element={<PageTransition><ProtectedRoute><Agendamentos /></ProtectedRoute></PageTransition>} />
          <Route path="/veterinarios" element={<PageTransition><ProtectedRoute><PaywallCard feature="veterinarios"><Veterinarios /></PaywallCard></ProtectedRoute></PageTransition>} />
          <Route path="/estoque" element={<PageTransition><ProtectedRoute><PaywallCard feature="estoque"><Estoque /></PaywallCard></ProtectedRoute></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/trocar-senha" element={<PageTransition><ProtectedRoute><ForcePasswordChange /></ProtectedRoute></PageTransition>} />
          <Route path="/admin" element={<PageTransition><ProtectedRoute requireAdmin><CompanySelection /></ProtectedRoute></PageTransition>} />
          <Route path="/admin/legacy" element={<PageTransition><ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute></PageTransition>} />
          <Route path="/admin/empresa/:companyId" element={<PageTransition><ProtectedRoute requireAdmin><CompanyDashboard /></ProtectedRoute></PageTransition>} />
          <Route path="/admin/empresa/:companyId/unidades" element={<PageTransition><ProtectedRoute requireAdmin><UnitManagement /></ProtectedRoute></PageTransition>} />
          <Route path="/admin/empresa/:companyId/unidade/:unitId" element={<PageTransition><ProtectedRoute requireAdmin><CompanyUsers /></ProtectedRoute></PageTransition>} />
          <Route path="/admin/empresa/:companyId/usuarios" element={<PageTransition><ProtectedRoute requireAdmin><CompanyUsers /></ProtectedRoute></PageTransition>} />
          <Route path="/admin/empresa/:companyId/auditoria" element={<PageTransition><ProtectedRoute requireAdmin><AuditLog /></ProtectedRoute></PageTransition>} />
          <Route path="/admin/auditoria" element={<PageTransition><ProtectedRoute requireAdmin><AuditLog /></ProtectedRoute></PageTransition>} />
          <Route path="/financeiro" element={<PageTransition><ProtectedRoute><PaywallCard feature="faturamento"><Financeiro /></PaywallCard></ProtectedRoute></PageTransition>} />
          <Route path="/financeiro/servicos" element={<PageTransition><ProtectedRoute><PaywallCard feature="faturamento"><Servicos /></PaywallCard></ProtectedRoute></PageTransition>} />
          <Route path="*" element={<PageTransition><Navigate to="/" replace /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      {!hideFooter && <Footer />}
    </>
  )
}
