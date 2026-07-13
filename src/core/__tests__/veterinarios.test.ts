import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  searchVeterinarios,
  getVeterinario,
  createVeterinario,
  updateVeterinario,
  deleteVeterinario,
} from '../veterinarios'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
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
    or: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => chain),
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  }
  return chain
}

describe('searchVeterinarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return veterinarios list', async () => {
    mockFrom.mockReturnValue(mockChain([
      { id: 'vet-1', nome: 'João', crmv: 'SP-123', especialidade: 'Clínica', ativo: true },
      { id: 'vet-2', nome: 'Maria', crmv: 'SP-456', especialidade: 'Cirurgia', ativo: true },
    ]))
    const result = await searchVeterinarios('', '')
    expect(result).toHaveLength(2)
    expect(result[0].nome).toBe('João')
    expect(result[1].especialidade).toBe('Cirurgia')
  })

  it('should filter by query', async () => {
    mockFrom.mockReturnValue(mockChain([]))
    await searchVeterinarios('João', '')
    expect(mockFrom).toHaveBeenCalledWith('veterinarios')
  })

  it('should filter by unidade', async () => {
    mockFrom.mockReturnValue(mockChain([]))
    await searchVeterinarios('', 'Unidade Central')
    expect(mockFrom).toHaveBeenCalledWith('veterinarios')
  })

  it('should return empty on error', async () => {
    const promise = Promise.resolve({ data: null, error: new Error('Err') })
    const errChain = {
      select: vi.fn(() => errChain), eq: vi.fn(() => errChain), or: vi.fn(() => errChain),
      order: vi.fn(() => errChain), limit: vi.fn(() => errChain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(errChain)
    const result = await searchVeterinarios('', '')
    expect(result).toEqual([])
  })
})

describe('getVeterinario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return single veterinario', async () => {
    mockFrom.mockReturnValue(mockChain({ id: 'vet-1', nome: 'João', crmv: 'SP-123', ativo: true }))
    const result = await getVeterinario('vet-1')
    expect(result).not.toBeNull()
    expect(result!.nome).toBe('João')
  })

  it('should return null on error', async () => {
    const promise = Promise.resolve({ data: null, error: new Error('Err') })
    const chain = {
      select: vi.fn(() => chain), eq: vi.fn(() => chain), single: vi.fn(() => chain),
      then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise),
    }
    mockFrom.mockReturnValue(chain)
    const result = await getVeterinario('vet-1')
    expect(result).toBeNull()
  })
})

describe('createVeterinario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create veterinario', async () => {
    mockFrom.mockReturnValue(mockChain())
    const result = await createVeterinario({
      id: '', nome: 'Dr. Teste', crmv: 'SP-789', especialidade: 'Oftalmologia',
      telefone: '11999999999', email: 'teste@vet.com', ativo: true,
    })
    expect(result.nome).toBe('Dr. Teste')
    expect(result.crmv).toBe('SP-789')
  })

  it('should handle insert error', async () => {
    const promise = Promise.resolve({ error: new Error('Insert failed') })
    const chain = { insert: vi.fn(() => chain), then: promise.then.bind(promise), catch: promise.catch.bind(promise), finally: promise.finally.bind(promise) }
    mockFrom.mockReturnValue(chain)
    const result = await createVeterinario({
      id: '', nome: 'Dr. Teste', ativo: true,
    })
    expect(result.nome).toBe('Dr. Teste')
  })
})

describe('updateVeterinario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update veterinario', async () => {
    mockFrom.mockReturnValue(mockChain())
    await expect(
      updateVeterinario('vet-1', { especialidade: 'Dermatologia' })
    ).resolves.not.toThrow()
  })
})

describe('deleteVeterinario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should soft delete veterinario', async () => {
    mockFrom.mockReturnValue(mockChain({ id: 'vet-1' }))
    await expect(deleteVeterinario('vet-1')).resolves.not.toThrow()
  })
})
