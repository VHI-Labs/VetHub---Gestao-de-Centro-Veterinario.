import type { Owner, Patient, Consulta, Vacina, Cirurgia, Exame, Agendamento, Species } from '../types'
import { supabase } from '../lib/supabase'
import { cleanText } from './engine'
import { logAudit } from './audit'

/** @internal Exported for testing */
export function formatOwnerDbToTs(row: Record<string, unknown>): Owner {
  return {
    id: row.id as string,
    nome: (row.nome as string) || '',
    cpf: (row.cpf as string) || undefined,
    telefone: (row.telefone as string) || undefined,
    email: (row.email as string) || undefined,
    endereco: (row.endereco as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString(),
    atualizadoEm: (row.atualizado_em as string) || new Date().toISOString()
  }
}

/** @internal Exported for testing */
export function formatPatientDbToTs(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    ownerId: (row.owner_id as string) || undefined,
    nome: (row.nome as string) || '',
    especie: (row.especie as Species) || 'Cão',
    raca: (row.raca as string) || undefined,
    sexo: (row.sexo as string) || undefined,
    pelagem: (row.pelagem as string) || undefined,
    peso: row.peso != null ? Number(row.peso) : undefined,
    idade: (row.idade as string) || undefined,
    microchip: (row.microchip as string) || undefined,
    alergias: (row.alergias as string) || undefined,
    fotoUrl: (row.foto_url as string) || undefined,
    observacoes: (row.observacoes as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString(),
    atualizadoEm: (row.atualizado_em as string) || new Date().toISOString()
  }
}

/** @internal Exported for testing */
export function formatConsultaDbToTs(row: Record<string, unknown>): Consulta {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    petId: (row.pet_id as string) || undefined,
    veterinario: (row.veterinario as string) || '',
    motivo: (row.motivo as string) || '',
    exameFisico: (row.exame_fisico as string) || undefined,
    diagnostico: (row.diagnostico as string) || undefined,
    prescricao: (row.prescricao as string) || undefined,
    observacoes: (row.observacoes as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString(),
    atualizadoEm: (row.atualizado_em as string) || new Date().toISOString()
  }
}

/** @internal Exported for testing */
export function formatVacinaDbToTs(row: Record<string, unknown>): Vacina {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    nome: (row.nome as string) || '',
    dataAplicacao: (row.data_aplicacao as string) || '',
    dataProxima: (row.data_proxima as string) || undefined,
    lote: (row.lote as string) || undefined,
    veterinario: (row.veterinario as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString()
  }
}

/** @internal Exported for testing */
export function formatCirurgiaDbToTs(row: Record<string, unknown>): Cirurgia {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    tipo: (row.tipo as string) || '',
    dataCirurgia: (row.data_cirurgia as string) || new Date().toISOString(),
    veterinario: (row.veterinario as string) || undefined,
    observacoes: (row.observacoes as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString()
  }
}

/** @internal Exported for testing */
export function formatExameDbToTs(row: Record<string, unknown>): Exame {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    tipoExame: (row.tipo_exame as string) || '',
    resultado: (row.resultado as string) || undefined,
    arquivoUrl: (row.arquivo_url as string) || undefined,
    dataExame: (row.data_exame as string) || '',
    veterinario: (row.veterinario as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString()
  }
}

/** @internal Exported for testing */
export function formatAgendamentoDbToTs(row: Record<string, unknown>): Agendamento {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    ownerId: (row.owner_id as string) || undefined,
    dataHora: (row.data_hora as string) || new Date().toISOString(),
    tipo: (row.tipo as string) || '',
    veterinario: (row.veterinario as string) || undefined,
    status: (row.status as Agendamento['status']) || 'Pendente',
    observacoes: (row.observacoes as string) || undefined,
    unidade: (row.unidade as string) || '',
    criadoEm: (row.criado_em as string) || new Date().toISOString(),
    atualizadoEm: (row.atualizado_em as string) || new Date().toISOString()
  }
}

