import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import UsageLimitsBar from '../UsageLimitsBar'

vi.mock('../../context/DemoContext', () => ({
  useDemo: vi.fn(),
}))

import { useDemo } from '../../context/DemoContext'
const mockUseDemo = useDemo as ReturnType<typeof vi.fn>

function renderBar(table = 'pacientes') {
  return render(
    <MemoryRouter>
      <UsageLimitsBar table={table} label="Pacientes" />
    </MemoryRouter>
  )
}

describe('UsageLimitsBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when not demo mode', () => {
    mockUseDemo.mockReturnValue({
      isDemo: false,
      usagePercent: vi.fn(),
      maxPacientes: 10, maxConsultas: 15, maxMedicamentos: 8, maxFaturas: 5,
      currentPacientes: 0, currentConsultas: 0, currentMedicamentos: 0, currentFaturas: 0,
    })
    const { container } = renderBar()
    expect(container.innerHTML).toBe('')
  })

  it('should render usage info', () => {
    mockUseDemo.mockReturnValue({
      isDemo: true,
      usagePercent: vi.fn(() => 50),
      maxPacientes: 10, maxConsultas: 15, maxMedicamentos: 8, maxFaturas: 5,
      currentPacientes: 5, currentConsultas: 0, currentMedicamentos: 0, currentFaturas: 0,
    })
    renderBar()
    expect(screen.getByText(/5\/10/)).toBeInTheDocument()
  })

  it('should show expand button when full', () => {
    mockUseDemo.mockReturnValue({
      isDemo: true,
      usagePercent: vi.fn(() => 100),
      maxPacientes: 10, maxConsultas: 15, maxMedicamentos: 8, maxFaturas: 5,
      currentPacientes: 10, currentConsultas: 0, currentMedicamentos: 0, currentFaturas: 0,
    })
    renderBar()
    expect(screen.getByText('Expandir')).toBeInTheDocument()
  })
})
