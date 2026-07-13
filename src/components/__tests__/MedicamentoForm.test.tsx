import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MedicamentoForm from '../MedicamentoForm'

vi.mock('../../core/estoque', () => ({
  createMedicamento: vi.fn(),
  updateMedicamento: vi.fn(),
}))

import { createMedicamento, updateMedicamento } from '../../core/estoque'
const mockCreateMed = createMedicamento as ReturnType<typeof vi.fn>
const mockUpdateMed = updateMedicamento as ReturnType<typeof vi.fn>

function renderForm(props: Record<string, unknown> = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  const result = render(
    <MemoryRouter>
      <MedicamentoForm onSave={onSave} onClose={onClose} {...props} />
    </MemoryRouter>
  )
  return { ...result, onSave, onClose }
}

describe('MedicamentoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateMed.mockResolvedValue({
      id: 'med-new', nome: 'NovoMed', estoqueMinimo: 5, estoqueAtual: 10, ativo: true,
      criadoEm: '', atualizadoEm: '',
    })
  })

  it('should render form title for new medicamento', () => {
    renderForm()
    expect(screen.getByText('Novo Medicamento')).toBeInTheDocument()
  })

  it('should render form title for editing', () => {
    renderForm({ medicamento: { id: 'med-1', nome: 'Teste', estoqueMinimo: 0, estoqueAtual: 0, ativo: true, criadoEm: '', atualizadoEm: '' } })
    expect(screen.getByText('Editar Medicamento')).toBeInTheDocument()
  })

  it('should have nome input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Nome do medicamento')).toBeInTheDocument()
  })

  it('should have principio ativo input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Ex: Amoxicilina')).toBeInTheDocument()
  })

  it('should have fabricante input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Ex: Zoetis')).toBeInTheDocument()
  })

  it('should have preco inputs', () => {
    renderForm()
    const precoInputs = screen.getAllByPlaceholderText('0.00')
    expect(precoInputs.length).toBeGreaterThanOrEqual(2)
  })

  it('should have estoque inputs', () => {
    renderForm()
    const estoqueInputs = screen.getAllByPlaceholderText('0')
    expect(estoqueInputs.length).toBeGreaterThanOrEqual(2)
  })

  it('should have validade input as date type', () => {
    renderForm()
    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs.length).toBeGreaterThanOrEqual(1)
  })

  it('should call onClose when Cancelar clicked', () => {
    const { onClose } = renderForm()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call createMedicamento on save', async () => {
    const { onSave } = renderForm()
    fireEvent.change(screen.getByPlaceholderText('Nome do medicamento'), { target: { value: 'Amoxicilina' } })
    fireEvent.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockCreateMed).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('should disable save without nome', () => {
    renderForm()
    const saveBtn = screen.getByText('Salvar')
    expect(saveBtn.closest('button')).toBeDisabled()
  })
})
