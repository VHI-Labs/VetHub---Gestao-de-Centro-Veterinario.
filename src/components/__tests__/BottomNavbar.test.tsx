import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BottomNavbar from '../BottomNavbar'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../context/AuthContext'
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderBottomNavbar() {
  return render(
    <MemoryRouter initialEntries={['/recepcao']}>
      <BottomNavbar />
    </MemoryRouter>
  )
}

describe('BottomNavbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render for regular users', () => {
    mockUseAuth.mockReturnValue({ role: 'user' })
    const { container } = renderBottomNavbar()
    expect(container.innerHTML).toBe('')
  })

  it('should render admin links for admin users', () => {
    mockUseAuth.mockReturnValue({ role: 'admin' })
    renderBottomNavbar()
    expect(screen.getByText('Recepção')).toBeInTheDocument()
    expect(screen.getByText('Pronto Atendimento')).toBeInTheDocument()
    expect(screen.getByText('Triagem')).toBeInTheDocument()
    expect(screen.getByText('Prontuário')).toBeInTheDocument()
    expect(screen.getByText('Cães')).toBeInTheDocument()
    expect(screen.getByText('Gatos')).toBeInTheDocument()
    expect(screen.getByText('TV')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should render coordinator links for coordinators', () => {
    mockUseAuth.mockReturnValue({ role: 'coordinator' })
    renderBottomNavbar()
    expect(screen.getByText('Recepção')).toBeInTheDocument()
    expect(screen.getByText('Prontuário')).toBeInTheDocument()
    expect(screen.getByText('TV')).toBeInTheDocument()
    expect(screen.getByText('Cães')).toBeInTheDocument()
    expect(screen.getByText('Gatos')).toBeInTheDocument()
    // Admin should NOT be present for coordinators
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })
})