export function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

// ============================================================
// OWNERS
// ============================================================

export async function searchOwners(query: string, unidade = ''): Promise<Owner[]> {
  let q = supabase.from('owners').select('*')
  if (query.trim()) {
    q = q.or(`nome.ilike.%${query}%,cpf.ilike.%${query}%,telefone.ilike.%${query}%`)
  }
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  const { data, error } = await q.order('nome', { ascending: true }).limit(50)
  if (error) { console.error('[EHR] searchOwners error:', error); return [] }
  return (data || []).map(formatOwnerDbToTs)
}

export async function getOwner(id: string): Promise<Owner | null> {
  const { data, error } = await supabase.from('owners').select('*').eq('id', id).single()
  if (error || !data) return null
  return formatOwnerDbToTs(data)
}

export async function createOwner(data: Omit<Owner, 'criadoEm' | 'atualizadoEm'>): Promise<Owner> {
  const now = new Date().toISOString()
  const row = {
    id: data.id || genId('own'),
    nome: data.nome,
    cpf: data.cpf || null,
    telefone: data.telefone || null,
    email: data.email || null,
    endereco: data.endereco || null,
    unidade: data.unidade || '',
    criado_em: now,
    atualizado_em: now
  }
  const { error } = await supabase.from('owners').insert(row)
  if (error) console.error('[EHR] createOwner error:', error)
  await logAudit('owners', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now, atualizadoEm: now }
}

export async function updateOwner(id: string, data: Partial<Owner>): Promise<void> {
  const updates: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (data.nome !== undefined) updates.nome = data.nome
  if (data.cpf !== undefined) updates.cpf = data.cpf || null
  if (data.telefone !== undefined) updates.telefone = data.telefone || null
  if (data.email !== undefined) updates.email = data.email || null
  if (data.endereco !== undefined) updates.endereco = data.endereco || null
  const { error } = await supabase.from('owners').update(updates).eq('id', id)
  if (error) console.error('[EHR] updateOwner error:', error)
  await logAudit('owners', 'UPDATE', id, null, updates)
}

export async function deleteOwner(id: string): Promise<void> {
  const { data: old } = await supabase.from('owners').select('*').eq('id', id).single()
  const { error } = await supabase.from('owners').delete().eq('id', id)
  if (error) console.error('[EHR] deleteOwner error:', error)
  await logAudit('owners', 'DELETE', id, old || undefined, null)
}

// ============================================================
// PATIENTS
// ============================================================

export async function searchPatients(query: string, unidade = '', especie?: Species): Promise<Patient[]> {
  let q = supabase.from('patients').select('*')
  if (query.trim()) {
    q = q.or(`nome.ilike.%${query}%,raca.ilike.%${query}%,microchip.ilike.%${query}%`)
  }
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  if (especie) q = q.eq('especie', especie)
  const { data, error } = await q.order('nome', { ascending: true }).limit(100)
  if (error) { console.error('[EHR] searchPatients error:', error); return [] }
  return (data || []).map(formatPatientDbToTs)
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).single()
  if (error || !data) return null
  return formatPatientDbToTs(data)
}

export async function getPatientsByOwner(ownerId: string): Promise<Patient[]> {
  const { data, error } = await supabase.from('patients').select('*').eq('owner_id', ownerId).order('nome')
  if (error) { console.error('[EHR] getPatientsByOwner error:', error); return [] }
  return (data || []).map(formatPatientDbToTs)
}

