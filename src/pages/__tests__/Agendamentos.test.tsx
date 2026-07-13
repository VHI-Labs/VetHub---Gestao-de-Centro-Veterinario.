import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Agendamentos from '../Agendamentos'
import { MOCK_AGENDAMENTOS, MOCK_PATIENT_MAP } from '../../test/mockFactories'
import { renderPage } from '../../test/pageTestSetup'

// Mock AuthContext, Topbar, and EHR via __mocks__ directories
vi.mock('../../context/AuthContext')
vi.mock('../../components/Topbar')
vi.mock('../../core/ehr')

import { useAuth } from '../../context/AuthContext'
import { getAgendamentos, updateAgendamentoStatus, getPatient } from '../../core/ehr'
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>
const mockGetAgendamentos = getAgendamentos as ReturnType<typeof vi.fn>
const mockUpdateStatus = updateAgendamentoStatus as ReturnType<typeof vi.fn>
const mockGetPatient = getPatient as ReturnType<typeof vi.fn>

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span>←</span>,
  Calendar: () => <span>📅</span>,
  ChevronLeft: () => <span>◀</span>,
  ChevronRight: () => <span>▶</span>,
  Check: () => <span>✓</span>,
  X: () => <span>✗</span>,
  Clock: () => <span>🕐</span>,
}))

const renderAgendamentos = () => renderPage(<Agendamentos />)

describe('Agendamentos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ unidade: 'VetHub Central' })
    mockGetAgendamentos.mockResolvedValue(MOCK_AGENDAMENTOS)
    mockGetPatient.mockImplementation(async (id: string) => MOCK_PATIENT_MAP[id] || null)
    mockUpdateStatus.mockResolvedValue(undefined)
  })

  it('should show loading state initially', () => {
    mockGetAgendamentos.mockImplementation(() => new Promise(() => {}))
    renderAgendamentos()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should render Topbar', async () => {
    renderAgendamentos()
    await waitFor(() => {
      expect(screen.getByTestId('topbar')).toHaveTextContent('Agendamentos')
    })
  })

  it('should show empty state when no agendamentos', async () => {
    mockGetAgendamentos.mockResolvedValue([])
    renderAgendamentos()
    await waitFor(() => {
      expect(screen.getByText('Nenhum agendamento encontrado.')).toBeInTheDocument()
    })
  })

  it('should render agendamentos list', async () => {
    renderAgendamentos()
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument()
      expect(screen.getByText('Mimi')).toBeInTheDocument()
    })
  })

  it('should show month and year in header', async () => {
    renderAgendamentos()
    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' })
    await waitFor(() => {
      // Month names in Portuguese - June is Junho
      expect(screen.getByText(/Junho|Julho/)).toBeInTheDocument()
    })
  })

  it('should show status filter buttons', async () => {
    renderAgendamentos()
    await waitFor(() => {
      expect(screen.getByText('Todos')).toBeInTheDocument()
      expect(screen.getByText('Pendente')).toBeInTheDocument()
      expect(screen.getByText('Confirmado')).toBeInTheDocument()
      expect(screen.getByText('Cancelado')).toBeInTheDocument()
      expect(screen.getByText('Concluído')).toBeInTheDocument()
    })
  })

  it('should filter by Pendente status', async () => {
    renderAgendamentos()
    await waitFor(() => { expect(screen.getByText('Rex')).toBeInTheDocument() })

    const filterButtons = screen.getAllByRole('button').filter(b => b.textContent === 'Pendente')
    fireEvent.click(filterButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument()
    })
    expect(screen.queryByText('Mimi')).not.toBeInTheDocument()
  })

  it('should filter by Confirmado status', async () => {
    renderAgendamentos()
    await waitFor(() => { expect(screen.getByText('Rex')).toBeInTheDocument() })

    const filterButtons = screen.getAllByRole('button').filter(b => b.textContent === 'Confirmado')
    fireEvent.click(filterButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Mimi')).toBeInTheDocument()
    })
    expect(screen.queryByText('Rex')).not.toBeInTheDocument()
  })

  it('should show Confirmar button for pending agendamentos', async () => {
    renderAgendamentos()
    await waitFor(() => {
      const confirmBtns = screen.getAllByText('Confirmar')
      expect(confirmBtns.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should update status when Confirmar is clicked', async () => {
    renderAgendamentos()
    await waitFor(() => { expect(screen.getByText('Rex')).toBeInTheDocument() })

    fireEvent.click(screen.getByText('Confirmar'))

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith('age-1', 'Confirmado')
    })
  })

  it('should show Concluir button for confirmed agendamentos', async () => {
    renderAgendamentos()
    await waitFor(() => {
      expect(screen.getByText('Concluir')).toBeInTheDocument()
    })
  })

  it('should navigate to previous/next month', async () => {
    renderAgendamentos()
    await waitFor(() => { expect(screen.getByText('Rex')).toBeInTheDocument() })

    const chevrons = screen.getAllByText('▶')
    fireEvent.click(chevrons[0])

    await waitFor(() => {
      expect(mockGetAgendamentos).toHaveBeenCalledTimes(2)
    })
  })

  it('should render back to prontuario button', async () => {
    renderAgendamentos()
    await waitFor(() => {
      expect(screen.getByText('Voltar ao Prontuário')).toBeInTheDocument()
    })
  })
})
