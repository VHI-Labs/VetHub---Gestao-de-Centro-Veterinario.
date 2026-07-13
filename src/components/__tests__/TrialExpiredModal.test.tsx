import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TrialExpiredModal from '../TrialExpiredModal'

vi.mock('../../context/DemoContext', () => ({
  useDemo: vi.fn(),
}))

import { useDemo } from '../../context/DemoContext'
const mockUseDemo = useDemo as ReturnType<typeof vi.fn>

function renderModal() {
  return render(
    <MemoryRouter>
      <TrialExpiredModal />
    </MemoryRouter>
  )
}

describe('TrialExpiredModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when not demo', () => {
    mockUseDemo.mockReturnValue({ isDemo: false, isExpired: false })
    const { container } = renderModal()
    expect(container.innerHTML).toBe('')
  })

  it('should not render when demo but not expired', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, isExpired: false })
    const { container } = renderModal()
    expect(container.innerHTML).toBe('')
  })

  it('should render when demo is expired', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, isExpired: true })
    renderModal()
    expect(screen.getByText('Trial Expirado')).toBeInTheDocument()
  })

  it('should show expired message', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, isExpired: true })
    renderModal()
    expect(screen.getByText(/período de teste de 14 dias expirou/)).toBeInTheDocument()
  })

  it('should show subscribe button', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, isExpired: true })
    renderModal()
    expect(screen.getByText('Assinar Premium')).toBeInTheDocument()
  })

  it('should show continue limited button', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, isExpired: true })
    renderModal()
    expect(screen.getByText('Continuar no modo limitado')).toBeInTheDocument()
  })
})