export async function createPatient(data: Omit<Patient, 'criadoEm' | 'atualizadoEm'>): Promise<Patient> {
  const now = new Date().toISOString()
  const row = {
    id: data.id || genId('pac'),
    owner_id: data.ownerId || null,
    nome: data.nome,
    especie: data.especie,
    raca: data.raca || null,
    sexo: data.sexo || null,
    pelagem: data.pelagem || null,
    peso: data.peso ?? null,
    idade: data.idade || null,
    microchip: data.microchip || null,
    alergias: data.alergias || null,
    foto_url: data.fotoUrl || null,
    observacoes: data.observacoes || null,
    unidade: data.unidade || '',
    criado_em: now,
    atualizado_em: now
  }
  const { error } = await supabase.from('patients').insert(row)
  if (error) console.error('[EHR] createPatient error:', error)
  await logAudit('patients', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now, atualizadoEm: now }
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<void> {
  const updates: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (data.ownerId !== undefined) updates.owner_id = data.ownerId || null
  if (data.nome !== undefined) updates.nome = data.nome
  if (data.especie !== undefined) updates.especie = data.especie
  if (data.raca !== undefined) updates.raca = data.raca || null
  if (data.sexo !== undefined) updates.sexo = data.sexo || null
  if (data.pelagem !== undefined) updates.pelagem = data.pelagem || null
  if (data.peso !== undefined) updates.peso = data.peso ?? null
  if (data.idade !== undefined) updates.idade = data.idade || null
  if (data.microchip !== undefined) updates.microchip = data.microchip || null
  if (data.alergias !== undefined) updates.alergias = data.alergias || null
  if (data.fotoUrl !== undefined) updates.foto_url = data.fotoUrl || null
  if (data.observacoes !== undefined) updates.observacoes = data.observacoes || null
  const { error } = await supabase.from('patients').update(updates).eq('id', id)
  if (error) console.error('[EHR] updatePatient error:', error)
  await logAudit('patients', 'UPDATE', id, null, updates)
}

export async function deletePatient(id: string): Promise<void> {
  const { data: old } = await supabase.from('patients').select('*').eq('id', id).single()
  const { error } = await supabase.from('patients').delete().eq('id', id)
  if (error) console.error('[EHR] deletePatient error:', error)
  await logAudit('patients', 'DELETE', id, old || undefined, null)
}

// ============================================================
// CONSULTAS
// ============================================================

export async function getConsultasByPatient(patientId: string): Promise<Consulta[]> {
  const { data, error } = await supabase
    .from('consultas').select('*')
    .eq('patient_id', patientId)
    .order('criado_em', { ascending: false })
  if (error) { console.error('[EHR] getConsultasByPatient error:', error); return [] }
  return (data || []).map(formatConsultaDbToTs)
}

export async function createConsulta(data: Omit<Consulta, 'criadoEm' | 'atualizadoEm'>): Promise<Consulta> {
  const now = new Date().toISOString()
  const row = {
    id: genId('cons'),
    patient_id: data.patientId,
    pet_id: data.petId || null,
    veterinario: data.veterinario,
    motivo: data.motivo,
    exame_fisico: data.exameFisico || null,
    diagnostico: data.diagnostico || null,
    prescricao: data.prescricao || null,
    observacoes: data.observacoes || null,
    unidade: data.unidade || '',
    criado_em: now,
    atualizado_em: now
  }
  const { error } = await supabase.from('consultas').insert(row)
  if (error) console.error('[EHR] createConsulta error:', error)
  await logAudit('consultas', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now, atualizadoEm: now }
}

export async function updateConsulta(id: string, data: Partial<Consulta>): Promise<void> {
  const updates: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (data.veterinario !== undefined) updates.veterinario = data.veterinario
  if (data.motivo !== undefined) updates.motivo = data.motivo
  if (data.exameFisico !== undefined) updates.exame_fisico = data.exameFisico || null
  if (data.diagnostico !== undefined) updates.diagnostico = data.diagnostico || null
  if (data.prescricao !== undefined) updates.prescricao = data.prescricao || null
  if (data.observacoes !== undefined) updates.observacoes = data.observacoes || null
  const { error } = await supabase.from('consultas').update(updates).eq('id', id)
  if (error) console.error('[EHR] updateConsulta error:', error)
  await logAudit('consultas', 'UPDATE', id, null, updates)
}

export async function deleteConsulta(id: string): Promise<void> {
  const { data: old } = await supabase.from('consultas').select('*').eq('id', id).single()
  const { error } = await supabase.from('consultas').delete().eq('id', id)
  if (error) console.error('[EHR] deleteConsulta error:', error)
  await logAudit('consultas', 'DELETE', id, old || undefined, null)
}

// ============================================================
// VACINAS
// ============================================================

export async function getVacinasByPatient(patientId: string): Promise<Vacina[]> {
  const { data, error } = await supabase
    .from('vacinas').select('*')
    .eq('patient_id', patientId)
    .order('data_aplicacao', { ascending: false })
  if (error) { console.error('[EHR] getVacinasByPatient error:', error); return [] }
  return (data || []).map(formatVacinaDbToTs)
}

export async function createVacina(data: Omit<Vacina, 'criadoEm'>): Promise<Vacina> {
  const now = new Date().toISOString()
  const row = {
    id: genId('vac'),
    patient_id: data.patientId,
    nome: data.nome,
    data_aplicacao: data.dataAplicacao,
    data_proxima: data.dataProxima || null,
    lote: data.lote || null,
    veterinario: data.veterinario || null,
    unidade: data.unidade || '',
    criado_em: now
  }
  const { error } = await supabase.from('vacinas').insert(row)
  if (error) console.error('[EHR] createVacina error:', error)
  await logAudit('vacinas', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now }
}

export async function updateVacina(id: string, data: Partial<Vacina>): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (data.nome !== undefined) updates.nome = data.nome
  if (data.dataAplicacao !== undefined) updates.data_aplicacao = data.dataAplicacao
  if (data.dataProxima !== undefined) updates.data_proxima = data.dataProxima || null
  if (data.lote !== undefined) updates.lote = data.lote || null
  if (data.veterinario !== undefined) updates.veterinario = data.veterinario || null
  const { error } = await supabase.from('vacinas').update(updates).eq('id', id)
  if (error) console.error('[EHR] updateVacina error:', error)
  await logAudit('vacinas', 'UPDATE', id, null, updates)
}

