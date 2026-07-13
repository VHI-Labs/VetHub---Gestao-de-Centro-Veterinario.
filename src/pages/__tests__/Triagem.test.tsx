import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Triagem from '../Triagem'
import { MOCK_TRIAGEM_RESULT } from '../../test/mockFactories'
import { renderPage } from '../../test/pageTestSetup'

// Mock via __mocks__ directories
vi.mock('../../core/engine')
vi.mock('../../core/ehr')

import { createTriagem } from '../../core/engine'
const mockCreateTriagem = createTriagem as ReturnType<typeof vi.fn>

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ThumbsUp: () => <div data-testid="thumbs-up">👍</div>,
  ThumbsDown: () => <div data-testid="thumbs-down">👎</div>,
  Printer: () => <div data-testid="printer">🖨</div>,
  Maximize: () => <div data-testid="maximize">⛶</div>,
  Search: () => <div data-testid="search">🔍</div>,
  Check: () => <div data-testid="check">✓</div>,
}))

// Mock react-fluentui-emoji icons
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMDogFace', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="dog-icon" style={{ fontSize: size }}>🐕</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMCatFace', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="cat-icon" style={{ fontSize: size }}>🐈</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMBird', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="bird-icon" style={{ fontSize: size }}>🦜</span>,
}))
vi.mock('react-fluentui-emoji/lib/modern/icons/IconMPawPrints', () => ({
  default: ({ size }: { size?: number }) => <span data-testid="paw-icon" style={{ fontSize: size }}>🐾</span>,
}))

const renderTriagem = () => renderPage(<Triagem />, ['/triagem'])
const renderTriagemWithUnidade = (unidade: string) =>
  renderPage(<Triagem />, [`/triagem?unidade=${unidade}`])

describe('Triagem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateTriagem.mockResolvedValue(MOCK_TRIAGEM_RESULT)
  })

  it('should show unidade selection when no unidade is set', () => {
    renderTriagem()
    expect(screen.getByText('Selecione a Unidade')).toBeInTheDocument()
    expect(screen.getByText('Unidade Central')).toBeInTheDocument()
    expect(screen.getByText('Unidade Norte')).toBeInTheDocument()
  })

  it('should show species selection after unidade is selected', async () => {
    renderTriagem()
    fireEvent.click(screen.getByText('Unidade Central'))
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao VetHub')).toBeInTheDocument()
    })
  })

  it('should render species cards', async () => {
    renderTriagem()
    fireEvent.click(screen.getByText('Unidade Central'))
    await waitFor(() => {
      expect(screen.getByText('Cão')).toBeInTheDocument()
      expect(screen.getByText('Gato')).toBeInTheDocument()
      expect(screen.getByText('Animais Silvestres')).toBeInTheDocument()
    })
  })

  it('should show unidade from URL query param', () => {
    renderTriagemWithUnidade('Unidade Norte')
    expect(screen.getByText('Bem-vindo ao VetHub')).toBeInTheDocument()
  })

  it('should not use URL unidade if not in allowed list', () => {
    renderTriagemWithUnidade('InvalidUnidade')
    expect(screen.getByText('Selecione a Unidade')).toBeInTheDocument()
  })

  it('should show attendance options after selecting species', async () => {
    renderTriagemWithUnidade('Unidade Central')
    await waitFor(() => {
      expect(screen.getByText('Bem-vindo ao VetHub')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Cão'))

    await waitFor(() => {
      expect(screen.getByText('Tipo de Atendimento')).toBeInTheDocument()
    })
    expect(screen.getByText('Pronto Atendimento')).toBeInTheDocument()
    expect(screen.getByText('Cirurgia Agendada')).toBeInTheDocument()
    expect(screen.getByText('Exames')).toBeInTheDocument()
  })

  it('should go to identification step after selecting attendance type', async () => {
    renderTriagemWithUnidade('Unidade Central')
    await waitFor(() => { expect(screen.getByText('Bem-vindo ao VetHub')).toBeInTheDocument() })
    fireEvent.click(screen.getByText('Cão'))

    await waitFor(() => { expect(screen.getByText('Tipo de Atendimento')).toBeInTheDocument() })
    fireEvent.click(screen.getByText('Pronto Atendimento'))

    await waitFor(() => {
      expect(screen.getByText('Identificação')).toBeInTheDocument()
    })
  })

  it('should show patient search when pressing Sim', async () => {
    renderTriagemWithUnidade('Unidade Central')
    await waitFor(() => { expect(screen.getByText('Bem-vindo ao VetHub')).toBeInTheDocument() })
    fireEvent.click(screen.getByText('Cão'))
    await waitFor(() => { expect(screen.getByText('Tipo de Atendimento')).toBeInTheDocument() })
    fireEvent.click(screen.getByText('Pronto Atendimento'))
    await waitFor(() => { expect(screen.getByText('Identificação')).toBeInTheDocument() })

    fireEvent.click(screen.getByTestId('thumbs-up'))

    await waitFor(() => {
      expect(screen.getByText('Buscar Paciente')).toBeInTheDocument()
    })
  })

  it('should create triagem when Não selected', async () => {
    renderTriagemWithUnidade('Unidade Central')
    await waitFor(() => { expect(screen.getByText('Bem-vindo ao VetHub')).toBeInTheDocument() })
    fireEvent.click(screen.getByText('Cão'))
    await waitFor(() => { expect(screen.getByText('Tipo de Atendimento')).toBeInTheDocument() })
    fireEvent.click(screen.getByText('Pronto Atendimento'))
    await waitFor(() => { expect(screen.getByText('Identificação')).toBeInTheDocument() })

    fireEvent.click(screen.getByTestId('thumbs-down'))

    await waitFor(() => {
      expect(mockCreateTriagem).toHaveBeenCalled()
      expect(screen.getByText('Senha Emitida com Sucesso!')).toBeInTheDocument()
    })
  })

  it('should show step indicator dots after selecting species', async () => {
    renderTriagemWithUnidade('Unidade Central')
    await waitFor(() => { expect(screen.getByText('Bem-vindo ao VetHub')).toBeInTheDocument() })

    fireEvent.click(screen.getByText('Cão'))

    await waitFor(() => {
      const stepDots = document.querySelectorAll('.step-dot')
      expect(stepDots.length).toBe(3)
    })
  })

  it('should have a back button on step 1', async () => {
    renderTriagemWithUnidade('Unidade Central')
    await waitFor(() => { expect(screen.getByText('Bem-vindo ao VetHub')).toBeInTheDocument() })
    fireEvent.click(screen.getByText('Cão'))
    await waitFor(() => { expect(screen.getByText('Tipo de Atendimento')).toBeInTheDocument() })

    const voltarButtons = screen.getAllByText('Voltar')
    expect(voltarButtons.length).toBeGreaterThanOrEqual(1)
  })
})
