import type { Servico, Fatura, FaturaItem, Pagamento } from '../types'
import { supabase } from '../lib/supabase'
import { genId } from './ehr'
import { logAudit } from './audit'

function formatServicoDbToTs(row: Record<string, unknown>): Servico {
  return {
    id: row.id as string,
    nome: (row.nome as string) || '',
    descricao: (row.descricao as string) || undefined,
    categoria: (row.categoria as string) || undefined,
    preco: (row.preco as number) || 0,
    ativo: row.ativo !== false,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString(),
    atualizadoEm: (row.atualizado_em as string) || new Date().toISOString()
  }
}

function formatFaturaDbToTs(row: Record<string, unknown>): Fatura {
  return {
    id: row.id as string,
    pacienteId: row.paciente_id as string,
    ownerId: (row.owner_id as string) || undefined,
    consultaId: (row.consulta_id as string) || undefined,
    cirurgiaId: (row.cirurgia_id as string) || undefined,
    status: (row.status as Fatura['status']) || 'Aberta',
    valorTotal: (row.valor_total as number) || 0,
    valorPago: (row.valor_pago as number) || 0,
    desconto: row.desconto != null ? Number(row.desconto) : undefined,
    observacoes: (row.observacoes as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString(),
    atualizadoEm: (row.atualizado_em as string) || new Date().toISOString()
  }
}

function formatFaturaItemDbToTs(row: Record<string, unknown>): FaturaItem {
  return {
    id: row.id as string,
    faturaId: row.fatura_id as string,
    servicoId: (row.servico_id as string) || undefined,
    descricao: (row.descricao as string) || '',
    quantidade: (row.quantidade as number) || 1,
    precoUnitario: (row.preco_unitario as number) || 0,
    subtotal: (row.subtotal as number) || 0,
    criadoEm: (row.criado_em as string) || new Date().toISOString()
  }
}

function formatPagamentoDbToTs(row: Record<string, unknown>): Pagamento {
  return {
    id: row.id as string,
    faturaId: row.fatura_id as string,
    valor: (row.valor as number) || 0,
    metodo: (row.metodo as Pagamento['metodo']) || 'Dinheiro',
    dataPagamento: (row.data_pagamento as string) || new Date().toISOString(),
    referencia: (row.referencia as string) || undefined,
    usuarioId: (row.usuario_id as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString()
  }
}

// SERVICOS
export async function searchServicos(query: string, unidade = ''): Promise<Servico[]> {
  let q = supabase.from('servicos').select('*').eq('ativo', true)
  if (query.trim()) q = q.or(`nome.ilike.%${query}%,categoria.ilike.%${query}%`)
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  const { data, error } = await q.order('nome', { ascending: true }).limit(200)
  if (error) { console.error('[FIN] searchServicos error:', error); return [] }
  return (data || []).map(formatServicoDbToTs)
}

export async function createServico(data: Omit<Servico, 'criadoEm' | 'atualizadoEm'>): Promise<Servico> {
  const now = new Date().toISOString()
  const row = { id: data.id || genId('srv'), nome: data.nome, descricao: data.descricao || null, categoria: data.categoria || null, preco: data.preco, ativo: true, unidade: data.unidade || '', criado_em: now, atualizado_em: now }
  const { error } = await supabase.from('servicos').insert(row)
  if (error) console.error('[FIN] createServico error:', error)
  await logAudit('servicos', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now, atualizadoEm: now }
}

export async function updateServico(id: string, data: Partial<Servico>): Promise<void> {
  const updates: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (data.nome !== undefined) updates.nome = data.nome
  if (data.descricao !== undefined) updates.descricao = data.descricao || null
  if (data.categoria !== undefined) updates.categoria = data.categoria || null
  if (data.preco !== undefined) updates.preco = data.preco
  const { error } = await supabase.from('servicos').update(updates).eq('id', id)
  if (error) console.error('[FIN] updateServico error:', error)
  await logAudit('servicos', 'UPDATE', id, null, updates)
}

export async function deleteServico(id: string): Promise<void> {
  const { data: old } = await supabase.from('servicos').select('*').eq('id', id).single()
  const { error } = await supabase.from('servicos').update({ ativo: false }).eq('id', id)
  if (error) console.error('[FIN] deleteServico error:', error)
  await logAudit('servicos', 'DELETE', id, old || undefined, null)
}

// FATURAS
export async function getFaturas(unidade = '', status?: string): Promise<Fatura[]> {
  let q = supabase.from('faturas').select('*')
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  if (status) q = q.eq('status', status)
  const { data, error } = await q.order('criado_em', { ascending: false }).limit(200)
  if (error) { console.error('[FIN] getFaturas error:', error); return [] }
  return (data || []).map(formatFaturaDbToTs)
}

export async function getFatura(id: string): Promise<Fatura | null> {
  const { data, error } = await supabase.from('faturas').select('*').eq('id', id).single()
  if (error || !data) return null
  return formatFaturaDbToTs(data)
}

export async function createFatura(data: Omit<Fatura, 'criadoEm' | 'atualizadoEm'>): Promise<Fatura> {
  const now = new Date().toISOString()
  const row = { id: data.id || genId('fat'), paciente_id: data.pacienteId, owner_id: data.ownerId || null, consulta_id: data.consultaId || null, cirurgia_id: data.cirurgiaId || null, status: data.status || 'Aberta', valor_total: data.valorTotal || 0, valor_pago: data.valorPago || 0, desconto: data.desconto ?? null, observacoes: data.observacoes || null, unidade: data.unidade || '', criado_em: now, atualizado_em: now }
  const { error } = await supabase.from('faturas').insert(row)
  if (error) console.error('[FIN] createFatura error:', error)
  await logAudit('faturas', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now, atualizadoEm: now }
}

export async function updateFatura(id: string, data: Partial<Fatura>): Promise<void> {
  const updates: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (data.status !== undefined) updates.status = data.status
  if (data.valorTotal !== undefined) updates.valor_total = data.valorTotal
  if (data.valorPago !== undefined) updates.valor_pago = data.valorPago
  if (data.desconto !== undefined) updates.desconto = data.desconto ?? null
  if (data.observacoes !== undefined) updates.observacoes = data.observacoes || null
  const { error } = await supabase.from('faturas').update(updates).eq('id', id)
  if (error) console.error('[FIN] updateFatura error:', error)
  await logAudit('faturas', 'UPDATE', id, null, updates)
}

export async function deleteFatura(id: string): Promise<void> {
  const { data: old } = await supabase.from('faturas').select('*').eq('id', id).single()
  const { error } = await supabase.from('faturas').delete().eq('id', id)
  if (error) console.error('[FIN] deleteFatura error:', error)
  await logAudit('faturas', 'DELETE', id, old || undefined, null)
}

// FATURA ITENS
export async function getItensByFatura(faturaId: string): Promise<FaturaItem[]> {
  const { data, error } = await supabase.from('fatura_itens').select('*').eq('fatura_id', faturaId).order('criado_em')
  if (error) { console.error('[FIN] getItensByFatura error:', error); return [] }
  return (data || []).map(formatFaturaItemDbToTs)
}

export async function addFaturaItem(data: Omit<FaturaItem, 'id' | 'criadoEm'>): Promise<FaturaItem> {
  const now = new Date().toISOString()
  const row = { id: genId('fi'), fatura_id: data.faturaId, servico_id: data.servicoId || null, descricao: data.descricao, quantidade: data.quantidade, preco_unitario: data.precoUnitario, subtotal: data.subtotal, criado_em: now }
  const { error } = await supabase.from('fatura_itens').insert(row)
  if (error) console.error('[FIN] addFaturaItem error:', error)
  return { ...data, id: row.id, criadoEm: now }
}

export async function removeFaturaItem(id: string): Promise<void> {
  const { error } = await supabase.from('fatura_itens').delete().eq('id', id)
  if (error) console.error('[FIN] removeFaturaItem error:', error)
}

// PAGAMENTOS
export async function getPagamentosByFatura(faturaId: string): Promise<Pagamento[]> {
  const { data, error } = await supabase.from('pagamentos').select('*').eq('fatura_id', faturaId).order('data_pagamento', { ascending: false })
  if (error) { console.error('[FIN] getPagamentosByFatura error:', error); return [] }
  return (data || []).map(formatPagamentoDbToTs)
}

export async function addPagamento(data: Omit<Pagamento, 'id' | 'criadoEm'>): Promise<Pagamento> {
  const now = new Date().toISOString()
  const row = { id: genId('pgt'), fatura_id: data.faturaId, valor: data.valor, metodo: data.metodo, data_pagamento: data.dataPagamento || now, referencia: data.referencia || null, usuario_id: data.usuarioId || null, unidade: data.unidade || '', criado_em: now }
  const { error } = await supabase.from('pagamentos').insert(row)
  if (error) console.error('[FIN] addPagamento error:', error)

  const { data: fatura } = await supabase.from('faturas').select('valor_pago, valor_total').eq('id', data.faturaId).single()
  if (fatura) {
    const newPago = (fatura.valor_pago as number || 0) + data.valor
    const status = newPago >= (fatura.valor_total as number || 0) ? 'Paga' : 'Parcial'
    await supabase.from('faturas').update({ valor_pago: newPago, status, atualizado_em: now }).eq('id', data.faturaId)
  }

  await logAudit('pagamentos', 'INSERT', row.id, null, row)
  return { ...data, id: row.id, criadoEm: now }
}

// REPORTS
export async function getFinanceiroDashboard(unidade = ''): Promise<{ totalReceita: number; totalAberto: number; faturasAbertas: number; faturasPagas: number; pagamentosRecentes: Pagamento[] }> {
  let faturasQ = supabase.from('faturas').select('status, valor_total, valor_pago')
  if (unidade && unidade !== 'Todos') faturasQ = faturasQ.eq('unidade', unidade)
  const { data: faturas } = await faturasQ

  let pagsQ = supabase.from('pagamentos').select('*')
  if (unidade && unidade !== 'Todos') pagsQ = pagsQ.eq('unidade', unidade)
  const { data: pags } = await pagsQ.order('data_pagamento', { ascending: false }).limit(20)

  const rows = (faturas || []) as Record<string, unknown>[]
  const totalReceita = rows.filter(r => r.status === 'Paga').reduce((acc, r) => acc + (r.valor_pago as number || 0), 0)
  const totalAberto = rows.filter(r => r.status === 'Aberta' || r.status === 'Parcial').reduce((acc, r) => acc + ((r.valor_total as number || 0) - (r.valor_pago as number || 0)), 0)
  const faturasAbertas = rows.filter(r => r.status === 'Aberta' || r.status === 'Parcial').length
  const faturasPagas = rows.filter(r => r.status === 'Paga').length

  return { totalReceita, totalAberto, faturasAbertas, faturasPagas, pagamentosRecentes: (pags || []).map(formatPagamentoDbToTs) }
}

export async function getFechamentoCaixa(data: string, unidade = ''): Promise<{ metodo: string; total: number }[]> {
  const start = data + 'T00:00:00'
  const end = data + 'T23:59:59'
  let q = supabase.from('pagamentos').select('metodo, valor').gte('data_pagamento', start).lte('data_pagamento', end)
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  const { data: pags } = await q
  const map = new Map<string, number>()
  for (const p of (pags || [])) {
    const r = p as Record<string, unknown>
    const m = r.metodo as string
    map.set(m, (map.get(m) || 0) + (r.valor as number))
  }
  return Array.from(map.entries()).map(([metodo, total]) => ({ metodo, total }))
}
