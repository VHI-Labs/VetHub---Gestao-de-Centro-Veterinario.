import type { Pet, UserProfile, VideoMetadata, CallHistoryItem, Species, TvVideo } from '../types'
import { supabase } from '../lib/supabase'

export const CALL_DISPLAY_MS = 10000

function formatPetForDb(p: Pet): Record<string, unknown> {
  return {
    id: p.id, senha: p.senha, especie: p.especie,
    tipo_atendimento: p.tipoAtendimento, prioridade: p.prioridade,
    status: p.status, local_direcionado: p.localDirecionado,
    data_hora: p.dataHora, called_at: p.calledAt || null,
    finalized_at: p.finalizedAt || null,
    unidade: p.unidade || ''
  }
}

function formatDbToPet(row: Record<string, unknown>): Pet {
  return {
    id: row.id as string, senha: row.senha as string, especie: row.especie as Species,
    tipoAtendimento: (row.tipo_atendimento as string) || '',
    prioridade: (row.prioridade as Pet['prioridade']) || 'Verde',
    status: (row.status as string) || 'Aguardando direcionamento',
    localDirecionado: (row.local_direcionado as string) || '',
    dataHora: (row.data_hora as string) || new Date().toISOString(),
    calledAt: (row.called_at as string) || undefined,
    finalizedAt: (row.finalized_at as string) || undefined,
    unidade: (row.unidade as string) || ''
  }
}

function getSpeciesEspecie(species: Species): string {
  return species
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

export const priorityLabels: Record<string, string> = {
  Verde: 'Geral', Amarelo: 'Preferencial', Vermelho: 'Emergências'
}

export function formatRiskLabel(priority: string): string {
  return priorityLabels[priority] || priority || 'Geral'
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function isYoutubeShort(url: string): boolean {
  return /youtube\.com\/shorts\//.test(url)
}

export function buildYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&controls=0&rel=0`
}

export function getNextWaitingPet(pets: Pet[]): Pet | null {
  const waiting = pets
    .filter(p => p.status === "Aguardando direcionamento")
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
  return waiting.length > 0 ? waiting[0] : null
}

async function migrateLocalStorage(): Promise<void> {
  const migrated = localStorage.getItem('hovet_supabase_migrated')
  if (migrated) return

  const keys = [
    'hovet_queue_dogs', 'hovet_queue_cats', 'hovet_queue_wild',
    'hovet_history', 'hovet_called_dog', 'hovet_called_cat', 'hovet_called_wild'
  ]

  let hasData = false
  const allPets: Record<string, unknown>[] = []

  for (const key of keys) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      const data = JSON.parse(raw)
      if (Array.isArray(data)) {
        for (const pet of data) {
          allPets.push(formatPetForDb(pet as Pet))
          hasData = true
        }
      } else if (data && data.id) {
        allPets.push(formatPetForDb(data as Pet))
        hasData = true
      }
    } catch { /* ignore */ }
  }

  if (hasData) {
    const { count } = await supabase.from('pets').select('count', { count: 'exact', head: true })
    if (!count || count === 0) {
      await supabase.from('pets').insert(allPets)
    }
  }

  localStorage.setItem('hovet_supabase_migrated', '1')
}

export async function initDatabase(): Promise<void> {
  await migrateLocalStorage()
}

export async function getQueue(species: Species, unidade = ''): Promise<Pet[]> {
  let query = supabase
    .from('pets')
    .select('*')
    .eq('especie', getSpeciesEspecie(species))
    .neq('status', 'Finalizado')

  if (unidade && unidade !== "Todos") query = query.eq('unidade', unidade)

  const { data, error } = await query.order('data_hora', { ascending: true })

  if (error) {
    console.error('[Supabase] getQueue error:', error)
    return []
  }
  return (data || []).map(formatDbToPet)
}

export async function getHistory(unidade = ''): Promise<Pet[]> {
  let query = supabase
    .from('pets')
    .select('*')
    .eq('status', 'Finalizado')

  if (unidade && unidade !== "Todos") query = query.eq('unidade', unidade)

  const { data, error } = await query.order('data_hora', { ascending: false })

  if (error) {
    console.error('[Supabase] getHistory error:', error)
    return []
  }
  return (data || []).map(formatDbToPet)
}

export async function saveHistory(history: Pet[]): Promise<void> {
  for (const pet of history) {
    const { error } = await supabase
      .from('pets')
      .upsert(formatPetForDb(pet), { onConflict: 'id' })
    if (error) console.error('[Supabase] saveHistory error:', error)
  }
}

export async function getMonthlyReport(year: number, month: number, unidade = ''): Promise<Pet[]> {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const end = month === 11
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 2).padStart(2, '0')}-01`

  let query = supabase
    .from('pets')
    .select('*')
    .gte('data_hora', start)
    .lt('data_hora', end)

  if (unidade && unidade !== "Todos") query = query.eq('unidade', unidade)

  const { data, error } = await query.order('data_hora', { ascending: true })

  if (error) {
    console.error('[Supabase] getMonthlyReport error:', error)
    return []
  }
  return (data || []).map(formatDbToPet)
}

export async function getCallHistory(species: Species, unidade = ''): Promise<CallHistoryItem[]> {
  let query = supabase
    .from('call_history')
    .select('*')
    .eq('especie', getSpeciesEspecie(species))

  if (unidade && unidade !== "Todos") query = query.eq('unidade', unidade)

  const { data, error } = await query.order('called_at', { ascending: false }).limit(6)

  if (error) {
    console.error('[Supabase] getCallHistory error:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id as string,
    senha: row.senha as string,
    localDirecionado: (row.local_direcionado as string) || '',
    calledAt: (row.called_at as string) || new Date().toISOString()
  }))
}