export async function deleteVacina(id: string): Promise<void> {
  const { data: old } = await supabase.from('vacinas').select('*').eq('id', id).single()
  const { error } = await supabase.from('vacinas').delete().eq('id', id)
  if (error) console.error('[EHR] deleteVacina error:', error)
  await logAudit('vacinas', 'DELETE', id, old || undefined, null)
}

// ============================================================
// CIRURGIAS
// ============================================================

export async function getCirurgiasByPatient(patientId: string): Promise<Cirurgia[]> {
  const { data, error } = await supabase
    .from('cirurgias').select('*')
    .eq('patient_id', patientId)
    .order('data_cirurgia', { ascending: false })
  if (error) { console.error('[EHR] getCirurgiasByPatient error:', error); return [] }
  return (data || []).map(formatCirurgiaDbToTs)
}

export async function createCirurgia(data: Omit<Cirurgia, 'criadoEm'>): Promise<Cirurgia> {
  const now = new Date().toISOString()
  const row = {
    id: genId('cir'),
    patient_id: data.patientId,
    tipo: data.tipo,
    data_cirurgia: data.dataCirurgia,
    veterinario: data.veterinario || null,
    observacoes: data.observacoes || null,
    unidade: data.unidade || '',
    criado_em: now
  }
  const { error } = await supabase.from('cirurgias').insert(row)
  if (error) console.error('[EHR] createCirurgia error:', error)
  await logAudit('cirurgias', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now }
}

