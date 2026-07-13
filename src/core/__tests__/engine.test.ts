import { describe, it, expect, beforeEach } from 'vitest'
import {
  cleanText,
  getSpeciesLabel,
  formatRiskLabel,
  extractYoutubeId,
  buildYoutubeEmbedUrl,
  applyDashboardFilters,
  getNextWaitingPet,
} from '../engine'
import type { Pet } from '../../types'

describe('cleanText', () => {
  it('should trim whitespace', () => {
    expect(cleanText('  hello  ')).toBe('hello')
  })

  it('should return fallback for undefined', () => {
    expect(cleanText(undefined, 'N/A')).toBe('N/A')
  })

  it('should return fallback for null', () => {
    expect(cleanText(null, 'padrão')).toBe('padrão')
  })

  it('should convert numbers to string', () => {
    expect(cleanText(42)).toBe('42')
  })

  it('should return empty string for empty input (no fallback needed)', () => {
    expect(cleanText('')).toBe('')
  })

  it('should handle "undefined" string literal', () => {
    expect(cleanText('undefined', 'fallback')).toBe('fallback')
  })

  it('should use empty string as default fallback', () => {
    expect(cleanText(undefined)).toBe('')
  })
})

describe('getSpeciesLabel', () => {
  it('should return "Cão" for dog species', () => {
    expect(getSpeciesLabel('Cão')).toBe('Cão')
  })

  it('should return "Gato" for cat species', () => {
    expect(getSpeciesLabel('Gato')).toBe('Gato')
  })

  it('should return "Gato" for unknown species (default behavior)', () => {
    expect(getSpeciesLabel('Animais Silvestres')).toBe('Gato')
  })

  it('should return "Gato" for lowercase input (not exact match)', () => {
    expect(getSpeciesLabel('cão')).toBe('Gato')
  })
})

describe('formatRiskLabel', () => {
  it('should return "Emergências" for Vermelho', () => {
    expect(formatRiskLabel('Vermelho')).toBe('Emergências')
  })

  it('should return "Preferencial" for Amarelo', () => {
    expect(formatRiskLabel('Amarelo')).toBe('Preferencial')
  })

  it('should return "Geral" for Verde', () => {
    expect(formatRiskLabel('Verde')).toBe('Geral')
  })

  it('should return the input for unknown priority', () => {
    expect(formatRiskLabel('Azul')).toBe('Azul')
  })
})

describe('extractYoutubeId', () => {
  it('should extract ID from standard watch URL', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('should extract ID from short youtu.be URL', () => {
    expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('should extract ID from embed URL', () => {
    expect(extractYoutubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('should extract ID from URL with extra params', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s')).toBe('dQw4w9WgXcQ')
  })

  it('should return null for invalid URL', () => {
    expect(extractYoutubeId('not-a-url')).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(extractYoutubeId('')).toBeNull()
  })

  it('should return null for URL without video ID', () => {
    expect(extractYoutubeId('https://www.youtube.com/')).toBeNull()
  })
})

describe('buildYoutubeEmbedUrl', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return embed URL with autoplay and loop', () => {
    const url = buildYoutubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).toContain('dQw4w9WgXcQ')
    expect(url).toContain('autoplay=1')
    expect(url).toContain('loop=1')
  })

  it('should include playlist param equal to video ID', () => {
    const url = buildYoutubeEmbedUrl('abc123def45')
    expect(url).toContain('playlist=abc123def45')
  })

  it('should include muted by default when no localStorage value set', () => {
    const url = buildYoutubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).toContain('mute=1')
  })

  it('should not mute when localStorage vethub_video_muted is "false"', () => {
    localStorage.setItem('vethub_video_muted', 'false')
    const url = buildYoutubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).toContain('mute=0')
  })

  it('should have controls disabled', () => {
    const url = buildYoutubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).toContain('controls=0')
  })

  it('should have rel=0 and enablejsapi=1', () => {
    const url = buildYoutubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).toContain('rel=0')
    expect(url).toContain('enablejsapi=1')
  })
})

