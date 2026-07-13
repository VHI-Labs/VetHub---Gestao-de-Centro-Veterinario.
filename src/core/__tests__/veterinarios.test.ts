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
import { makeChain, makeErrorChain } from '../../test/mocks'
const mockFrom = supabase.from as ReturnType<typeof vi.fn>

describe('searchVeterinarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return veterinarios list', async () => {
    mockFrom.mockReturnValue(makeChain([
      { id: 'vet-1', nome: 'João', crmv: 'SP-123', especialidade: 'Clínica', ativo: true },
      { id: 'vet-2', nome: 'Maria', crmv: 'SP-456', especialidade: 'Cirurgia', ativo: true },
    ]))
    const result = await searchVeterinarios('', '')
    expect(result).toHaveLength(2)
    expect(result[0].nome).toBe('João')
    expect(result[1].especialidade).toBe('Cirurgia')
  })

  it('should filter by query', async () => {
    mockFrom.mockReturnValue(makeChain([]))
    await searchVeterinarios('João', '')
    expect(mockFrom).toHaveBeenCalledWith('veterinarios')
  })

  it('should filter by unidade', async () => {
    mockFrom.mockReturnValue(makeChain([]))
    await searchVeterinarios('', 'Unidade Central')
    expect(mockFrom).toHaveBeenCalledWith('veterinarios')
  })

  it('should return empty on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    const result = await searchVeterinarios('', '')
    expect(result).toEqual([])
  })
})

describe('getVeterinario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return single veterinario', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'vet-1', nome: 'João', crmv: 'SP-123', ativo: true }))
    const result = await getVeterinario('vet-1')
    expect(result).not.toBeNull()
    expect(result!.nome).toBe('João')
  })

  it('should return null on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    const result = await getVeterinario('vet-1')
    expect(result).toBeNull()
  })
})

describe('createVeterinario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create veterinario', async () => {
    mockFrom.mockReturnValue(makeChain())
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
    mockFrom.mockReturnValue(makeChain())
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
    mockFrom.mockReturnValue(makeChain({ id: 'vet-1' }))
    await expect(deleteVeterinario('vet-1')).resolves.not.toThrow()
  })
})
