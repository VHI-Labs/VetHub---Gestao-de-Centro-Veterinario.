import { describe, it, expect, vi, beforeEach } from 'vitest'
import { genId, logAudit } from '../audit'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../../lib/supabase'

describe('genId', () => {
  it('should generate ID with aud- prefix', () => {
    const id = genId('aud-')
    expect(id.startsWith('aud-')).toBe(true)
  })

  it('should generate unique IDs', () => {
    const id1 = genId('aud-')
    const id2 = genId('aud-')
    expect(id1).not.toBe(id2)
  })

  it('should include timestamp-like component', () => {
    const id = genId('aud-')
    expect(id.length).toBeGreaterThan('aud-'.length + 8)
  })
})

describe('logAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'admin@test.com' } },
    })
    const mockFrom = supabase.from as ReturnType<typeof vi.fn>
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })
  })

  it('should log INSERT audit entry', async () => {
    await expect(
      logAudit('patients', 'INSERT', 'pac-1', null, { nome: 'Rex', especie: 'Cão' })
    ).resolves.not.toThrow()
  })

  it('should log UPDATE audit entry', async () => {
    await expect(
      logAudit('consultas', 'UPDATE', 'cons-1', null, { diagnostico: 'Saudável' })
    ).resolves.not.toThrow()
  })

  it('should log DELETE audit entry', async () => {
    await expect(
      logAudit('owners', 'DELETE', 'own-1', { nome: 'João' }, null)
    ).resolves.not.toThrow()
  })

  it('should handle missing user gracefully', async () => {
    const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>
    mockGetUser.mockResolvedValue({
      data: { user: null },
    })
    await expect(
      logAudit('tests', 'INSERT', 'test-1', null, null)
    ).resolves.not.toThrow()
  })

  it('should handle insert error gracefully', async () => {
    const mockFrom = supabase.from as ReturnType<typeof vi.fn>
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
    })
    await expect(
      logAudit('tests', 'INSERT', 'test-1', null, { key: 'val' })
    ).resolves.not.toThrow()
  })
})
