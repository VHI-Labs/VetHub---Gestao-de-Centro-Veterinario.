import { supabase } from '../lib/supabase'

export function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export async function logAudit(
  tabela: string,
  acao: 'INSERT' | 'UPDATE' | 'DELETE',
  registroId: string,
  dadosAnteriores?: Record<string, unknown> | null,
  dadosNovos?: Record<string, unknown> | null
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const id = genId('aud')
    const { error } = await supabase.from('audit_log').insert({
      id,
      tabela,
      acao,
      registro_id: registroId,
      usuario_id: user?.id || null,
      usuario_email: user?.email || null,
      dados_anteriores: dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
      dados_novos: dadosNovos ? JSON.stringify(dadosNovos) : null,
      criado_em: new Date().toISOString()
    })
    if (error) console.error('[Audit] log error:', error)
  } catch (err) {
    console.error('[Audit] log exception:', err)
  }
}
