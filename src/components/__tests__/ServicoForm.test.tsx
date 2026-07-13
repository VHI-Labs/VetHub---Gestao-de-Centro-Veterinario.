import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ServicoForm from '../ServicoForm'

vi.mock('../../core/financeiro', () => ({
  createServico: vi.fn(),
  updateServico: vi.fn(),
}))

import { createServico, updateServico } from '../../core/financeiro'
const mockCreateServico = createServico as ReturnType<typeof vi.fn>
const mockUpdateServico = updateServico as ReturnType<typeof vi.fn>

function renderForm(props: Record<string, unknown> = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  const result = render(
    <MemoryRouter>
      <ServicoForm onSave={onSave} onClose={onClose} {...props} />
    </MemoryRouter>
  )
  return { ...result, onSave, onClose }
}

describe('ServicoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateServico.mockResolvedValue({
      id: 'srv-new', nome: 'Novo Serviço', preco: 100, ativo: true, criadoEm: '', atualizadoEm: '',
    })
  })

  it('should render form title for new', () => {
    renderForm()
    expect(screen.getByText('Novo Serviço')).toBeInTheDocument()
  })

  it('should render form title for editing', () => {
    renderForm({ servico: { id: 'srv-1', nome: 'Consulta', preco: 150, ativo: true, criadoEm: '', atualizadoEm: '' } })
    expect(screen.getByText('Editar Serviço')).toBeInTheDocument()
  })

  it('should have nome input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Nome do serviço')).toBeInTheDocument()
  })

  it('should have categoria select', () => {
    renderForm()
    expect(screen.getByDisplayValue('Consulta')).toBeInTheDocument()
  })

  it('should have preco input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
  })

  it('should call onClose when Cancelar clicked', () => {
    const { onClose } = renderForm()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call createServico on save', async () => {
    const { onSave } = renderForm()
    fireEvent.change(screen.getByPlaceholderText('Nome do serviço'), { target: { value: 'Raio-X' } })
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '200' } })
    fireEvent.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockCreateServico).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalled()
    })
  })
})
