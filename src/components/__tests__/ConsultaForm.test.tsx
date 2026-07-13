import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ConsultaForm from '../ConsultaForm'

vi.mock('../../core/ehr', () => ({
  createConsulta: vi.fn(),
  updateConsulta: vi.fn(),
}))

import { createConsulta, updateConsulta } from '../../core/ehr'
const mockCreateConsulta = createConsulta as ReturnType<typeof vi.fn>
const mockUpdateConsulta = updateConsulta as ReturnType<typeof vi.fn>

function renderForm(props: Record<string, unknown> = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  const result = render(
    <MemoryRouter>
      <ConsultaForm patientId="pac-1" onSave={onSave} onClose={onClose} {...props} />
    </MemoryRouter>
  )
  return { ...result, onSave, onClose }
}

describe('ConsultaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateConsulta.mockResolvedValue({
      id: 'cons-new', patientId: 'pac-1', veterinario: 'Dr. Teste', motivo: 'Check-up',
      criadoEm: '', atualizadoEm: '',
    })
  })

  it('should render form title for new consulta', () => {
    renderForm()
    expect(screen.getByText('Nova Consulta')).toBeInTheDocument()
  })

  it('should render form title for editing', () => {
    renderForm({
      consulta: {
        id: 'cons-1', patientId: 'pac-1', veterinario: 'Dr. Vet', motivo: 'Rotina',
        criadoEm: '', atualizadoEm: '',
      },
    })
    expect(screen.getByText('Editar Consulta')).toBeInTheDocument()
  })

  it('should have veterinario input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Nome do veterinário')).toBeInTheDocument()
  })

  it('should have motivo textarea', () => {
    renderForm()
    expect(screen.getByPlaceholderText(/Queixa principal/)).toBeInTheDocument()
  })

  it('should have diagnostico textarea', () => {
    renderForm()
    expect(screen.getByPlaceholderText(/Hipótese diagnóstica/)).toBeInTheDocument()
  })

  it('should have prescricao textarea', () => {
    renderForm()
    expect(screen.getByPlaceholderText(/Medicamentos, dosagens/)).toBeInTheDocument()
  })

  it('should call onClose when Cancelar clicked', () => {
    const { onClose } = renderForm()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call createConsulta on save', async () => {
    const { onSave } = renderForm()
    fireEvent.change(screen.getByPlaceholderText('Nome do veterinário'), { target: { value: 'Dr. Teste' } })
    fireEvent.change(screen.getByPlaceholderText(/Queixa principal/), { target: { value: 'Check-up geral' } })
    fireEvent.click(screen.getByText('Salvar Consulta'))

    await waitFor(() => {
      expect(mockCreateConsulta).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('should disable save without required fields', () => {
    renderForm()
    const saveBtn = screen.getByText('Salvar Consulta')
    expect(saveBtn.closest('button')).toBeDisabled()
  })
})
