import type { Veterinario } from '../types'
import { supabase } from '../lib/supabase'
import { genId } from './ehr'
import { logAudit } from './audit'

function formatDbToTs(row: Record<string, unknown>): Veterinario {
  return {
    id: row.id as string,
    nome: (row.nome as string) || '',
    crmv: (row.crmv as string) || undefined,
    especialidade: (row.especialidade as string) || undefined,
    telefone: (row.telefone as string) || undefined,
    email: (row.email as string) || undefined,
    ativo: row.ativo !== false,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString(),
    atualizadoEm: (row.atualizado_em as string) || new Date().toISOString()
  }
}

export async function searchVeterinarios(query: string, unidade = ''): Promise<Veterinario[]> {
  let q = supabase.from('veterinarios').select('*').eq('ativo', true)
  if (query.trim()) {
    q = q.or(`nome.ilike.%${query}%,especialidade.ilike.%${query}%,crmv.ilike.%${query}%`)
  }
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  const { data, error } = await q.order('nome', { ascending: true }).limit(100)
  if (error) { console.error('[VET] searchVeterinarios error:', error); return [] }
  return (data || []).map(formatDbToTs)
}

export async function getVeterinario(id: string): Promise<Veterinario | null> {
  const { data, error } = await supabase.from('veterinarios').select('*').eq('id', id).single()
  if (error || !data) return null
  return formatDbToTs(data)
}

export async function createVeterinario(data: Omit<Veterinario, 'criadoEm' | 'atualizadoEm'>): Promise<Veterinario> {
  const now = new Date().toISOString()
  const row = {
    id: data.id || genId('vet'),
    nome: data.nome,
    crmv: data.crmv || null,
    especialidade: data.especialidade || null,
    telefone: data.telefone || null,
    email: data.email || null,
    ativo: data.ativo !== false,
    unidade: data.unidade || '',
    criado_em: now,
    atualizado_em: now
  }
  const { error } = await supabase.from('veterinarios').insert(row)
  if (error) console.error('[VET] createVeterinario error:', error)
  await logAudit('veterinarios', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now, atualizadoEm: now }
}

export async function updateVeterinario(id: string, data: Partial<Veterinario>): Promise<void> {
  const updates: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (data.nome !== undefined) updates.nome = data.nome
  if (data.crmv !== undefined) updates.crmv = data.crmv || null
  if (data.especialidade !== undefined) updates.especialidade = data.especialidade || null
  if (data.telefone !== undefined) updates.telefone = data.telefone || null
  if (data.email !== undefined) updates.email = data.email || null
  if (data.ativo !== undefined) updates.ativo = data.ativo
  if (data.unidade !== undefined) updates.unidade = data.unidade || null
  const { error } = await supabase.from('veterinarios').update(updates).eq('id', id)
  if (error) console.error('[VET] updateVeterinario error:', error)
  await logAudit('veterinarios', 'UPDATE', id, null, updates)
}

export async function deleteVeterinario(id: string): Promise<void> {
  const { data: old } = await supabase.from('veterinarios').select('*').eq('id', id).single()
  const { error } = await supabase.from('veterinarios').update({ ativo: false }).eq('id', id)
  if (error) console.error('[VET] deleteVeterinario error:', error)
  await logAudit('veterinarios', 'DELETE', id, old || undefined, null)
}
