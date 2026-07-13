import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChangeUnidadeModal from '../ChangeUnidadeModal'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}))

import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderModal() {
  const onClose = vi.fn()
  const result = render(
    <MemoryRouter>
      <ChangeUnidadeModal onClose={onClose} />
    </MemoryRouter>
  )
  return { ...result, onClose }
}

describe('ChangeUnidadeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with title Mudar Unidade', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'admin@test.com' },
      role: 'admin',
      unidade: 'Unidade Central',
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    })
    renderModal()
    expect(screen.getByText('Mudar Unidade')).toBeInTheDocument()
  })

  it('should show current unidade', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' },
      role: 'admin',
      unidade: 'Unidade Central',
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    })
    renderModal()
    expect(screen.getByText(/Unidade atual/)).toBeInTheDocument()
  })

  it('should show all unidades for admin', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' },
      role: 'admin',
      unidade: 'Unidade Central',
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    })
    renderModal()
    // Check that all three buttons exist (exclude the "Unidade atual" text)
    expect(screen.getByRole('button', { name: /Unidade Central/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unidade Norte/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unidade Sul/ })).toBeInTheDocument()
  })

  it('should show only current unidade for regular user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' },
      role: 'user',
      unidade: 'Unidade Central',
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    })
    renderModal()
    // Check that the current unidade is displayed (via "Unidade atual" text or the card)
    const unidadeElements = screen.getAllByText((_content, element) => {
      return element?.textContent === 'Unidade Central'
    })
    expect(unidadeElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('Unidade Norte')).not.toBeInTheDocument()
    expect(screen.queryByText('Unidade Sul')).not.toBeInTheDocument()
  })

  it('should show confirm screen after selecting unidade', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'admin@test.com' },
      role: 'admin',
      unidade: 'Unidade Central',
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    })
    renderModal()

    // Click on Unidade Norte to change to it
    const buttons = screen.getAllByRole('button')
    const unidadeNorteBtn = buttons.find(b => b.textContent?.includes('Unidade Norte'))
    expect(unidadeNorteBtn).toBeDefined()
    fireEvent.click(unidadeNorteBtn!)

    await waitFor(() => {
      expect(screen.getByText('Confirmar Mudança')).toBeInTheDocument()
    })
  })

  it('should call onClose when cancelar is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' },
      role: 'admin',
      unidade: 'Unidade Central',
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    })
    const { onClose } = renderModal()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })
})
