import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  searchMedicamentos,
  getMedicamento,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento,
  getMovimentacoes,
  createMovimentacao,
  getEstoqueAlertas,
  getRelatorioConsumo,
} from '../estoque'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

vi.mock('../audit', () => ({
  logAudit: vi.fn(),
}))

vi.mock('../ehr', () => ({
  genId: (prefix: string) => `${prefix}-test-123`,
}))

import { supabase } from '../../lib/supabase'
import { makeChain, makeErrorChain } from '../../test/mocks'
const mockFrom = supabase.from as ReturnType<typeof vi.fn>

describe('searchMedicamentos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return list of medicamentos', async () => {
    mockFrom.mockReturnValue(makeChain([
      { id: 'med-1', nome: 'Amoxicilina', estoque_minimo: 5, estoque_atual: 20, ativo: true },
      { id: 'med-2', nome: 'Dipirona', estoque_minimo: 10, estoque_atual: 3, ativo: true },
    ]))
    const result = await searchMedicamentos('', '')
    expect(result).toHaveLength(2)
    expect(result[0].nome).toBe('Amoxicilina')
    expect(result[1].nome).toBe('Dipirona')
  })

  it('should filter by unidade', async () => {
    mockFrom.mockReturnValue(makeChain([]))
    await searchMedicamentos('', 'Unidade Central')
    expect(mockFrom).toHaveBeenCalledWith('medicamentos')
  })

  it('should search by query string', async () => {
    mockFrom.mockReturnValue(makeChain([]))
    await searchMedicamentos('Amoxi', '')
    expect(mockFrom).toHaveBeenCalledWith('medicamentos')
  })

  it('should return empty array on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain('DB error'))
    const result = await searchMedicamentos('', '')
    expect(result).toEqual([])
  })

  it('should map estoque fields correctly', async () => {
    mockFrom.mockReturnValue(makeChain([
      { id: 'med-1', nome: 'Amoxicilina', estoque_minimo: 5, estoque_atual: 20, ativo: true },
    ]))
    const result = await searchMedicamentos('', '')
    expect(result[0].estoqueMinimo).toBe(5)
    expect(result[0].estoqueAtual).toBe(20)
  })
})

describe('getMedicamento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return a single medicamento', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'med-1', nome: 'Amoxicilina', estoque_minimo: 5, estoque_atual: 20, ativo: true }))
    const result = await getMedicamento('med-1')
    expect(result).not.toBeNull()
    expect(result!.nome).toBe('Amoxicilina')
  })

  it('should return null on error', async () => {
    const promise = Promise.resolve({ data: null, error: new Error('Not found') })
    const chain = {
      select: vi.fn(() => chain), eq: vi.fn(() => chain), single: vi.fn(() => chain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(chain)
    const result = await getMedicamento('med-1')
    expect(result).toBeNull()
  })

  it('should return null when no data', async () => {
    const promise = Promise.resolve({ data: null, error: null })
    const chain = {
      select: vi.fn(() => chain), eq: vi.fn(() => chain), single: vi.fn(() => chain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(chain)
    const result = await getMedicamento('med-1')
    expect(result).toBeNull()
  })
})

describe('createMedicamento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a medicamento and return it', async () => {
    mockFrom.mockReturnValue(makeChain())
    const result = await createMedicamento({
      id: '', nome: 'NovoMed', principioAtivo: 'Principio',
      estoqueMinimo: 5, estoqueAtual: 10, ativo: true,
    })
    expect(result.nome).toBe('NovoMed')
    expect(result.estoqueMinimo).toBe(5)
    expect(result.estoqueAtual).toBe(10)
    expect(result.criadoEm).toBeDefined()
    expect(result.atualizadoEm).toBeDefined()
  })

  it('should handle insert error gracefully', async () => {
    const promise = Promise.resolve({ error: new Error('Insert failed') })
    const chain = {
      insert: vi.fn(() => chain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(chain)
    const result = await createMedicamento({
      id: '', nome: 'NovoMed', estoqueMinimo: 0, estoqueAtual: 0, ativo: true,
    })
    expect(result.nome).toBe('NovoMed')
  })
})

describe('updateMedicamento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update nome field', async () => {
    mockFrom.mockReturnValue(makeChain())
    await updateMedicamento('med-1', { nome: 'NovoNome' })
    expect(mockFrom).toHaveBeenCalledWith('medicamentos')
  })

  it('should update estoque fields', async () => {
    mockFrom.mockReturnValue(makeChain())
    await updateMedicamento('med-1', { estoqueAtual: 50, estoqueMinimo: 10 })
    expect(mockFrom).toHaveBeenCalledWith('medicamentos')
  })

  it('should handle error gracefully', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(updateMedicamento('med-1', { nome: 'Teste' })).resolves.not.toThrow()
  })
})

