import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PetListRow from '../PetListRow'

vi.mock('../../hooks/useWaitTimer', () => ({
  useWaitTimer: () => 'Aguardando há 0h 05m 00s',
}))

vi.mock('../../store/queueStore', () => ({
  useQueueStore: Object.assign(
    (selector?: (s: Record<string, unknown>) => unknown) => selector ? selector({ refresh: vi.fn() }) : { refresh: vi.fn() },
    { getState: () => ({ refresh: vi.fn() }) }
  ),
}))

vi.mock('../../core/engine', () => ({
  updatePetStatus: vi.fn(),
  reCallPet: vi.fn(),
}))

vi.mock('react-fluentui-emoji/lib/modern/icons/IconMMegaphone', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="megaphone" style={{ fontSize: size }}>📢</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMRoundPushpin', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="pushpin" style={{ fontSize: size }}>📌</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMDogFace', () => ({
  default: ({ size }: { size?: number }) => <span style={{ fontSize: size }}>🐕</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMCatFace', () => ({
  default: ({ size }: { size?: number }) => <span style={{ fontSize: size }}>🐈</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMBird', () => ({
  default: ({ size }: { size?: number }) => <span style={{ fontSize: size }}>🦜</span>,
}))

import { updatePetStatus } from '../../core/engine'
const mockUpdateStatus = updatePetStatus as ReturnType<typeof vi.fn>

const mockDog = {
  id: 'dog-1', senha: 'N001', especie: 'Cão' as const,
  tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde' as const,
  status: 'Aguardando direcionamento', localDirecionado: '',
  dataHora: '2026-06-25T10:00:00Z',
}

const mockCat = {
  id: 'cat-1', senha: 'N002', especie: 'Gato' as const,
  tipoAtendimento: 'Consulta Marcada', prioridade: 'Amarelo' as const,
  status: 'Aguardando direcionamento', localDirecionado: '',
  dataHora: '2026-06-25T11:00:00Z',
}

function renderPetRow(props: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter>
      <PetListRow pet={mockDog} {...props} />
    </MemoryRouter>
  )
}

describe('PetListRow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateStatus.mockResolvedValue(undefined)
  })

  it('should render pet senha', () => {
    renderPetRow()
    expect(screen.getByText('N001')).toBeInTheDocument()
  })

  it('should render wait timer', () => {
    renderPetRow()
    expect(screen.getByText(/Aguardando há/)).toBeInTheDocument()
  })

  it('should render especie badge for dogs', () => {
    renderPetRow()
    expect(screen.getByText('Cão')).toBeInTheDocument()
  })

  it('should render especie badge for cats', () => {
    render(
      <MemoryRouter>
        <PetListRow pet={mockCat} />
      </MemoryRouter>
    )
    expect(screen.getByText('Gato')).toBeInTheDocument()
  })

  it('should show Call button by default', () => {
    renderPetRow()
    expect(screen.getByText('Chamar')).toBeInTheDocument()
  })

  it('should call updatePetStatus when Call is clicked', async () => {
    renderPetRow()
    fireEvent.click(screen.getByText('Chamar'))
    
    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalled()
    }, { timeout: 5000 })
  })

  it('should show Finish button by default', () => {
    renderPetRow()
    expect(screen.getByText('Concluir')).toBeInTheDocument()
  })

  it('should hide Call button when showCall is false', () => {
    renderPetRow({ showCall: false })
    expect(screen.queryByText('Chamar')).not.toBeInTheDocument()
  })

  it('should hide Finish button when showFinish is false', () => {
    renderPetRow({ showFinish: false })
    expect(screen.queryByText('Concluir')).not.toBeInTheDocument()
  })

  it('should show custom call label', () => {
    renderPetRow({ callLabel: 'PRONTO ATENDIMENTO' })
    expect(screen.getByText('PRONTO ATENDIMENTO')).toBeInTheDocument()
  })

  it('should hide Direction button by default', () => {
    renderPetRow()
    expect(screen.queryByText('Direcionar')).not.toBeInTheDocument()
  })

  it('should show Direction button when showDirection is true', () => {
    renderPetRow({ showDirection: true })
    expect(screen.getByText('Direcionar')).toBeInTheDocument()
  })
})
