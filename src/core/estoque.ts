import type { Medicamento, EstoqueMovimentacao } from '../types'
import { supabase } from '../lib/supabase'
import { genId } from './ehr'
import { logAudit } from './audit'

function formatMedicamentoDbToTs(row: Record<string, unknown>): Medicamento {
  return {
    id: row.id as string,
    nome: (row.nome as string) || '',
    principioAtivo: (row.principio_ativo as string) || undefined,
    fabricante: (row.fabricante as string) || undefined,
    formaFarmaceutica: (row.forma_farmaceutica as string) || undefined,
    concentracao: (row.concentracao as string) || undefined,
    unidadeMedida: (row.unidade_medida as string) || undefined,
    precoCusto: row.preco_custo != null ? Number(row.preco_custo) : undefined,
    precoVenda: row.preco_venda != null ? Number(row.preco_venda) : undefined,
    estoqueMinimo: (row.estoque_minimo as number) || 0,
    estoqueAtual: (row.estoque_atual as number) || 0,
    validade: (row.validade as string) || undefined,
    unidade: (row.unidade as string) || '',
    ativo: row.ativo !== false,
    criadoEm: (row.criado_em as string) || new Date().toISOString(),
    atualizadoEm: (row.atualizado_em as string) || new Date().toISOString()
  }
}

