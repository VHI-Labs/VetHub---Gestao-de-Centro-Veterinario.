import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Topbar from '../Topbar'

// Mock dependencies
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../hooks/useClock', () => ({
  useClock: vi.fn(),
}))

import { useAuth } from '../../context/AuthContext'
import { useClock } from '../../hooks/useClock'

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>
const mockUseClock = useClock as ReturnType<typeof vi.fn>

function renderTopbar(props: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter initialEntries={['/recepcao']}>
      <Topbar
        tabs={[
          { label: 'Fila Cães', onClick: () => {}, active: true },
          { label: 'Fila Gatos', onClick: () => {}, active: false },
        ]}
        {...props}
      />
    </MemoryRouter>
  )
}

describe('Topbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseClock.mockReturnValue('25/06/2026 12:00:00')
  })

  it('should render the clock', () => {
    mockUseAuth.mockReturnValue({ role: null, unidade: 'HOVET Central' })
    renderTopbar()
    expect(screen.getByText('25/06/2026 12:00:00')).toBeInTheDocument()
  })

  it('should render the campus/unidade name', () => {
    mockUseAuth.mockReturnValue({ role: 'user', unidade: 'HOVET Central' })
    renderTopbar()
    expect(screen.getByText('HOVET Central')).toBeInTheDocument()
  })

  it('should render navigation tabs', () => {
    mockUseAuth.mockReturnValue({ role: 'user', unidade: 'HOVET' })
    renderTopbar()
    expect(screen.getByText('Fila Cães')).toBeInTheDocument()
    expect(screen.getByText('Fila Gatos')).toBeInTheDocument()
  })

  it('should show admin badge for admin users', () => {
    mockUseAuth.mockReturnValue({ role: 'admin', unidade: 'HOVET' })
    renderTopbar()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should show user badge for regular users', () => {
    mockUseAuth.mockReturnValue({ role: 'user', unidade: 'HOVET' })
    renderTopbar()
    expect(screen.getByText('Usuário')).toBeInTheDocument()
  })

  it('should render navigation links (Recepção, Pronto Atendimento, etc)', () => {
    mockUseAuth.mockReturnValue({ role: 'user', unidade: 'HOVET' })
    renderTopbar()
    expect(screen.getByText('Recepção')).toBeInTheDocument()
    expect(screen.getByText('Pronto Atendimento')).toBeInTheDocument()
    expect(screen.getByText('Agendamentos')).toBeInTheDocument()
  })
})
