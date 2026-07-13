import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VeterinarioForm from '../VeterinarioForm'

vi.mock('../../core/veterinarios', () => ({
  createVeterinario: vi.fn(),
  updateVeterinario: vi.fn(),
}))

import { createVeterinario, updateVeterinario } from '../../core/veterinarios'
const mockCreateVet = createVeterinario as ReturnType<typeof vi.fn>
const mockUpdateVet = updateVeterinario as ReturnType<typeof vi.fn>

function renderForm(props: Record<string, unknown> = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  const result = render(
    <MemoryRouter>
      <VeterinarioForm onSave={onSave} onClose={onClose} {...props} />
    </MemoryRouter>
  )
  return { ...result, onSave, onClose }
}

describe('VeterinarioForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateVet.mockResolvedValue({
      id: 'vet-new', nome: 'Dr. Teste', ativo: true, criadoEm: '', atualizadoEm: '',
    })
  })

  it('should render form title for new', () => {
    renderForm()
    expect(screen.getByText('Novo Veterinário')).toBeInTheDocument()
  })

  it('should render form title for editing', () => {
    renderForm({ veterinario: { id: 'vet-1', nome: 'Dr. Vet', ativo: true, criadoEm: '', atualizadoEm: '' } })
    expect(screen.getByText('Editar Veterinário')).toBeInTheDocument()
  })

  it('should have nome input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Nome completo')).toBeInTheDocument()
  })

  it('should have CRMV input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Registro CRMV')).toBeInTheDocument()
  })

  it('should have especialidade input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Ex: Clínica Geral')).toBeInTheDocument()
  })

  it('should have telefone input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('(11) 99999-9999')).toBeInTheDocument()
  })

  it('should have email input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('email@exemplo.com')).toBeInTheDocument()
  })

  it('should call onClose when Cancelar clicked', () => {
    const { onClose } = renderForm()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call createVeterinario on save', async () => {
    const { onSave } = renderForm()
    fireEvent.change(screen.getByPlaceholderText('Nome completo'), { target: { value: 'Dr. Teste' } })
    fireEvent.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockCreateVet).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalled()
    })
  })
})