export async function addCallToHistory(species: Species, pet: Pet): Promise<void> {
  await supabase.from('call_history').delete().eq('pet_id', pet.id)

  const { error } = await supabase
    .from('call_history')
    .insert({
      id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pet_id: pet.id,
      senha: pet.senha,
      local_direcionado: pet.localDirecionado || 'Triagem',
      especie: getSpeciesEspecie(species),
      unidade: pet.unidade || '',
      called_at: pet.calledAt || new Date().toISOString()
    })

  if (error) console.error('[Supabase] addCallToHistory error:', error)
}

export async function getActiveCall(species: Species, unidade = ''): Promise<Pet | null> {
  let historyQuery = supabase
    .from('call_history')
    .select('pet_id')
    .eq('especie', getSpeciesEspecie(species))
    .order('called_at', { ascending: false })
    .limit(1)

  if (unidade && unidade !== "Todos") historyQuery = historyQuery.eq('unidade', unidade)

  const { data: historyData } = await historyQuery

  if (historyData && historyData.length > 0) {
    const petId = historyData[0].pet_id as string

    let petQuery = supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .in('status', ['Chamado', 'Direcionado'])

    if (unidade && unidade !== "Todos") petQuery = petQuery.eq('unidade', unidade)

    const { data, error } = await petQuery

    if (!error && data && data.length > 0) {
      return formatDbToPet(data[0])
    }

    return null
  }

  let query = supabase
    .from('pets')
    .select('*')
    .eq('especie', getSpeciesEspecie(species))
    .in('status', ['Chamado', 'Direcionado'])

  if (unidade && unidade !== "Todos") query = query.eq('unidade', unidade)

  const { data, error } = await query.order('called_at', { ascending: false }).limit(1)

  if (error) {
    console.error('[Supabase] getActiveCall error:', error)
    return null
  }
  return (data && data.length > 0) ? formatDbToPet(data[0]) : null
}

export async function updatePetStatus(id: string, species: Species, status: string, local = ''): Promise<void> {
  const updates: Record<string, unknown> = { status }
  if (local) updates.local_direcionado = local
  if (status === 'Chamado' || status === 'Direcionado') {
    updates.called_at = new Date().toISOString()
  }

  const { error, data } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    console.error('[Supabase] updatePetStatus error:', error)
    window.dispatchEvent(new CustomEvent('petActionError', { detail: `Erro ao atualizar: ${error.message}` }))
    return
  }

  if (status === 'Finalizado') {
    const { error: finalizeError } = await supabase
      .from('pets')
      .update({ finalized_at: new Date().toISOString() })
      .eq('id', id)
    if (finalizeError) {
      console.warn('[Supabase] finalized_at not saved (non-fatal):', finalizeError.message)
    }
  }

  if (status === 'Chamado' || status === 'Direcionado') {
    const pet = data && data.length > 0 ? formatDbToPet(data[0]) : null
    if (pet) {
      await addCallToHistory(species, { ...pet, calledAt: updates.called_at as string })
    }
  }

  window.dispatchEvent(new Event('storage'))
  window.dispatchEvent(new Event('storage-sync'))
  localStorage.setItem('hovet_last_update', Date.now().toString())
}

export async function reCallPet(id: string, local: string) {
  const { error, data } = await supabase
    .from('pets')
    .update({ called_at: new Date().toISOString(), local_direcionado: local })
    .eq('id', id)
    .select()

  if (error) {
    console.error('[Supabase] reCallPet error:', error)
    return
  }

  if (data && data.length > 0) {
    const pet = formatDbToPet(data[0])
    await addCallToHistory(pet.especie, { ...pet, calledAt: new Date().toISOString() })
  }

  window.dispatchEvent(new Event('storage'))
  window.dispatchEvent(new Event('storage-sync'))
}

