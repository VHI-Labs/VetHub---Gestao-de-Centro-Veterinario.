import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PacienteForm from '../PacienteForm'

vi.mock('../../core/ehr', () => ({
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
}))

import { createPatient, updatePatient } from '../../core/ehr'
const mockCreatePatient = createPatient as ReturnType<typeof vi.fn>
const mockUpdatePatient = updatePatient as ReturnType<typeof vi.fn>

function renderForm(props: Record<string, unknown> = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  const result = render(
    <MemoryRouter>
      <PacienteForm patientId="" onSave={onSave} onClose={onClose} {...props} />
    </MemoryRouter>
  )
  return { ...result, onSave, onClose }
}

describe('PacienteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreatePatient.mockResolvedValue({
      id: 'pac-new', nome: 'Rex', especie: 'Cão', criadoEm: '', atualizadoEm: '',
    })
  })

  it('should render form title for new patient', () => {
    renderForm()
    expect(screen.getByText('Novo Paciente')).toBeInTheDocument()
  })

  it('should render form title for editing', () => {
    renderForm({
      patient: { id: 'pac-1', nome: 'Rex', especie: 'Cão', criadoEm: '', atualizadoEm: '' },
    })
    expect(screen.getByText('Editar Paciente')).toBeInTheDocument()
  })

  it('should have nome input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Nome do paciente')).toBeInTheDocument()
  })

  it('should have species select', () => {
    renderForm()
    expect(screen.getByDisplayValue('Cão')).toBeInTheDocument()
  })

  it('should have raca input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Ex: Labrador')).toBeInTheDocument()
  })

  it('should have idade input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Ex: 3 anos')).toBeInTheDocument()
  })

  it('should have peso input', () => {
    renderForm()
    const pesoInput = screen.getByPlaceholderText('Ex: 12.5')
    expect(pesoInput).toBeInTheDocument()
  })

  it('should call onClose when Cancelar clicked', () => {
    const { onClose } = renderForm()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call createPatient on save', async () => {
    const { onSave } = renderForm()
    fireEvent.change(screen.getByPlaceholderText('Nome do paciente'), { target: { value: 'Totó' } })
    fireEvent.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockCreatePatient).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('should disable save without name', () => {
    renderForm()
    const salvarBtn = screen.getByText('Salvar')
    expect(salvarBtn.closest('button')).toBeDisabled()
  })
})