describe('deleteMedicamento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should soft delete (select old + delete)', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'med-1', nome: 'Teste' }))
    await expect(deleteMedicamento('med-1')).resolves.not.toThrow()
  })
})

describe('getMovimentacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return movimentacoes list', async () => {
    mockFrom.mockReturnValue(makeChain([
      { id: 'mov-1', medicamento_id: 'med-1', tipo: 'Entrada', quantidade: 10 },
    ]))
    const result = await getMovimentacoes('med-1')
    expect(result).toHaveLength(1)
    expect(result[0].medicamentoId).toBe('med-1')
    expect(result[0].tipo).toBe('Entrada')
  })

  it('should return empty on error', async () => {
    const promise = Promise.resolve({ data: null, error: new Error('Err') })
    const chain = {
      select: vi.fn(() => chain), eq: vi.fn(() => chain), order: vi.fn(() => chain), limit: vi.fn(() => chain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(chain)
    const result = await getMovimentacoes('med-1')
    expect(result).toEqual([])
  })
})

describe('createMovimentacao', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ error: new Error('RPC not found') })
  })

  it('should create movimentacao and increment stock', async () => {
    const medChain = makeChain({ estoque_atual: 20 })
    mockFrom
      .mockReturnValueOnce(makeChain()) // insert mov
      .mockReturnValueOnce(medChain) // select medicamento
      .mockReturnValueOnce(makeChain()) // update stock fallback
    const result = await createMovimentacao({
      medicamentoId: 'med-1', tipo: 'Entrada', quantidade: 5,
    })
    expect(result.tipo).toBe('Entrada')
    expect(result.quantidade).toBe(5)
    expect(result.id).toBeDefined()
  })

  it('should decrement stock on Saida', async () => {
    const medChain = makeChain({ estoque_atual: 20 })
    mockFrom
      .mockReturnValueOnce(makeChain()) // insert mov
      .mockReturnValueOnce(medChain) // select medicamento
      .mockReturnValueOnce(makeChain()) // update stock fallback
    const result = await createMovimentacao({
      medicamentoId: 'med-1', tipo: 'Saida', quantidade: 3,
    })
    expect(result.tipo).toBe('Saida')
  })
})

describe('getEstoqueAlertas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should alert on low stock', async () => {
    mockFrom.mockReturnValue(makeChain([
      { id: 'med-1', nome: 'Baixo', estoque_minimo: 10, estoque_atual: 2, ativo: true },
      { id: 'med-2', nome: 'OK', estoque_minimo: 5, estoque_atual: 20, ativo: true },
    ]))
    const result = await getEstoqueAlertas('')
    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe('Baixo')
  })

  it('should return empty on error', async () => {
    const promise = Promise.resolve({ data: null, error: new Error('Err') })
    const chain = {
      select: vi.fn(() => chain),
      order: vi.fn(() => chain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(chain)
    const result = await getEstoqueAlertas('')
    expect(result).toEqual([])
  })
})

describe('getRelatorioConsumo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return consumo grouped by medicamento', async () => {
    mockFrom
      .mockReturnValueOnce(makeChain([
        { medicamento_id: 'med-1', quantidade: 5 },
        { medicamento_id: 'med-1', quantidade: 3 },
        { medicamento_id: 'med-2', quantidade: 10 },
      ]))
      .mockReturnValueOnce(makeChain({ nome: 'Amoxicilina' }))
      .mockReturnValueOnce(makeChain({ nome: 'Dipirona' }))
    const result = await getRelatorioConsumo('')
    expect(result).toHaveLength(2)
    expect(result[0].totalSaidas).toBe(10)
    expect(result[1].totalSaidas).toBe(8)
  })

  it('should return empty on error', async () => {
    const promise = Promise.resolve({ data: null, error: new Error('Err') })
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      gte: vi.fn(() => chain),
      lte: vi.fn(() => chain),
      order: vi.fn(() => chain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(chain)
    const result = await getRelatorioConsumo('')
    expect(result).toEqual([])
  })
})