describe('applyDashboardFilters', () => {
  const basePets: Pet[] = [
    {
      id: '1', senha: 'N001', especie: 'Cão', tipoAtendimento: 'Pronto Atendimento',
      prioridade: 'Verde', status: 'Aguardando direcionamento', localDirecionado: '',
      dataHora: '2026-01-15T10:00:00Z'
    } as Pet,
    {
      id: '2', senha: 'N002', especie: 'Gato', tipoAtendimento: 'Consulta Marcada',
      prioridade: 'Amarelo', status: 'Aguardando direcionamento', localDirecionado: '',
      dataHora: '2026-03-20T14:30:00Z'
    } as Pet,
    {
      id: '3', senha: 'N003', especie: 'Cão', tipoAtendimento: 'Exames',
      prioridade: 'Vermelho', status: 'Aguardando direcionamento', localDirecionado: '',
      dataHora: '2026-06-10T09:00:00Z'
    } as Pet,
    {
      id: '4', senha: 'N004', especie: 'Gato', tipoAtendimento: 'Pronto Atendimento',
      prioridade: 'Verde', status: 'Finalizado', localDirecionado: '',
      dataHora: '2025-12-01T08:00:00Z'
    } as Pet,
  ]

  it('should return all items when all filters are "Todos"', () => {
    const result = applyDashboardFilters(basePets, {
      Species: 'Todos', Year: 'Todos', Month: 'Todos',
      Day: 'Todos', AttendanceType: 'Todos'
    })
    expect(result).toHaveLength(4)
  })

  it('should filter by species', () => {
    const result = applyDashboardFilters(basePets, {
      Species: 'Cão', Year: 'Todos', Month: 'Todos',
      Day: 'Todos', AttendanceType: 'Todos'
    })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.especie === 'Cão')).toBe(true)
  })

  it('should filter by year', () => {
    const result = applyDashboardFilters(basePets, {
      Species: 'Todos', Year: '2025', Month: 'Todos',
      Day: 'Todos', AttendanceType: 'Todos'
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('4')
  })

  it('should filter by month', () => {
    const result = applyDashboardFilters(basePets, {
      Species: 'Todos', Year: 'Todos', Month: 'Janeiro',
      Day: 'Todos', AttendanceType: 'Todos'
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('should filter by attendance type', () => {
    const result = applyDashboardFilters(basePets, {
      Species: 'Todos', Year: 'Todos', Month: 'Todos',
      Day: 'Todos', AttendanceType: 'Pronto Atendimento'
    })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.tipoAtendimento === 'Pronto Atendimento')).toBe(true)
  })

  it('should combine multiple filters', () => {
    const result = applyDashboardFilters(basePets, {
      Species: 'Cão', Year: '2026', Month: 'Todos',
      Day: 'Todos', AttendanceType: 'Pronto Atendimento'
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('should return empty array when no items match', () => {
    const result = applyDashboardFilters(basePets, {
      Species: 'Animais Silvestres', Year: 'Todos', Month: 'Todos',
      Day: 'Todos', AttendanceType: 'Todos'
    })
    expect(result).toHaveLength(0)
  })

  it('should handle day filter', () => {
    const result = applyDashboardFilters(basePets, {
      Species: 'Todos', Year: 'Todos', Month: 'Todos',
      Day: '15', AttendanceType: 'Todos'
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
})

describe('getNextWaitingPet', () => {
  it('should return null for empty array', () => {
    expect(getNextWaitingPet([])).toBeNull()
  })

  it('should return the only waiting pet', () => {
    const pets: Pet[] = [
      { senha: 'N001', status: 'Aguardando direcionamento', prioridade: 'Amarelo', dataHora: '2026-01-01T10:00:00Z' } as Pet,
    ]
    expect(getNextWaitingPet(pets)?.senha).toBe('N001')
  })

  it('should return null if no pet is waiting', () => {
    const pets: Pet[] = [
      { senha: 'N001', status: 'Em atendimento', prioridade: 'Amarelo', dataHora: '2026-01-01T10:00:00Z' } as Pet,
    ]
    expect(getNextWaitingPet(pets)).toBeNull()
  })

  it('should return the earliest waiting pet', () => {
    const pets: Pet[] = [
      { senha: 'N002', status: 'Aguardando direcionamento', prioridade: 'Verde', dataHora: '2026-01-01T11:00:00Z' } as Pet,
      { senha: 'N001', status: 'Aguardando direcionamento', prioridade: 'Amarelo', dataHora: '2026-01-01T10:00:00Z' } as Pet,
    ]
    expect(getNextWaitingPet(pets)?.senha).toBe('N001')
  })

  it('should pick earliest among multiple waiting pets', () => {
    const pets: Pet[] = [
      { senha: 'N003', status: 'Aguardando direcionamento', prioridade: 'Verde', dataHora: '2026-01-01T12:00:00Z' } as Pet,
      { senha: 'N001', status: 'Aguardando direcionamento', prioridade: 'Vermelho', dataHora: '2026-01-01T10:00:00Z' } as Pet,
      { senha: 'N002', status: 'Aguardando direcionamento', prioridade: 'Amarelo', dataHora: '2026-01-01T11:00:00Z' } as Pet,
    ]
    expect(getNextWaitingPet(pets)?.senha).toBe('N001')
  })
})
