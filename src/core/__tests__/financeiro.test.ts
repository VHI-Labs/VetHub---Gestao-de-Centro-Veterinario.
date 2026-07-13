import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  searchServicos,
  createServico,
  updateServico,
  deleteServico,
  getFaturas,
  getFatura,
  createFatura,
  updateFatura,
  deleteFatura,
  getItensByFatura,
  addFaturaItem,
  removeFaturaItem,
  getPagamentosByFatura,
  addPagamento,
  getFinanceiroDashboard,
  getFechamentoCaixa,
} from '../financeiro'

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
const mockFrom = supabase.from as ReturnType<typeof vi.fn>

function mockChain(resolvedData: unknown = []) {
  const resolveValue = { data: resolvedData, error: null }
  const promise = Promise.resolve(resolveValue)
  const chain = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    match: vi.fn(() => chain),
    not: vi.fn(() => chain),
    in: vi.fn(() => chain),
    contains: vi.fn(() => chain),
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  }
  return chain
}

describe('searchServicos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return servicos list', async () => {
    mockFrom.mockReturnValue(mockChain([
      { id: 'srv-1', nome: 'Consulta', preco: 150, ativo: true },
      { id: 'srv-2', nome: 'Vacina V10', preco: 80, ativo: true },
    ]))
    const result = await searchServicos('', '')
    expect(result).toHaveLength(2)
    expect(result[0].nome).toBe('Consulta')
    expect(result[1].preco).toBe(80)
  })

  it('should return empty on error', async () => {
    const promise = Promise.resolve({ data: null, error: new Error('Err') })
    const errChain = {
      select: vi.fn(() => errChain), eq: vi.fn(() => errChain), or: vi.fn(() => errChain),
      order: vi.fn(() => errChain), limit: vi.fn(() => errChain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(errChain)
    const result = await searchServicos('', '')
    expect(result).toEqual([])
  })
})

describe('createServico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create and return servico', async () => {
    mockFrom.mockReturnValue(mockChain())
    const result = await createServico({
      id: '', nome: 'Raio-X', preco: 200, ativo: true,
    })
    expect(result.nome).toBe('Raio-X')
    expect(result.preco).toBe(200)
    expect(result.criadoEm).toBeDefined()
  })
})

describe('updateServico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update servico', async () => {
    mockFrom.mockReturnValue(mockChain())
    await expect(updateServico('srv-1', { preco: 250 })).resolves.not.toThrow()
  })
})

describe('deleteServico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should soft delete servico', async () => {
    mockFrom.mockReturnValue(mockChain({ id: 'srv-1' }))
    await expect(deleteServico('srv-1')).resolves.not.toThrow()
  })
})

describe('getFaturas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return faturas', async () => {
    mockFrom.mockReturnValue(mockChain([
      { id: 'fat-1', paciente_id: 'pac-1', status: 'Aberta', valor_total: 300, valor_pago: 0 },
      { id: 'fat-2', paciente_id: 'pac-2', status: 'Paga', valor_total: 150, valor_pago: 150 },
    ]))
    const result = await getFaturas('')
    expect(result).toHaveLength(2)
    expect(result[0].status).toBe('Aberta')
    expect(result[1].status).toBe('Paga')
  })

  it('should filter by status', async () => {
    mockFrom.mockReturnValue(mockChain([]))
    await getFaturas('', 'Aberta')
    expect(mockFrom).toHaveBeenCalledWith('faturas')
  })
})

describe('getFatura', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return single fatura', async () => {
    mockFrom.mockReturnValue(mockChain({ id: 'fat-1', paciente_id: 'pac-1', status: 'Aberta', valor_total: 300, valor_pago: 0 }))
    const result = await getFatura('fat-1')
    expect(result).not.toBeNull()
    expect(result!.status).toBe('Aberta')
  })

  it('should return null on error', async () => {
    const promise = Promise.resolve({ data: null, error: new Error('Err') })
    const chain = {
      select: vi.fn(() => chain), eq: vi.fn(() => chain), single: vi.fn(() => chain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(chain)
    const result = await getFatura('fat-1')
    expect(result).toBeNull()
  })
})

describe('createFatura', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create fatura', async () => {
    mockFrom.mockReturnValue(mockChain())
    const result = await createFatura({
      id: '', pacienteId: 'pac-1', status: 'Aberta', valorTotal: 400, valorPago: 0,
    })
    expect(result.status).toBe('Aberta')
    expect(result.valorTotal).toBe(400)
  })
})

