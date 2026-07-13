import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useQueueStore } from '../../store/queueStore'
import CalledQueueSidebar from '../CalledQueueSidebar'

// Mock the hooks used by CalledPetItem
vi.mock('../../hooks/useWaitTimer', () => ({
  useWaitTimer: () => 'Aguardando há 0h 05m 00s',
}))

// Mock the store
vi.mock('../../store/queueStore', () => ({
  useQueueStore: vi.fn(),
}))

// Mock react-fluentui-emoji icons
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMMegaphone', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="megaphone" style={{ fontSize: size }}>📢</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMTelephoneReceiver', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="phone" style={{ fontSize: size }}>📞</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMDogFace', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="dog" style={{ fontSize: size }}>🐕</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMCatFace', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="cat" style={{ fontSize: size }}>🐈</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMBird', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="bird" style={{ fontSize: size }}>🦜</span>,
}))

const mockUseQueueStore = useQueueStore as unknown as ReturnType<typeof vi.fn>

function renderSidebar(props: { senhaPrefix?: string } = {}) {
  return render(
    <MemoryRouter>
      <CalledQueueSidebar {...props} />
    </MemoryRouter>
  )
}

describe('CalledQueueSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render header with Chamados text', () => {
    mockUseQueueStore.mockImplementation((selector?: Function) => {
      const state = { dogs: [], cats: [], wild: [] }
      return selector ? selector(state) : state
    })
    renderSidebar()
    expect(screen.getByText('Chamados')).toBeInTheDocument()
  })

  it('should show empty state when no called pets', () => {
    mockUseQueueStore.mockImplementation((selector?: Function) => {
      const state = { dogs: [], cats: [], wild: [] }
      return selector ? selector(state) : state
    })
    renderSidebar()
    expect(screen.getByText('Nenhum paciente chamado')).toBeInTheDocument()
  })

  it('should show called pets count', () => {
    mockUseQueueStore.mockImplementation((selector?: Function) => {
      const state = {
        dogs: [{
          id: 'd1', senha: 'N001', especie: 'Cão', status: 'Chamado',
          localDirecionado: 'Triagem', dataHora: '2026-06-25T10:00:00Z', tipoAtendimento: 'Pronto Atendimento',
          calledAt: '2026-06-25T10:05:00Z',
        }],
        cats: [],
        wild: [],
      }
      return selector ? selector(state) : state
    })
    renderSidebar()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('N001')).toBeInTheDocument()
  })

  it('should show called pets from all species', () => {
    mockUseQueueStore.mockImplementation((selector?: Function) => {
      const state = {
        dogs: [{
          id: 'd1', senha: 'N001', especie: 'Cão', status: 'Chamado',
          localDirecionado: 'Triagem', dataHora: '2026-06-25T10:00:00Z', tipoAtendimento: 'Pronto Atendimento',
          calledAt: '2026-06-25T10:05:00Z',
        }],
        cats: [{
          id: 'c1', senha: 'N002', especie: 'Gato', status: 'Direcionado',
          localDirecionado: 'Consulta', dataHora: '2026-06-25T11:00:00Z', tipoAtendimento: 'Consulta Marcada',
          calledAt: '2026-06-25T11:05:00Z',
        }],
        wild: [],
      }
      return selector ? selector(state) : state
    })
    renderSidebar()
    expect(screen.getByText('N001')).toBeInTheDocument()
    expect(screen.getByText('N002')).toBeInTheDocument()
  })

  it('should filter by senhaPrefix', () => {
    mockUseQueueStore.mockImplementation((selector?: Function) => {
      const state = {
        dogs: [{
          id: 'd1', senha: 'N001', especie: 'Cão', status: 'Chamado',
          localDirecionado: 'Triagem', dataHora: '2026-06-25T10:00:00Z', tipoAtendimento: 'Pronto Atendimento',
          calledAt: '2026-06-25T10:05:00Z',
        }],
        cats: [{
          id: 'c1', senha: 'A001', especie: 'Gato', status: 'Chamado',
          localDirecionado: 'Consulta', dataHora: '2026-06-25T11:00:00Z', tipoAtendimento: 'Consulta Marcada',
          calledAt: '2026-06-25T11:05:00Z',
        }],
        wild: [],
      }
      return selector ? selector(state) : state
    })
    // Filter only N-prefix (Pronto Atendimento)
    const { container } = render(
      <MemoryRouter>
        <CalledQueueSidebar senhaPrefix="N" />
      </MemoryRouter>
    )
    expect(container.textContent).toContain('N001')
    expect(container.textContent).not.toContain('A001')
  })
})