function formatMovimentacaoDbToTs(row: Record<string, unknown>): EstoqueMovimentacao {
  return {
    id: row.id as string,
    medicamentoId: row.medicamento_id as string,
    tipo: row.tipo as EstoqueMovimentacao['tipo'],
    quantidade: (row.quantidade as number) || 0,
    motivo: (row.motivo as string) || undefined,
    consultaId: (row.consulta_id as string) || undefined,
    pacienteId: (row.paciente_id as string) || undefined,
    veterinarioId: (row.veterinario_id as string) || undefined,
    usuarioId: (row.usuario_id as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString()
  }
}

export async function searchMedicamentos(query: string, unidade = ''): Promise<Medicamento[]> {
  let q = supabase.from('medicamentos').select('*')
  if (query.trim()) {
    q = q.or(`nome.ilike.%${query}%,principio_ativo.ilike.%${query}%,fabricante.ilike.%${query}%`)
  }
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  const { data, error } = await q.order('nome', { ascending: true }).limit(200)
  if (error) { console.error('[ESTOQUE] searchMedicamentos error:', error); return [] }
  return (data || []).map(formatMedicamentoDbToTs)
}

export async function getMedicamento(id: string): Promise<Medicamento | null> {
  const { data, error } = await supabase.from('medicamentos').select('*').eq('id', id).single()
  if (error || !data) return null
  return formatMedicamentoDbToTs(data)
}

export async function createMedicamento(data: Omit<Medicamento, 'criadoEm' | 'atualizadoEm'>): Promise<Medicamento> {
  const now = new Date().toISOString()
  const row = {
    id: data.id || genId('med'),
    nome: data.nome,
    principio_ativo: data.principioAtivo || null,
    fabricante: data.fabricante || null,
    forma_farmaceutica: data.formaFarmaceutica || null,
    concentracao: data.concentracao || null,
    unidade_medida: data.unidadeMedida || null,
    preco_custo: data.precoCusto ?? null,
    preco_venda: data.precoVenda ?? null,
    estoque_minimo: data.estoqueMinimo || 0,
    estoque_atual: data.estoqueAtual || 0,
    validade: data.validade || null,
    unidade: data.unidade || '',
    criado_em: now,
    atualizado_em: now
  }
  const { error } = await supabase.from('medicamentos').insert(row)
  if (error) console.error('[ESTOQUE] createMedicamento error:', error)
  await logAudit('medicamentos', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now, atualizadoEm: now }
}

export async function updateMedicamento(id: string, data: Partial<Medicamento>): Promise<void> {
  const updates: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (data.nome !== undefined) updates.nome = data.nome
  if (data.principioAtivo !== undefined) updates.principio_ativo = data.principioAtivo || null
  if (data.fabricante !== undefined) updates.fabricante = data.fabricante || null
  if (data.formaFarmaceutica !== undefined) updates.forma_farmaceutica = data.formaFarmaceutica || null
  if (data.concentracao !== undefined) updates.concentracao = data.concentracao || null
  if (data.unidadeMedida !== undefined) updates.unidade_medida = data.unidadeMedida || null
  if (data.precoCusto !== undefined) updates.preco_custo = data.precoCusto ?? null
  if (data.precoVenda !== undefined) updates.preco_venda = data.precoVenda ?? null
  if (data.estoqueMinimo !== undefined) updates.estoque_minimo = data.estoqueMinimo
  if (data.estoqueAtual !== undefined) updates.estoque_atual = data.estoqueAtual
  if (data.validade !== undefined) updates.validade = data.validade || null
  const { error } = await supabase.from('medicamentos').update(updates).eq('id', id)
  if (error) console.error('[ESTOQUE] updateMedicamento error:', error)
  await logAudit('medicamentos', 'UPDATE', id, null, updates)
}

export async function deleteMedicamento(id: string): Promise<void> {
  const { data: old } = await supabase.from('medicamentos').select('*').eq('id', id).single()
  const { error } = await supabase.from('medicamentos').delete().eq('id', id)
  if (error) console.error('[ESTOQUE] deleteMedicamento error:', error)
  await logAudit('medicamentos', 'DELETE', id, old || undefined, null)
}

export async function getMovimentacoes(medicamentoId: string): Promise<EstoqueMovimentacao[]> {
  const { data, error } = await supabase
    .from('estoque_movimentacoes').select('*')
    .eq('medicamento_id', medicamentoId)
    .order('criado_em', { ascending: false }).limit(100)
  if (error) { console.error('[ESTOQUE] getMovimentacoes error:', error); return [] }
  return (data || []).map(formatMovimentacaoDbToTs)
}

export async function createMovimentacao(data: Omit<EstoqueMovimentacao, 'id' | 'criadoEm'>): Promise<EstoqueMovimentacao> {
  const now = new Date().toISOString()
  const row = {
    id: genId('mov'),
    medicamento_id: data.medicamentoId,
    tipo: data.tipo,
    quantidade: data.quantidade,
    motivo: data.motivo || null,
    consulta_id: data.consultaId || null,
    paciente_id: data.pacienteId || null,
    veterinario_id: data.veterinarioId || null,
    usuario_id: data.usuarioId || null,
    unidade: data.unidade || '',
    criado_em: now
  }
  const { error } = await supabase.from('estoque_movimentacoes').insert(row)
  if (error) console.error('[ESTOQUE] createMovimentacao error:', error)

  const stockUpdate = data.tipo === 'Entrada' ? data.quantidade : -data.quantidade
  const { error: rpcError } = await supabase.rpc('increment_stock', { med_id: data.medicamentoId, delta: stockUpdate })
  if (rpcError) {
    const { data: med } = await supabase.from('medicamentos').select('estoque_atual').eq('id', data.medicamentoId).single()
    if (med) {
      const newStock = Math.max(0, (med.estoque_atual as number || 0) + stockUpdate)
      await supabase.from('medicamentos').update({ estoque_atual: newStock }).eq('id', data.medicamentoId)
    }
  }

  await logAudit('estoque_movimentacoes', 'INSERT', row.id, null, row)
  return { ...data, id: row.id, criadoEm: now }
}

export async function getEstoqueAlertas(unidade = ''): Promise<Medicamento[]> {
  let q = supabase.from('medicamentos').select('*')
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  const { data, error } = await q
  if (error) { console.error('[ESTOQUE] getEstoqueAlertas error:', error); return [] }
  const meds = (data || []).map(formatMedicamentoDbToTs)
  const hoje = new Date().toISOString().slice(0, 10)
  return meds.filter(m => m.estoqueAtual <= m.estoqueMinimo || (m.validade && m.validade <= hoje))
}

export async function getRelatorioConsumo(unidade = '', dataInicio?: string, dataFim?: string): Promise<{ medicamento: string; totalSaidas: number }[]> {
  let q = supabase.from('estoque_movimentacoes').select('medicamento_id, quantidade').eq('tipo', 'Saida')
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  if (dataInicio) q = q.gte('criado_em', dataInicio)
  if (dataFim) q = q.lte('criado_em', dataFim)
  const { data, error } = await q
  if (error) { console.error('[ESTOQUE] getRelatorioConsumo error:', error); return [] }
  const map = new Map<string, number>()
  for (const row of (data || [])) {
    const r = row as Record<string, unknown>
    const mid = r.medicamento_id as string
    const qty = r.quantidade as number
    map.set(mid, (map.get(mid) || 0) + qty)
  }
  const results: { medicamento: string; totalSaidas: number }[] = []
  for (const [mid, total] of map) {
    const { data: med } = await supabase.from('medicamentos').select('nome').eq('id', mid).single()
    results.push({ medicamento: med?.nome || mid, totalSaidas: total })
  }
  return results.sort((a, b) => b.totalSaidas - a.totalSaidas)
}
