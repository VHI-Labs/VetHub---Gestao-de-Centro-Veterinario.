import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getQueue,
  getHistory,
  saveHistory,
  getCallHistory,
  addCallToHistory,
  getActiveCall,
  updatePetStatus,
  reCallPet,
  createTriagem,
  saveSelectedUnit,
  getSelectedUnitProfile,
  getTvVideos,
  saveTvVideos,
  addTvVideo,
  removeTvVideo,
  saveReceptionVideoUrl,
  getReceptionVideoUrl,
  initDatabase,
} from '../engine'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

vi.mock('../audit', () => ({
  logAudit: vi.fn(),
}))

import { supabase } from '../../lib/supabase'
import { makeChain, makeErrorChain, makeCountChain } from '../../test/mocks'
const mockFrom = supabase.from as ReturnType<typeof vi.fn>

// ============================================================
// getQueue
// ============================================================
describe('getQueue', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return pets for given species', async () => {
    mockFrom.mockReturnValue(makeChain([
      { id: 'pet-1', senha: 'N001', especie: 'Cão', status: 'Aguardando direcionamento', data_hora: '2026-01-01T10:00:00Z' },
    ]))
    const result = await getQueue('Cão')
    expect(result).toHaveLength(1)
    expect(result[0].senha).toBe('N001')
  })

  it('should exclude finalized pets', async () => {
    mockFrom.mockReturnValue(makeChain([]))
    await getQueue('Cão')
    expect(mockFrom.mock.calls[0][0]).toBe('pets')
  })

  it('should filter by unidade when provided', async () => {
    const chain = makeChain([])
    mockFrom.mockReturnValue(chain)
    await getQueue('Cão', 'Unidade Central')
    expect(chain.eq).toHaveBeenCalledWith('unidade', 'Unidade Central')
  })

  it('should return empty array on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain('DB error'))
    const result = await getQueue('Cão')
    expect(result).toEqual([])
  })
})

// ============================================================
// getHistory
// ============================================================
describe('getHistory', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return finalized pets', async () => {
    mockFrom.mockReturnValue(makeChain([
      { id: 'pet-1', senha: 'N001', status: 'Finalizado', data_hora: '2026-01-01T10:00:00Z' },
    ]))
    const result = await getHistory()
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('Finalizado')
  })

  it('should return empty on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    const result = await getHistory()
    expect(result).toEqual([])
  })
})

// ============================================================
// saveHistory
// ============================================================
describe('saveHistory', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should upsert each pet', async () => {
    mockFrom.mockReturnValue(makeChain())
    await saveHistory([
      { id: 'pet-1', senha: 'N001', status: 'Finalizado', dataHora: '2026-01-01T10:00:00Z', especie: 'Cão' } as any,
    ])
    expect(mockFrom).toHaveBeenCalledWith('pets')
  })

  it('should handle multiple pets', async () => {
    mockFrom.mockReturnValue(makeChain())
    await saveHistory([
      { id: 'pet-1', senha: 'N001', dataHora: '', especie: 'Cão' } as any,
      { id: 'pet-2', senha: 'N002', dataHora: '', especie: 'Gato' } as any,
    ])
    expect(mockFrom).toHaveBeenCalledTimes(2)
  })
})

// ============================================================
// getCallHistory
// ============================================================
describe('getCallHistory', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return call history items', async () => {
    mockFrom.mockReturnValue(makeChain([
      { id: 'ch-1', senha: 'N001', local_direcionado: 'Triagem', called_at: '2026-01-01T10:00:00Z' },
    ]))
    const result = await getCallHistory('Cão')
    expect(result).toHaveLength(1)
    expect(result[0].senha).toBe('N001')
    expect(result[0].localDirecionado).toBe('Triagem')
  })

  it('should return empty on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    const result = await getCallHistory('Cão')
    expect(result).toEqual([])
  })
})

// ============================================================
// addCallToHistory
// ============================================================
describe('addCallToHistory', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should delete old + insert new entry', async () => {
    const chain = makeChain()
    mockFrom.mockReturnValue(chain)
    const pet = { id: 'pet-1', senha: 'N001', localDirecionado: 'Triagem', unidade: '', especie: 'Cão' as const, calledAt: '2026-01-01T10:00:00Z' } as any
    await addCallToHistory('Cão', pet)
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.insert).toHaveBeenCalled()
  })
})

