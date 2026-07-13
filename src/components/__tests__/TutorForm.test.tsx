import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TutorForm from '../TutorForm'

vi.mock('../../core/ehr', () => ({
  createOwner: vi.fn(),
  updateOwner: vi.fn(),
}))

import { createOwner, updateOwner } from '../../core/ehr'
const mockCreateOwner = createOwner as ReturnType<typeof vi.fn>
const mockUpdateOwner = updateOwner as ReturnType<typeof vi.fn>

function renderForm(props: Record<string, unknown> = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  const result = render(
    <MemoryRouter>
      <TutorForm onSave={onSave} onClose={onClose} {...props} />
    </MemoryRouter>
  )
  return { ...result, onSave, onClose }
}

describe('TutorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateOwner.mockResolvedValue({
      id: 'own-new', nome: 'Novo Tutor', criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(),
    })
  })

  it('should render form title for new tutor', () => {
    renderForm()
    expect(screen.getByText('Novo Tutor')).toBeInTheDocument()
  })

  it('should render form title for editing', () => {
    renderForm({
      owner: { id: 'own-1', nome: 'João', criadoEm: '', atualizadoEm: '' },
    })
    expect(screen.getByText('Editar Tutor')).toBeInTheDocument()
  })

  it('should have name input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Nome do tutor')).toBeInTheDocument()
  })

  it('should have CPF input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument()
  })

  it('should have phone input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('(00) 00000-0000')).toBeInTheDocument()
  })

  it('should have email input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('email@exemplo.com')).toBeInTheDocument()
  })

  it('should have address input', () => {
    renderForm()
    expect(screen.getByPlaceholderText(/Rua, número/)).toBeInTheDocument()
  })

  it('should have Cancelar button', () => {
    renderForm()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('should have Salvar button', () => {
    renderForm()
    expect(screen.getByText('Salvar')).toBeInTheDocument()
  })

  it('should call onClose when Cancelar clicked', () => {
    const { onClose } = renderForm()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call createOwner on save', async () => {
    const { onSave } = renderForm()
    fireEvent.change(screen.getByPlaceholderText('Nome do tutor'), { target: { value: 'Novo Tutor' } })
    fireEvent.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockCreateOwner).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('should should not save without name', () => {
    const { onSave } = renderForm()
    const salvarBtn = screen.getByText('Salvar')
    expect(salvarBtn.closest('button')).toBeDisabled()
  })
})
