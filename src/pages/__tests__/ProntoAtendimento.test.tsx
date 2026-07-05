import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import ProntoAtendimento from '../ProntoAtendimento'
import { INITIAL_QUEUE_STATE } from '../../test/mockFactories'
import { renderPage } from '../../test/pageTestSetup'

// Hoist mock variables for queueStore state (mutable, shared between test & mock)
const { mockRefresh, mockQueueStoreState } = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
  mockQueueStoreState: {
    dogs: [] as any[],
    cats: [] as any[],
    wild: [] as any[],
    history: [] as any[],
    loading: false,
  },
}))

// Mock via __mocks__ directories
vi.mock('../../context/AuthContext')
vi.mock('../../components/Topbar')
vi.mock('../../core/engine')
vi.mock('../../core/ehr')

import { useAuth } from '../../context/AuthContext'
import { getNextWaitingPet, updatePetStatus } from '../../core/engine'
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>
const mockGetNextWaiting = getNextWaitingPet as ReturnType<typeof vi.fn>
const mockUpdatePetStatus = updatePetStatus as ReturnType<typeof vi.fn>

// Mock components without __mocks__ (only used in ProntoAtendimento)
vi.mock('../../components/VideoManager', () => ({
  default: () => <div data-testid="video-manager">VideoManager</div>,
}))

vi.mock('../../components/PetListRow', () => ({
  default: ({ pet, showCall, callLabel }: { pet: { senha: string; especie: string }; showCall: boolean; callLabel?: string }) => (
    <div data-testid="pet-list-row">
      <span>{pet.senha}</span>
      <span>{pet.especie}</span>
      {showCall && <span>{callLabel}</span>}
    </div>
  ),
}))

vi.mock('../../components/CalledQueueSidebar', () => ({
  default: ({ senhaPrefix }: { senhaPrefix: string }) => (
    <div data-testid="called-queue-sidebar">Sidebar {senhaPrefix}</div>
  ),
}))

vi.mock('../../components/MonthlyReport', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="monthly-report">
      <button onClick={onClose}>Fechar</button>
    </div>
  ),
}))

vi.mock('../../store/queueStore', () => ({
  useQueueStore: Object.assign(
    (selector?: (s: Record<string, unknown>) => unknown) => {
      const state = {
        ...mockQueueStoreState,
        refresh: mockRefresh,
      }
      return selector ? selector(state as any) : state
    },
    { getState: () => ({ refresh: mockRefresh }) }
  ),
}))

const mockPets = [
  {
    id: '1', senha: 'N001', especie: 'Cão' as const,
    tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde' as const,
    status: 'Aguardando direcionamento', localDirecionado: '',
    dataHora: '2026-06-25T10:00:00Z',
  },
  {
    id: '2', senha: 'N002', especie: 'Gato' as const,
    tipoAtendimento: 'Pronto Atendimento', prioridade: 'Amarelo' as const,
    status: 'Aguardando direcionamento', localDirecionado: '',
    dataHora: '2026-06-25T11:00:00Z',
  },
]

const renderPA = () => renderPage(<ProntoAtendimento />)

describe('ProntoAtendimento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ unidade: 'HOVET Central', role: 'user' })
    Object.assign(mockQueueStoreState, INITIAL_QUEUE_STATE)
  })

  it('should render Topbar with correct title', () => {
    renderPA()
    expect(screen.getByTestId('topbar')).toHaveTextContent('Pronto Atendimento')
  })

  it('should render CalledQueueSidebar', () => {
    renderPA()
    expect(screen.getByTestId('called-queue-sidebar')).toHaveTextContent('Sidebar N')
  })

  it('should show loading state', () => {
    mockQueueStoreState.loading = true
    renderPA()
    expect(screen.getByText('Carregando fila de pacientes...')).toBeInTheDocument()
  })

  it('should show empty state when no pets', () => {
    renderPA()
    expect(screen.getByText(/Não há pacientes de Pronto Atendimento/)).toBeInTheDocument()
  })

  it('should render pet list when dogs are available', () => {
    mockQueueStoreState.dogs = [mockPets[0]]
    renderPA()
    expect(screen.getByText('N001')).toBeInTheDocument()
  })

  it('should render pets from all species', () => {
    mockQueueStoreState.dogs = [mockPets[0]]
    mockQueueStoreState.cats = [mockPets[1]]
    renderPA()
    expect(screen.getByText('N001')).toBeInTheDocument()
    expect(screen.getByText('N002')).toBeInTheDocument()
  })

  it('should have chamar proximo button', () => {
    mockQueueStoreState.dogs = [mockPets[0]]
    renderPA()
    expect(screen.getByText('Chamar Próximo')).toBeInTheDocument()
  })

  it('should call next pet when button clicked', async () => {
    mockQueueStoreState.dogs = [mockPets[0]]
    mockGetNextWaiting.mockReturnValue(mockPets[0])
    mockUpdatePetStatus.mockResolvedValue(undefined)
    mockRefresh.mockResolvedValue(undefined)

    renderPA()
    fireEvent.click(screen.getByText('Chamar Próximo'))

    await waitFor(() => {
      expect(mockGetNextWaiting).toHaveBeenCalled()
    })
  })

  it('should show dashboard tab with metrics', () => {
    mockQueueStoreState.dogs = [mockPets[0]]
    mockQueueStoreState.cats = [mockPets[1]]
    renderPA()

    fireEvent.click(screen.getByText('Visão Geral (Dashboard)'))

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Cães')).toBeInTheDocument()
    expect(screen.getByText('Gatos')).toBeInTheDocument()
    expect(screen.getByText('Silvestres')).toBeInTheDocument()
  })

  it('should show videos tab', () => {
    renderPA()
    fireEvent.click(screen.getByText('Vídeos'))
    expect(screen.getByTestId('video-manager')).toBeInTheDocument()
  })

  it('should show vinculado badge for linked pets', () => {
    const linkedPet = { ...mockPets[0], patientId: 'pat-1' }
    mockQueueStoreState.dogs = [linkedPet]
    renderPA()

    expect(screen.getByText('✓ Vinculado')).toBeInTheDocument()
  })

  it('should show vincular button for unlinked pets', () => {
    mockQueueStoreState.dogs = [mockPets[0]]
    renderPA()

    expect(screen.getByText('Vincular')).toBeInTheDocument()
  })
})
