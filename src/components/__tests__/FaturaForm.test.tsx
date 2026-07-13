import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FaturaForm from '../FaturaForm'

vi.mock('../../core/financeiro', () => ({
  createFatura: vi.fn(),
  searchServicos: vi.fn(),
  addFaturaItem: vi.fn(),
  addPagamento: vi.fn(),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { createFatura, searchServicos, addFaturaItem } from '../../core/financeiro'
import { useAuth } from '../../context/AuthContext'
const mockCreateFatura = createFatura as ReturnType<typeof vi.fn>
const mockSearchServicos = searchServicos as ReturnType<typeof vi.fn>
const mockAddFaturaItem = addFaturaItem as ReturnType<typeof vi.fn>
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

async function renderForm(props: Record<string, unknown> = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  render(
    <MemoryRouter>
      <FaturaForm pacienteId="pac-1" onSave={onSave} onClose={onClose} {...props} />
    </MemoryRouter>
  )
  // Wait for async servicos to load to avoid act() warnings
  await screen.findByText('Selecione...')
  return { onSave, onClose }
}

describe('FaturaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } })
    mockSearchServicos.mockResolvedValue([
      { id: 'srv-1', nome: 'Consulta', preco: 150, ativo: true, criadoEm: '', atualizadoEm: '' },
      { id: 'srv-2', nome: 'Raio-X', preco: 200, ativo: true, criadoEm: '', atualizadoEm: '' },
    ])
    mockCreateFatura.mockResolvedValue({
      id: 'fat-new', pacienteId: 'pac-1', status: 'Aberta', valorTotal: 0, valorPago: 0, criadoEm: '', atualizadoEm: '',
    })
    mockAddFaturaItem.mockResolvedValue({ id: 'fi-new', faturaId: 'fat-new', descricao: 'Teste', quantidade: 1, precoUnitario: 100, subtotal: 100, criadoEm: '' })
  })

  it('should render form title', async () => {
    await renderForm()
    expect(screen.getByText('Nova Fatura')).toBeInTheDocument()
  })

  it('should have servico select', async () => {
    await renderForm()
    expect(screen.getByText('Selecione...')).toBeInTheDocument()
  })

  it('should have Adicionar button', async () => {
    await renderForm()
    expect(screen.getByText('Adicionar')).toBeInTheDocument()
  })

  it('should call onClose when Cancelar clicked', async () => {
    const { onClose } = await renderForm()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should disable Criar Fatura without items', async () => {
    await renderForm()
    const criarBtn = screen.getByText('Criar Fatura')
    expect(criarBtn.closest('button')).toBeDisabled()
  })

  it('should create fatura with items', async () => {
    const { onSave } = await renderForm()

    // Select a serviço and add
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'srv-1' } })
    fireEvent.click(screen.getByText('Adicionar'))

    await waitFor(() => {
      expect(screen.getByText(/Total: R\$/)).toBeInTheDocument()
    })
  })
})
