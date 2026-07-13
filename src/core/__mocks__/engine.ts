import { vi } from 'vitest'
import type { Pet } from '../../types'

export const CALL_DISPLAY_MS = 10000

export const priorityLabels: Record<string, string> = {
  Verde: 'Geral',
  Amarelo: 'Preferencial',
  Vermelho: 'Emergências',
}

export function cleanText(value: unknown, fallback = ''): string {
  if (value === undefined || value === null || value === 'undefined') return fallback
  return String(value).trim()
}

export function getSpeciesLabel(species: string): string {
  return species === 'Cão' ? 'Cão' : 'Gato'
}

export function applyDashboardFilters(items: Pet[], filters: Record<string, string>): Pet[] {
  const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  let filtered = [...items]
  if (filters.Species !== 'Todos') {
    filtered = filtered.filter(item => item.especie === filters.Species)
  }
  if (filters.Year !== 'Todos') {
    filtered = filtered.filter(item => new Date(item.dataHora).getFullYear() === parseInt(filters.Year))
  }
  if (filters.Month !== 'Todos') {
    const mesIndex = mesesNomes.indexOf(filters.Month)
    filtered = filtered.filter(item => new Date(item.dataHora).getMonth() === mesIndex)
  }
  if (filters.Day !== 'Todos') {
    filtered = filtered.filter(item => new Date(item.dataHora).getDate() === parseInt(filters.Day))
  }
  if (filters.AttendanceType !== 'Todos') {
    filtered = filtered.filter(item => item.tipoAtendimento === filters.AttendanceType)
  }
  return filtered
}

export function formatRiskLabel(priority: string): string {
  return priorityLabels[priority] || priority || 'Geral'
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function buildYoutubeEmbedUrl(videoId: string): string {
  const muted = localStorage.getItem('vethub_video_muted') !== 'false'
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=${muted ? 1 : 0}&controls=0&rel=0&enablejsapi=1`
}

export const getNextWaitingPet = vi.fn()

// Mocked async functions
export const getQueue = vi.fn()
export const getHistory = vi.fn()
export const saveHistory = vi.fn()
export const getMonthlyReport = vi.fn()
export const getCallHistory = vi.fn()
export const addCallToHistory = vi.fn()
export const getActiveCall = vi.fn()
export const updatePetStatus = vi.fn()
export const reCallPet = vi.fn()
export const createTriagem = vi.fn()
export const saveSelectedUnit = vi.fn()
export const getSelectedUnitProfile = vi.fn()
export const getTvVideos = vi.fn()
export const saveTvVideos = vi.fn()
export const addTvVideo = vi.fn()
export const removeTvVideo = vi.fn()
export const saveReceptionVideoUrl = vi.fn()
export const getReceptionVideoUrl = vi.fn()
export const initDatabase = vi.fn()
