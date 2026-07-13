import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useQueueStore } from '../queueStore'

// Mock engine functions
vi.mock('../../core/engine', () => ({
  getQueue: vi.fn(),
  getHistory: vi.fn(),
  getCallHistory: vi.fn(),
  getActiveCall: vi.fn(),
}))

import { getQueue, getHistory, getCallHistory, getActiveCall } from '../../core/engine'
const mockGetQueue = getQueue as ReturnType<typeof vi.fn>
const mockGetHistory = getHistory as ReturnType<typeof vi.fn>
const mockGetCallHistory = getCallHistory as ReturnType<typeof vi.fn>
const mockGetActiveCall = getActiveCall as ReturnType<typeof vi.fn>

// Sample data
const mockDog = {
  id: 'dog-1', senha: 'N001', especie: 'Cão' as const,
  tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde' as const,
  status: 'Aguardando direcionamento', localDirecionado: 'Triagem',
  dataHora: '2026-06-25T10:00:00Z', unidade: 'HOVET Central',
}

const mockCat = {
  id: 'cat-1', senha: 'N002', especie: 'Gato' as const,
  tipoAtendimento: 'Consulta Marcada', prioridade: 'Amarelo' as const,
  status: 'Aguardando direcionamento', localDirecionado: 'Consulta',
  dataHora: '2026-06-25T11:00:00Z', unidade: 'HOVET Central',
}

const mockHistory = [{
  id: 'hist-1', senha: 'N000', especie: 'Cão' as const,
  tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde' as const,
  status: 'Finalizado', localDirecionado: 'Triagem',
  dataHora: '2026-06-25T09:00:00Z', unidade: 'HOVET Central',
}]

const defaultState = {
  dogs: [],
  cats: [],
  wild: [],
  history: [],
  activeCallDog: null,
  activeCallCat: null,
  activeCallWild: null,
  callHistoryDog: [],
  callHistoryCat: [],
  callHistoryWild: [],
  loading: true,
  unidade: '',
  isAdmin: false,
}

// Reset store before each test
beforeEach(() => {
  vi.clearAllMocks()
  useQueueStore.setState(defaultState)

  // Default mock implementations
  mockGetQueue.mockImplementation(async (species: string) => {
    if (species === 'Cão') return [mockDog]
    if (species === 'Gato') return [mockCat]
    return []
  })
  mockGetHistory.mockResolvedValue(mockHistory)
  mockGetCallHistory.mockResolvedValue([])
  mockGetActiveCall.mockResolvedValue(null)
})

describe('queueStore', () => {
  it('should initialize with default values', () => {
    const state = useQueueStore.getState()
    expect(state.dogs).toEqual([])
    expect(state.cats).toEqual([])
    expect(state.wild).toEqual([])
    expect(state.history).toEqual([])
    expect(state.loading).toBe(true)
    expect(state.unidade).toBe('')
    expect(state.isAdmin).toBe(false)
    expect(state.activeCallDog).toBeNull()
    expect(state.activeCallCat).toBeNull()
    expect(state.activeCallWild).toBeNull()
  })

  it('should setUnidade update unidade and isAdmin', () => {
    useQueueStore.getState().setUnidade('HOVET Central', true)
    const state = useQueueStore.getState()
    expect(state.unidade).toBe('HOVET Central')
    expect(state.isAdmin).toBe(true)
  })

  it('should load data via refresh', async () => {
    await useQueueStore.getState().refresh()

    const state = useQueueStore.getState()
    expect(state.dogs).toHaveLength(1)
    expect(state.dogs[0].senha).toBe('N001')
    expect(state.cats).toHaveLength(1)
    expect(state.cats[0].senha).toBe('N002')
    expect(state.wild).toHaveLength(0)
    expect(state.history).toEqual(mockHistory)
    expect(state.loading).toBe(false)
  })

  it('should call engine functions with correct species', async () => {
    // Set unidade first so we can verify it's passed correctly
    useQueueStore.setState({ unidade: '' })
    await useQueueStore.getState().refresh()

    expect(mockGetQueue).toHaveBeenCalledWith('Cão', '')
    expect(mockGetQueue).toHaveBeenCalledWith('Gato', '')
    expect(mockGetQueue).toHaveBeenCalledWith('Animais Silvestres', '')
    expect(mockGetHistory).toHaveBeenCalledWith('')
    expect(mockGetActiveCall).toHaveBeenCalledWith('Cão', '')
    expect(mockGetActiveCall).toHaveBeenCalledWith('Gato', '')
    expect(mockGetActiveCall).toHaveBeenCalledWith('Animais Silvestres', '')
    expect(mockGetCallHistory).toHaveBeenCalledWith('Cão', '')
    expect(mockGetCallHistory).toHaveBeenCalledWith('Gato', '')
    expect(mockGetCallHistory).toHaveBeenCalledWith('Animais Silvestres', '')
  })

  it('should filter unidade as empty when set to Todos', async () => {
    useQueueStore.setState({ unidade: 'Todos' })
    await useQueueStore.getState().refresh()

    expect(mockGetQueue).toHaveBeenCalledWith('Cão', '')
  })

  it('should pass unidade when not Todos', async () => {
    useQueueStore.setState({ unidade: 'HOVET Central' })
    await useQueueStore.getState().refresh()

    expect(mockGetQueue).toHaveBeenCalledWith('Cão', 'HOVET Central')
  })

  it('should load active calls', async () => {
    mockGetActiveCall.mockImplementation(async (species: string) => {
      if (species === 'Cão') return mockDog as any
      return null
    })

    await useQueueStore.getState().refresh()

    const state = useQueueStore.getState()
    expect(state.activeCallDog).toEqual(mockDog)
    expect(state.activeCallCat).toBeNull()
    expect(state.activeCallWild).toBeNull()
  })

  it('should load call history', async () => {
    const callHistoryItem = {
      id: 'ch-1', senha: 'N001', localDirecionado: 'Triagem',
      calledAt: '2026-06-25T10:00:00Z',
    }
    mockGetCallHistory.mockImplementation(async (species: string) => {
      if (species === 'Cão') return [callHistoryItem]
      return []
    })

    await useQueueStore.getState().refresh()

    const state = useQueueStore.getState()
    expect(state.callHistoryDog).toHaveLength(1)
    expect(state.callHistoryDog[0].senha).toBe('N001')
    expect(state.callHistoryCat).toHaveLength(0)
    expect(state.callHistoryWild).toHaveLength(0)
  })
})