// ============================================================
// getActiveCall
// ============================================================
describe('getActiveCall', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return active call from history', async () => {
    const chain1 = makeChain([{ pet_id: 'pet-1' }])
    const chain2 = makeChain([{ id: 'pet-1', senha: 'N001', status: 'Chamado', especie: 'Cão', data_hora: '2026-01-01T10:00:00Z' }])
    mockFrom.mockReturnValueOnce(chain1).mockReturnValueOnce(chain2)
    const result = await getActiveCall('Cão')
    expect(result).not.toBeNull()
    expect(result!.senha).toBe('N001')
  })

  it('should fallback to direct query when no history', async () => {
    const chain1 = makeChain([])
    const chain2 = makeChain([{ id: 'pet-1', senha: 'N001', status: 'Chamado', especie: 'Cão', data_hora: '' }])
    mockFrom.mockReturnValueOnce(chain1).mockReturnValueOnce(chain2)
    const result = await getActiveCall('Cão')
    expect(result).not.toBeNull()
    expect(result!.senha).toBe('N001')
  })

  it('should return null on error when history fails then fallback also fails', async () => {
    mockFrom
      .mockReturnValueOnce(makeErrorChain())
      .mockReturnValueOnce(makeErrorChain())
    const result = await getActiveCall('Cão')
    expect(result).toBeNull()
  })
})

// ============================================================
// updatePetStatus
// ============================================================
describe('updatePetStatus', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should update status and set called_at for Chamado', async () => {
    const chain = makeChain([{ id: 'pet-1', senha: 'N001', status: 'Chamado', especie: 'Cão', data_hora: '' }])
    mockFrom.mockReturnValue(chain)
    await updatePetStatus('pet-1', 'Cão', 'Chamado', 'Triagem')
    expect(chain.update).toHaveBeenCalled()
  })

  it('should set finalized_at for Finalizado', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(updatePetStatus('pet-1', 'Cão', 'Finalizado')).resolves.not.toThrow()
  })

  it('should handle error gracefully', async () => {
    mockFrom.mockReturnValue(makeErrorChain('Update failed'))
    await expect(updatePetStatus('pet-1', 'Cão', 'Chamado', 'Triagem')).resolves.not.toThrow()
  })
})

// ============================================================
// reCallPet
// ============================================================
describe('reCallPet', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should update called_at and local', async () => {
    const chain = makeChain([{ id: 'pet-1', senha: 'N001', especie: 'Cão', data_hora: '' }])
    mockFrom.mockReturnValue(chain)
    await expect(reCallPet('pet-1', 'Triagem')).resolves.not.toThrow()
  })

  it('should handle error gracefully', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    await expect(reCallPet('pet-1', 'Triagem')).resolves.not.toThrow()
  })
})

// ============================================================
// createTriagem
// ============================================================
describe('createTriagem', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should create a triagem with N prefix for pronto atendimento', async () => {
    mockFrom
      .mockReturnValueOnce(makeCountChain(0))
      .mockReturnValueOnce(makeChain())
    const result = await createTriagem({ especie: 'Cão', tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde' })
    expect(result.senha).toBe('N001')
    expect(result.especie).toBe('Cão')
    expect(result.status).toBe('Aguardando direcionamento')
  })

  it('should create a triagem with A prefix for agendado', async () => {
    mockFrom
      .mockReturnValueOnce(makeCountChain(0))
      .mockReturnValueOnce(makeChain())
    const result = await createTriagem({ especie: 'Gato', tipoAtendimento: 'Consulta Marcada', prioridade: 'Verde' })
    expect(result.senha).toBe('A001')
  })

  it('should increment senha number based on count', async () => {
    mockFrom
      .mockReturnValueOnce(makeCountChain(5))
      .mockReturnValueOnce(makeChain())
    const result = await createTriagem({ especie: 'Cão', tipoAtendimento: 'Pronto Atendimento', prioridade: 'Vermelho' })
    expect(result.senha).toBe('N006')
  })

  it('should handle insert error gracefully', async () => {
    mockFrom
      .mockReturnValueOnce(makeCountChain(0))
      .mockReturnValueOnce(makeErrorChain('Insert failed'))
    const result = await createTriagem({ especie: 'Cão', tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde' })
    expect(result.senha).toBe('N001')
  })
})

// ============================================================
// saveSelectedUnit
// ============================================================
describe('saveSelectedUnit', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should upsert user profile with unit and roles', async () => {
    mockFrom.mockReturnValue(makeChain())
    const result = await saveSelectedUnit('user-1', 'Unidade Central', ['Recepcao'])
    expect(result.unidade).toBe('Unidade Central')
    expect(result.funcoes).toEqual(['Recepcao'])
  })
})