export async function updateCirurgia(id: string, data: Partial<Cirurgia>): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (data.tipo !== undefined) updates.tipo = data.tipo
  if (data.dataCirurgia !== undefined) updates.data_cirurgia = data.dataCirurgia
  if (data.veterinario !== undefined) updates.veterinario = data.veterinario || null
  if (data.observacoes !== undefined) updates.observacoes = data.observacoes || null
  const { error } = await supabase.from('cirurgias').update(updates).eq('id', id)
  if (error) console.error('[EHR] updateCirurgia error:', error)
  await logAudit('cirurgias', 'UPDATE', id, null, updates)
}

export async function deleteCirurgia(id: string): Promise<void> {
  const { data: old } = await supabase.from('cirurgias').select('*').eq('id', id).single()
  const { error } = await supabase.from('cirurgias').delete().eq('id', id)
  if (error) console.error('[EHR] deleteCirurgia error:', error)
  await logAudit('cirurgias', 'DELETE', id, old || undefined, null)
}

// ============================================================
// EXAMES
// ============================================================

export async function getExamesByPatient(patientId: string): Promise<Exame[]> {
  const { data, error } = await supabase
    .from('exames').select('*')
    .eq('patient_id', patientId)
    .order('data_exame', { ascending: false })
  if (error) { console.error('[EHR] getExamesByPatient error:', error); return [] }
  return (data || []).map(formatExameDbToTs)
}

export async function createExame(data: Omit<Exame, 'criadoEm'>): Promise<Exame> {
  const now = new Date().toISOString()
  const row = {
    id: genId('exa'),
    patient_id: data.patientId,
    tipo_exame: data.tipoExame,
    resultado: data.resultado || null,
    arquivo_url: data.arquivoUrl || null,
    data_exame: data.dataExame,
    veterinario: data.veterinario || null,
    unidade: data.unidade || '',
    criado_em: now
  }
  const { error } = await supabase.from('exames').insert(row)
  if (error) console.error('[EHR] createExame error:', error)
  await logAudit('exames', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now }
}

export async function updateExame(id: string, data: Partial<Exame>): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (data.tipoExame !== undefined) updates.tipo_exame = data.tipoExame
  if (data.resultado !== undefined) updates.resultado = data.resultado || null
  if (data.arquivoUrl !== undefined) updates.arquivo_url = data.arquivoUrl || null
  if (data.dataExame !== undefined) updates.data_exame = data.dataExame
  if (data.veterinario !== undefined) updates.veterinario = data.veterinario || null
  const { error } = await supabase.from('exames').update(updates).eq('id', id)
  if (error) console.error('[EHR] updateExame error:', error)
  await logAudit('exames', 'UPDATE', id, null, updates)
}

export async function deleteExame(id: string): Promise<void> {
  const { data: old } = await supabase.from('exames').select('*').eq('id', id).single()
  const { error } = await supabase.from('exames').delete().eq('id', id)
  if (error) console.error('[EHR] deleteExame error:', error)
  await logAudit('exames', 'DELETE', id, old || undefined, null)
}

// ============================================================
// AGENDAMENTOS
// ============================================================

export async function getAgendamentos(unidade = '', dataInicio?: string, dataFim?: string): Promise<Agendamento[]> {
  let q = supabase.from('agendamentos').select('*')
  if (unidade && unidade !== 'Todos') q = q.eq('unidade', unidade)
  if (dataInicio) q = q.gte('data_hora', dataInicio)
  if (dataFim) q = q.lte('data_hora', dataFim)
  const { data, error } = await q.order('data_hora', { ascending: true })
  if (error) { console.error('[EHR] getAgendamentos error:', error); return [] }
  return (data || []).map(formatAgendamentoDbToTs)
}

export async function getAgendamentosByPatient(patientId: string): Promise<Agendamento[]> {
  const { data, error } = await supabase
    .from('agendamentos').select('*')
    .eq('patient_id', patientId)
    .order('data_hora', { ascending: false })
  if (error) { console.error('[EHR] getAgendamentosByPatient error:', error); return [] }
  return (data || []).map(formatAgendamentoDbToTs)
}

