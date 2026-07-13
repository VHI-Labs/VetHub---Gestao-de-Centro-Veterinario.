import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgendamentoForm from '../AgendamentoForm'

vi.mock('../../core/ehr', () => ({
  createAgendamento: vi.fn(),
}))

import { createAgendamento } from '../../core/ehr'
const mockCreateAgendamento = createAgendamento as ReturnType<typeof vi.fn>

function renderForm(props: Record<string, unknown> = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  const result = render(
    <MemoryRouter>
      <AgendamentoForm patientId="pac-1" onSave={onSave} onClose={onClose} {...props} />
    </MemoryRouter>
  )
  return { ...result, onSave, onClose }
}

describe('AgendamentoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateAgendamento.mockResolvedValue({
      id: 'age-new', patientId: 'pac-1', dataHora: new Date().toISOString(),
      tipo: 'Consulta', status: 'Pendente', criadoEm: '', atualizadoEm: '',
    })
  })

  it('should render form title', () => {
    renderForm()
    expect(screen.getByText('Novo Agendamento')).toBeInTheDocument()
  })

  it('should have datetime input', () => {
    renderForm()
    // Component uses a div label, not a real <label> element
    expect(screen.getByText('Data e Hora *')).toBeInTheDocument()
  })

  it('should have tipo select', () => {
    renderForm()
    expect(screen.getByText('Consulta')).toBeInTheDocument()
  })

  it('should have veterinario input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Nome do veterinário')).toBeInTheDocument()
  })

  it('should have observacoes textarea', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Observações...')).toBeInTheDocument()
  })

  it('should call onClose when Cancelar clicked', () => {
    const { onClose } = renderForm()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should disable Agendar button without data', () => {
    renderForm()
    const agendarBtn = screen.getByText('Agendar')
    expect(agendarBtn.closest('button')).toBeDisabled()
  })

  it('should call createAgendamento with data', async () => {
    const { onSave } = renderForm()
    // Find the datetime input by type
    const dateInput = document.querySelector('input[type="datetime-local"]')
    expect(dateInput).not.toBeNull()
    fireEvent.change(dateInput!, { target: { value: '2026-07-15T10:00' } })
    fireEvent.click(screen.getByText('Agendar'))

    await waitFor(() => {
      expect(mockCreateAgendamento).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalled()
    })
  })
})
