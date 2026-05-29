export interface Pet {
  id: string
  senha: string
  especie: 'Cão' | 'Gato' | 'Animais Silvestres'
  tipoAtendimento: string
  prioridade: 'Verde' | 'Amarelo' | 'Vermelho'
  status: string
  localDirecionado: string
  dataHora: string
  calledAt?: string
  finalizedAt?: string
  unidade?: string
}

export interface UserProfile {
  id?: string
  email?: string
  unidade: string
  funcoes: string[]
  role?: string
  atualizadoEm: string
}

export interface VideoMetadata {
  id: string
  youtubeUrl: string
  savedAt: string
}

export interface CallHistoryItem {
  id: string
  senha: string
  localDirecionado: string
  calledAt: string
}

export interface DashboardFilters {
  Species: string
  Year: string
  Month: string
  Day: string
  AttendanceType: string
}

export type Species = 'Cão' | 'Gato' | 'Animais Silvestres'
export type Priority = 'Verde' | 'Amarelo' | 'Vermelho'
export interface TvVideo {
  id: string
  youtubeUrl: string
  ordem: number
  isShort?: boolean
}

export type AttendanceType =
  | 'Pronto Atendimento'
  | 'Consulta Marcada'
  | 'Cirurgia Agendada'
  | 'Exames'
