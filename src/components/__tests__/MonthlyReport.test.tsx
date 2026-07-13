import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MonthlyReport from '../MonthlyReport'

vi.mock('lucide-react', () => ({
  X: () => <span>✕</span>,
  FileText: () => <span>📄</span>,
}))

vi.mock('../../core/engine', () => ({
  getMonthlyReport: vi.fn(),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { getMonthlyReport } from '../../core/engine'
import { useAuth } from '../../context/AuthContext'
const mockGetMonthlyReport = getMonthlyReport as ReturnType<typeof vi.fn>
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderReport() {
  const onClose = vi.fn()
  const result = render(
    <MemoryRouter>
      <MonthlyReport onClose={onClose} />
    </MemoryRouter>
  )
  return { ...result, onClose }
}

describe('MonthlyReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ unidade: 'Unidade Central', role: 'user' })
    mockGetMonthlyReport.mockResolvedValue([
      {
        id: 'pet-1', senha: 'N001', especie: 'Cão',
        tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde',
        status: 'Finalizado', localDirecionado: 'Triagem',
        dataHora: '2026-06-25T10:00:00Z',
        calledAt: '2026-06-25T10:05:00Z',
        finalizedAt: '2026-06-25T10:30:00Z',
      },
    ])
  })

  it('should render title', () => {
    renderReport()
    expect(screen.getByText('Relatório Mensal')).toBeInTheDocument()
  })

  it('should have year select', () => {
    renderReport()
    const yearSelect = screen.getByDisplayValue('2026')
    expect(yearSelect).toBeInTheDocument()
  })

  it('should have month select', () => {
    renderReport()
    expect(screen.getByText('Janeiro')).toBeInTheDocument()
  })

  it('should have Gerar button', () => {
    renderReport()
    expect(screen.getByText('Gerar')).toBeInTheDocument()
  })

  it('should call getMonthlyReport when Gerar is clicked', async () => {
    renderReport()
    fireEvent.click(screen.getByText('Gerar'))

    await waitFor(() => {
      expect(mockGetMonthlyReport).toHaveBeenCalled()
    })
  })

  it('should show table after loading data', async () => {
    renderReport()
    fireEvent.click(screen.getByText('Gerar'))

    await waitFor(() => {
      expect(screen.getByText('Cão')).toBeInTheDocument()
      expect(screen.getByText('5 min')).toBeInTheDocument()
    })
  })

  it('should have export buttons', async () => {
    renderReport()
    fireEvent.click(screen.getByText('Gerar'))

    await waitFor(() => {
      expect(screen.getByText(/CSV/)).toBeInTheDocument()
      expect(screen.getByText(/PDF/)).toBeInTheDocument()
    })
  })

  it('should call onClose when X clicked', () => {
    const { onClose } = renderReport()
    fireEvent.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should show unidade select', () => {
    renderReport()
    expect(screen.getByText('Todas as Unidades')).toBeInTheDocument()
  })
})