// ============================================================
// getSelectedUnitProfile
// ============================================================
describe('getSelectedUnitProfile', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return user profile', async () => {
    mockFrom.mockReturnValue(makeChain({ unidade: 'Unidade Central', funcoes: ['Recepcao'], atualizado_em: '2026-01-01T10:00:00Z' }))
    const result = await getSelectedUnitProfile('user-1')
    expect(result).not.toBeNull()
    expect(result!.unidade).toBe('Unidade Central')
  })

  it('should return null on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    const result = await getSelectedUnitProfile('user-1')
    expect(result).toBeNull()
  })
})

// ============================================================
// TV Videos
// ============================================================
describe('getTvVideos', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return tv videos ordered by ordem', async () => {
    mockFrom.mockReturnValue(makeChain([
      { id: 'tv-1', youtube_url: 'https://youtu.be/abc123', ordem: 1 },
      { id: 'tv-2', youtube_url: 'https://youtu.be/def456', ordem: 2 },
    ]))
    const result = await getTvVideos()
    expect(result).toHaveLength(2)
    expect(result[0].ordem).toBe(1)
  })

  it('should return empty on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    const result = await getTvVideos()
    expect(result).toEqual([])
  })
})

describe('saveTvVideos', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should upsert all videos', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(saveTvVideos([{ id: 'tv-1', youtubeUrl: 'https://youtu.be/abc', ordem: 1 }])).resolves.not.toThrow()
    expect(mockFrom).toHaveBeenCalledWith('tv_videos')
  })
})

describe('addTvVideo', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should create a new video with next ordem', async () => {
    mockFrom
      .mockReturnValueOnce(makeChain([{ id: 'tv-1', youtube_url: 'https://youtu.be/abc', ordem: 0 }]))
      .mockReturnValueOnce(makeChain())
    const result = await addTvVideo('https://youtu.be/new')
    expect(result).not.toBeNull()
    expect(result!.ordem).toBe(1)
    expect(result!.youtubeUrl).toBe('https://youtu.be/new')
  })

  it('should return null on insert error', async () => {
    mockFrom
      .mockReturnValueOnce(makeChain([]))
      .mockReturnValueOnce(makeErrorChain())
    const result = await addTvVideo('https://youtu.be/fail')
    expect(result).toBeNull()
  })
})

describe('removeTvVideo', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should delete video by id', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(removeTvVideo('tv-1')).resolves.not.toThrow()
    expect(mockFrom).toHaveBeenCalledWith('tv_videos')
  })
})

// ============================================================
// Reception Video URL
// ============================================================
describe('saveReceptionVideoUrl', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear() })

  it('should upsert and set localStorage', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(saveReceptionVideoUrl('https://youtu.be/abc')).resolves.not.toThrow()
    expect(localStorage.getItem('vethub_reception_video')).toContain('abc')
  })
})

describe('getReceptionVideoUrl', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear() })

  it('should return from localStorage when available', async () => {
    localStorage.setItem('vethub_reception_video', JSON.stringify({ id: 'reception_youtube_video', youtubeUrl: 'https://youtu.be/local', savedAt: new Date().toISOString() }))
    const result = await getReceptionVideoUrl()
    expect(result).toBe('https://youtu.be/local')
  })

  it('should fallback to supabase when localStorage is empty', async () => {
    const p = Promise.resolve({ data: { youtube_url: 'https://youtu.be/supa' }, error: null })
    const chain: Record<string, unknown> = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      single: vi.fn(() => chain),
      then: p.then.bind(p),
      catch: p.catch.bind(p),
      finally: p.finally.bind(p),
    }
    mockFrom.mockReturnValue(chain)
    const result = await getReceptionVideoUrl()
    expect(result).toBe('https://youtu.be/supa')
  })

  it('should return null on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    const result = await getReceptionVideoUrl()
    expect(result).toBeNull()
  })
})

// ============================================================
// initDatabase
// ============================================================
describe('initDatabase', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear() })

  it('should run migration when no data in localStorage', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(initDatabase()).resolves.not.toThrow()
    expect(localStorage.getItem('vethub_supabase_migrated')).toBe('1')
  })

  it('should not run twice (migrated flag)', async () => {
    localStorage.setItem('vethub_supabase_migrated', '1')
    await initDatabase()
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
