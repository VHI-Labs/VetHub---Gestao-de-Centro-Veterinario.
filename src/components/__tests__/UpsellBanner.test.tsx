import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import UpsellBanner from '../UpsellBanner'

vi.mock('../../context/DemoContext', () => ({
  useDemo: vi.fn(),
}))

import { useDemo } from '../../context/DemoContext'
const mockUseDemo = useDemo as ReturnType<typeof vi.fn>

function renderUpsell() {
  return render(
    <MemoryRouter>
      <UpsellBanner />
    </MemoryRouter>
  )
}

describe('UpsellBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when not demo mode', () => {
    mockUseDemo.mockReturnValue({ isDemo: false, daysRemaining: 0, isExpired: false })
    const { container } = renderUpsell()
    expect(container.innerHTML).toBe('')
  })

  it('should not render when dismissed', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, daysRemaining: 10, isExpired: false, usagePercent: vi.fn() })
    renderUpsell()
    fireEvent.click(screen.getByText('✕'))
    expect(screen.queryByText(/Modo demonstração/)).not.toBeInTheDocument()
  })

  it('should show days remaining countdown', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, daysRemaining: 10, isExpired: false, usagePercent: vi.fn() })
    renderUpsell()
    expect(screen.getByText(/10 dias/)).toBeInTheDocument()
  })

  it('should show expired message when trial is expired', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, daysRemaining: 0, isExpired: true, usagePercent: vi.fn() })
    renderUpsell()
    expect(screen.getByText(/trial expirou/)).toBeInTheDocument()
  })

  it('should show Contract button when expired', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, daysRemaining: 0, isExpired: true, usagePercent: vi.fn() })
    renderUpsell()
    expect(screen.getByText('Contratar Agora')).toBeInTheDocument()
  })

  it('should show Upgrade button', () => {
    mockUseDemo.mockReturnValue({ isDemo: true, daysRemaining: 10, isExpired: false, usagePercent: vi.fn(() => 50) })
    renderUpsell()
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
  })

  it('should show warning when near limit', () => {
    mockUseDemo.mockReturnValue({
      isDemo: true, daysRemaining: 10, isExpired: false,
      usagePercent: vi.fn(() => 90),
    })
    renderUpsell()
    expect(screen.getByText('Limite próximo')).toBeInTheDocument()
  })
})