export async function createAgendamento(data: Omit<Agendamento, 'criadoEm' | 'atualizadoEm'>): Promise<Agendamento> {
  const now = new Date().toISOString()
  const row = {
    id: genId('age'),
    patient_id: data.patientId,
    owner_id: data.ownerId || null,
    data_hora: data.dataHora,
    tipo: data.tipo,
    veterinario: data.veterinario || null,
    status: data.status || 'Pendente',
    observacoes: data.observacoes || null,
    unidade: data.unidade || '',
    criado_em: now,
    atualizado_em: now
  }
  const { error } = await supabase.from('agendamentos').insert(row)
  if (error) console.error('[EHR] createAgendamento error:', error)
  await logAudit('agendamentos', 'INSERT', row.id, null, row)
  return { ...data, criadoEm: now, atualizadoEm: now }
}

export async function updateAgendamentoStatus(id: string, status: Agendamento['status']): Promise<void> {
  const { error } = await supabase
    .from('agendamentos')
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq('id', id)
  if (error) console.error('[EHR] updateAgendamentoStatus error:', error)
  await logAudit('agendamentos', 'UPDATE', id, null, { status })
}

export async function deleteAgendamento(id: string): Promise<void> {
  const { data: old } = await supabase.from('agendamentos').select('*').eq('id', id).single()
  const { error } = await supabase.from('agendamentos').delete().eq('id', id)
  if (error) console.error('[EHR] deleteAgendamento error:', error)
  await logAudit('agendamentos', 'DELETE', id, old || undefined, null)
}

// ============================================================
// DASHBOARD METRICS
// ============================================================

export interface EhrDashboardMetrics {
  totalPacientes: number
  totalConsultas: number
  totalTutores: number
  totalVacinasAVencer: number
  sexoBreakdown: { sexo: string; count: number }[]
  especieSexoBreakdown: { especie: string; sexo: string; count: number }[]
}

export async function getEhrDashboardMetrics(unidade = ''): Promise<EhrDashboardMetrics> {
  const base = unidade && unidade !== 'Todos' ? { unidade } : {}

  const [pacientes, consultas, tutores, vacinas, sexoData, especieSexoData] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }).match(base),
    supabase.from('consultas').select('id', { count: 'exact', head: true }).match(base),
    supabase.from('owners').select('id', { count: 'exact', head: true }).match(base),
    supabase.from('vacinas').select('id', { count: 'exact', head: true })
      .match(base)
      .not('data_proxima', 'is', null)
      .lte('data_proxima', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
    supabase.from('patients').select('sexo')
      .match(base)
      .not('sexo', 'is', null),
    supabase.from('patients').select('especie, sexo')
      .match(base)
      .not('sexo', 'is', null)
  ])

  const countSexo = (sexoData.data || []).reduce<Record<string, number>>((acc, r) => {
    const s = (r as Record<string, unknown>).sexo as string || 'Indefinido'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  const countEspecieSexo = (especieSexoData.data || []).reduce<Record<string, number>>((acc, r) => {
    const row = r as Record<string, unknown>
    const key = `${row.especie}|${row.sexo}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return {
    totalPacientes: pacientes.count || 0,
    totalConsultas: consultas.count || 0,
    totalTutores: tutores.count || 0,
    totalVacinasAVencer: vacinas.count || 0,
    sexoBreakdown: Object.entries(countSexo).map(([sexo, count]) => ({ sexo, count })),
    especieSexoBreakdown: Object.entries(countEspecieSexo).map(([key, count]) => {
      const [especie, sexo] = key.split('|')
      return { especie, sexo, count }
    })
  }
}

// ============================================================
// LINK PET → PATIENT
// ============================================================

export async function linkPetToPatient(petId: string, patientId: string): Promise<void> {
  const { error } = await supabase.from('pets').update({ patient_id: patientId }).eq('id', petId)
  if (error) console.error('[EHR] linkPetToPatient error:', error)
}