describe('updateFatura', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update fatura', async () => {
    mockFrom.mockReturnValue(mockChain())
    await expect(updateFatura('fat-1', { status: 'Paga' })).resolves.not.toThrow()
  })
})

describe('deleteFatura', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete fatura', async () => {
    mockFrom.mockReturnValue(mockChain({ id: 'fat-1' }))
    await expect(deleteFatura('fat-1')).resolves.not.toThrow()
  })
})

describe('getItensByFatura', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return itens', async () => {
    mockFrom.mockReturnValue(mockChain([
      { id: 'fi-1', fatura_id: 'fat-1', descricao: 'Consulta', quantidade: 1, preco_unitario: 150, subtotal: 150 },
    ]))
    const result = await getItensByFatura('fat-1')
    expect(result).toHaveLength(1)
    expect(result[0].descricao).toBe('Consulta')
  })
})

describe('addFaturaItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add item to fatura', async () => {
    mockFrom.mockReturnValue(mockChain())
    const result = await addFaturaItem({
      faturaId: 'fat-1', descricao: 'Exame', quantidade: 1, precoUnitario: 80, subtotal: 80,
    })
    expect(result.descricao).toBe('Exame')
    expect(result.id).toBeDefined()
  })
})

describe('removeFaturaItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should remove item', async () => {
    mockFrom.mockReturnValue(mockChain())
    await expect(removeFaturaItem('fi-1')).resolves.not.toThrow()
  })
})

describe('getPagamentosByFatura', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return pagamentos', async () => {
    mockFrom.mockReturnValue(mockChain([
      { id: 'pgt-1', fatura_id: 'fat-1', valor: 150, metodo: 'Pix' },
    ]))
    const result = await getPagamentosByFatura('fat-1')
    expect(result).toHaveLength(1)
    expect(result[0].metodo).toBe('Pix')
  })
})

describe('addPagamento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add pagamento and update fatura', async () => {
    mockFrom
      .mockReturnValueOnce(mockChain()) // insert pagamento
      .mockReturnValueOnce(mockChain({ valor_pago: 100, valor_total: 300 })) // select fatura
      .mockReturnValueOnce(mockChain()) // update fatura
    const result = await addPagamento({
      faturaId: 'fat-1', valor: 200, metodo: 'Pix', dataPagamento: new Date().toISOString(),
    })
    expect(result.valor).toBe(200)
    expect(result.metodo).toBe('Pix')
  })
})

describe('getFinanceiroDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return dashboard metrics', async () => {
    mockFrom
      .mockReturnValueOnce(mockChain([
        { id: 'fat-1', status: 'Paga', valor_total: 300, valor_pago: 300 },
        { id: 'fat-2', status: 'Aberta', valor_total: 200, valor_pago: 0 },
        { id: 'fat-3', status: 'Parcial', valor_total: 400, valor_pago: 100 },
      ]))
      .mockReturnValueOnce(mockChain([
        { id: 'pgt-1', fatura_id: 'fat-1', valor: 300, metodo: 'Pix' },
      ]))
    const result = await getFinanceiroDashboard('')
    expect(result.totalReceita).toBe(300)
    expect(result.faturasPagas).toBe(1)
    expect(result.faturasAbertas).toBe(2)
    expect(result.pagamentosRecentes).toHaveLength(1)
  })

  it('should return zeros on error', async () => {
    const errPromise = Promise.resolve({ data: null, error: new Error('Err') })
    const errChain = {
      select: vi.fn(() => errChain), eq: vi.fn(() => errChain),
      order: vi.fn(() => errChain), limit: vi.fn(() => errChain),
      then: errPromise.then.bind(errPromise), catch: errPromise.catch.bind(errPromise), finally: errPromise.finally.bind(errPromise),
    }
    mockFrom.mockReturnValue(errChain)
    const result = await getFinanceiroDashboard('')
    expect(result.totalReceita).toBe(0)
    expect(result.totalAberto).toBe(0)
  })
})

describe('getFechamentoCaixa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return fechamento by metodo', async () => {
    mockFrom.mockReturnValue(mockChain([
      { metodo: 'Pix', valor: 300 },
      { metodo: 'Dinheiro', valor: 150 },
      { metodo: 'Pix', valor: 200 },
    ]))
    const result = await getFechamentoCaixa('2026-06-25', '')
    expect(result).toHaveLength(2)
    const pix = result.find(r => r.metodo === 'Pix')
    expect(pix!.total).toBe(500)
  })
})
