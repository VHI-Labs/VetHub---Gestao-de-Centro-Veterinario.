import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Prontuario from '../Prontuario'
import { MOCK_OWNERS, MOCK_PATIENTS, MOCK_DASHBOARD_METRICS } from '../../test/mockFactories'
import { renderPage } from '../../test/pageTestSetup'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock via __mocks__ directories
vi.mock('../../context/AuthContext')
vi.mock('../../components/Topbar')
vi.mock('../../core/ehr')

import { useAuth } from '../../context/AuthContext'
import { searchOwners, searchPatients, getEhrDashboardMetrics } from '../../core/ehr'
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>
const mockSearchOwners = searchOwners as ReturnType<typeof vi.fn>
const mockSearchPatients = searchPatients as ReturnType<typeof vi.fn>
const mockGetDashboard = getEhrDashboardMetrics as ReturnType<typeof vi.fn>

// Mock TutorForm
vi.mock('../../components/TutorForm', () => ({
  default: ({ onSave, onClose }: { onSave: (owner: { id: string }) => void; onClose: () => void }) => (
    <div data-testid="tutor-form">
      <button onClick={() => onSave({ id: 'new-tutor' })}>Salvar Tutor</button>
      <button onClick={onClose}>Fechar Tutor</button>
    </div>
  ),
}))

// Mock PacienteForm
vi.mock('../../components/PacienteForm', () => ({
  default: ({ onSave, onClose }: { onSave: (patient: { id: string }) => void; onClose: () => void }) => (
    <div data-testid="paciente-form">
      <button onClick={() => onSave({ id: 'new-patient' })}>Salvar Paciente</button>
      <button onClick={onClose}>Fechar Paciente</button>
    </div>
  ),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Search: () => <span>🔍</span>,
  UserPlus: () => <span>👤</span>,
  PawPrint: () => <span>🐾</span>,
  Users: () => <span>👥</span>,
  Calendar: () => <span>📅</span>,
  ChevronRight: () => <span>▶</span>,
  BarChart3: () => <span>📊</span>,
  Activity: () => <span>📈</span>,
  Syringe: () => <span>💉</span>,
  Stethoscope: () => <span>🩺</span>,
}))

const renderProntuario = () => renderPage(<Prontuario />, ['/prontuario'])

describe('Prontuario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ unidade: 'VetHub Central' })
    mockSearchPatients.mockResolvedValue(MOCK_PATIENTS)
    mockSearchOwners.mockResolvedValue(MOCK_OWNERS)
    mockGetDashboard.mockResolvedValue(MOCK_DASHBOARD_METRICS)
  })

  it('should render Topbar with Prontuário title', async () => {
    renderProntuario()
    await waitFor(() => {
      expect(screen.getByTestId('topbar')).toHaveTextContent('Prontuário Eletrônico')
    })
  })

  it('should show patient tab by default', async () => {
    renderProntuario()
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument()
      expect(screen.getByText('Mimi')).toBeInTheDocument()
    })
  })

  it('should show search input', async () => {
    renderProntuario()
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar por nome/)).toBeInTheDocument()
    })
  })

  it('should show Novo Paciente button', async () => {
    renderProntuario()
    await waitFor(() => {
      expect(screen.getByText('Novo Paciente')).toBeInTheDocument()
    })
  })

  it('should show patient species badges', async () => {
    renderProntuario()
    await waitFor(() => {
      const badges = screen.getAllByText('Cão')
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should show dashboard tab with metrics', async () => {
    renderProntuario()
    fireEvent.click(screen.getByText('Dashboard'))

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('320')).toBeInTheDocument()
      expect(screen.getByText('80')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })
  })

  it('should show sexo distribution on dashboard', async () => {
    renderProntuario()
    fireEvent.click(screen.getByText('Dashboard'))

    await waitFor(() => {
      expect(screen.getByText('Macho')).toBeInTheDocument()
      expect(screen.getByText('Fêmea')).toBeInTheDocument()
    })
  })

  it('should show especie-sexo breakdown on dashboard', async () => {
    renderProntuario()
    fireEvent.click(screen.getByText('Dashboard'))

    await waitFor(() => {
      expect(screen.getByText('Distribuição por Sexo')).toBeInTheDocument()
      expect(screen.getByText('Sexo por Espécie')).toBeInTheDocument()
    })
  })

  it('should switch to tutores tab', async () => {
    renderProntuario()
    fireEvent.click(screen.getByText('Tutores'))

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Souza')).toBeInTheDocument()
    })
  })

  it('should show Novo Tutor button in tutores tab', async () => {
    renderProntuario()
    fireEvent.click(screen.getByText('Tutores'))

    await waitFor(() => {
      expect(screen.getByText('Novo Tutor')).toBeInTheDocument()
    })
  })

  it('should show agendamentos tab link', async () => {
    renderProntuario()
    await waitFor(() => {
      expect(screen.getByText('Agendamentos')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Agendamentos'))
    expect(mockNavigate).toHaveBeenCalledWith('/agendamentos')
  })

  it('should show empty state when no patients found', async () => {
    mockSearchPatients.mockResolvedValue([])
    renderProntuario()
    await waitFor(() => {
      expect(screen.getByText('Nenhum paciente encontrado.')).toBeInTheDocument()
    })
  })

  it('should show empty state when no owners found', async () => {
    mockSearchOwners.mockResolvedValue([])
    renderProntuario()
    fireEvent.click(screen.getByText('Tutores'))
    await waitFor(() => {
      expect(screen.getByText('Nenhum tutor encontrado.')).toBeInTheDocument()
    })
  })

  it('should navigate to tutor detail on click', async () => {
    renderProntuario()
    fireEvent.click(screen.getByText('Tutores'))

    await waitFor(() => { expect(screen.getByText('João Silva')).toBeInTheDocument() })
    fireEvent.click(screen.getByText('João Silva'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/prontuario/tutor/own-1')
    })
  })

  it('should navigate to patient detail on click', async () => {
    renderProntuario()
    await waitFor(() => { expect(screen.getByText('Rex')).toBeInTheDocument() })
    fireEvent.click(screen.getByText('Rex'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/prontuario/paciente/pat-1')
    })
  })
})
