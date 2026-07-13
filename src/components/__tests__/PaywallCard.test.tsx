import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PaywallCard from '../PaywallCard'

vi.mock('../../context/DemoContext', () => ({
  useDemo: vi.fn(),
}))

import { useDemo } from '../../context/DemoContext'
const mockUseDemo = useDemo as ReturnType<typeof vi.fn>

function renderPaywall(feature = 'estoque') {
  return render(
    <MemoryRouter>
      <PaywallCard feature={feature}>
        <div data-testid="children">Conteúdo Premium</div>
      </PaywallCard>
    </MemoryRouter>
  )
}

describe('PaywallCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show children when not demo mode', () => {
    mockUseDemo.mockReturnValue({ isDemo: false })
    renderPaywall()
    expect(screen.getByTestId('children')).toBeInTheDocument()
  })

  it('should show paywall when in demo mode', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    renderPaywall()
    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.queryByTestId('children')).not.toBeInTheDocument()
  })

  it('should show feature title for estoque', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    renderPaywall('estoque')
    expect(screen.getByText('Estoque & Farmácia')).toBeInTheDocument()
  })

  it('should show feature title for veterinarios', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    renderPaywall('veterinarios')
    expect(screen.getByText('Gestão de Veterinários')).toBeInTheDocument()
  })

  it('should show feature title for faturamento', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    renderPaywall('faturamento')
    expect(screen.getByText('Faturamento & Cobrança')).toBeInTheDocument()
  })

  it('should show feature title for financeiro', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    renderPaywall('financeiro')
    expect(screen.getByText('Financeiro Completo')).toBeInTheDocument()
  })

  it('should show premium badge', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    renderPaywall()
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('should show subscribe button', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    renderPaywall()
    expect(screen.getByText('Assinar Premium')).toBeInTheDocument()
  })

  it('should show benefits list', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    renderPaywall()
    expect(screen.getByText('O que está incluso:')).toBeInTheDocument()
  })
})