export async function createTriagem(data: Record<string, string>, unidade = ''): Promise<Pet> {
  const species = data.especie as Species

  const isPronto = cleanText(data.tipoAtendimento) === 'Pronto Atendimento'
  const prefix = isPronto ? 'N' : 'A'

  const { data: allPets, error: petError } = await supabase
    .from('pets')
    .select('senha')
    .order('data_hora', { ascending: false })

  if (petError) {
    console.error('[Supabase] createTriagem count error:', petError)
  }

  const allSenhas = (allPets || []).map(r => r.senha as string).filter(Boolean)
  const countSameType = allSenhas.filter(s => {
    const sIsPronto = s.startsWith('N')
    return isPronto ? sIsPronto : !sIsPronto
  }).length

  const orderNumber = String(countSameType + 1).padStart(3, '0')
  const senha = `${prefix}${orderNumber}`

  const novaTriagem: Pet = {
    id: 'T-' + Date.now(),
    senha,
    especie: species,
    tipoAtendimento: cleanText(data.tipoAtendimento),
    prioridade: cleanText(data.prioridade, 'Verde') as Pet['prioridade'],
    status: 'Aguardando direcionamento',
    localDirecionado: '',
    dataHora: new Date().toISOString(),
    unidade
  }

  const { error: insertError } = await supabase
    .from('pets')
    .insert(formatPetForDb(novaTriagem))

  if (insertError) {
    console.error('[Supabase] createTriagem insert error:', insertError)
  }

  window.dispatchEvent(new Event('storage'))
  window.dispatchEvent(new Event('storage-sync'))

  return novaTriagem
}

export async function saveSelectedUnit(userId: string, unit: string, roles: string[] = ['Recepcao']): Promise<UserProfile> {
  const profile: UserProfile = {
    unidade: unit,
    funcoes: roles,
    atualizadoEm: new Date().toISOString()
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      unidade: unit,
      funcoes: roles,
      atualizado_em: profile.atualizadoEm
    }, { onConflict: 'id' })

  if (error) console.error('[Supabase] saveSelectedUnit error:', error)

  return profile
}

export async function getSelectedUnitProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    unidade: data.unidade as string,
    funcoes: (data.funcoes as string[]) || [],
    atualizadoEm: (data.atualizado_em as string) || new Date().toISOString()
  }
}

export async function getTvVideos(): Promise<TvVideo[]> {
  const { data, error } = await supabase
    .from('tv_videos')
    .select('*')
    .order('ordem', { ascending: true })

  if (error) {
    console.error('[Supabase] getTvVideos error:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id as string,
    youtubeUrl: row.youtube_url as string,
    ordem: row.ordem as number,
    isShort: row.is_short as boolean || isYoutubeShort(row.youtube_url as string)
  }))
}

export async function saveTvVideos(videos: TvVideo[]): Promise<void> {
  const rows = videos.map(v => ({
    id: v.id,
    youtube_url: v.youtubeUrl,
    ordem: v.ordem,
    is_short: v.isShort ?? isYoutubeShort(v.youtubeUrl)
  }))

  const { error } = await supabase.from('tv_videos').upsert(rows, { onConflict: 'id' })
  if (error) console.error('[Supabase] saveTvVideos error:', error)
  window.dispatchEvent(new Event('storage'))
}

export async function addTvVideo(youtubeUrl: string, isShort?: boolean): Promise<TvVideo | null> {
  const existing = await getTvVideos()
  const maxOrdem = existing.reduce((max, v) => Math.max(max, v.ordem), -1)

  const short = isShort ?? isYoutubeShort(youtubeUrl)
  const newVideo: TvVideo = {
    id: `tv-${Date.now()}`,
    youtubeUrl,
    ordem: maxOrdem + 1,
    isShort: short
  }

  const { error } = await supabase.from('tv_videos').insert({
    id: newVideo.id,
    youtube_url: newVideo.youtubeUrl,
    ordem: newVideo.ordem,
    is_short: short
  })

  if (error) {
    console.error('[Supabase] addTvVideo error:', error)
    return null
  }

  window.dispatchEvent(new Event('storage'))
  return newVideo
}

export async function removeTvVideo(id: string): Promise<void> {
  const { error } = await supabase.from('tv_videos').delete().eq('id', id)
  if (error) console.error('[Supabase] removeTvVideo error:', error)
  window.dispatchEvent(new Event('storage'))
}

export async function saveReceptionVideoUrl(url: string): Promise<void> {
  const { error } = await supabase
    .from('video_metadata')
    .upsert({
      id: 'reception_youtube_video',
      youtube_url: url,
      saved_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) console.error('[Supabase] saveReceptionVideoUrl error:', error)

  const data: VideoMetadata = { id: 'reception_youtube_video', youtubeUrl: url, savedAt: new Date().toISOString() }
  localStorage.setItem('hovet_reception_video', JSON.stringify(data))
  window.dispatchEvent(new Event('storage'))
}

export async function getReceptionVideoUrl(): Promise<string | null> {
  const local = localStorage.getItem('hovet_reception_video')
  if (local) {
    try {
      const parsed = JSON.parse(local) as VideoMetadata
      if (parsed.youtubeUrl) return parsed.youtubeUrl
    } catch { /* ignore */ }
  }

  const { data, error } = await supabase
    .from('video_metadata')
    .select('youtube_url')
    .eq('id', 'reception_youtube_video')
    .single()

  if (error || !data) return null
  return (data.youtube_url as string) || null
}
