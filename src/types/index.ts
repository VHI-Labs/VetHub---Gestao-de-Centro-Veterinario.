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
  patientId?: string
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
}

export type AttendanceType =
  | 'Pronto Atendimento'
  | 'Consulta Marcada'
  | 'Cirurgia Agendada'
  | 'Exames'

export interface Owner {
  id: string
  nome: string
  cpf?: string
  telefone?: string
  email?: string
  endereco?: string
  unidade?: string
  criadoEm: string
  atualizadoEm: string
}

export interface Patient {
  id: string
  ownerId?: string
  nome: string
  especie: Species
  raca?: string
  sexo?: string
  pelagem?: string
  peso?: number
  idade?: string
  microchip?: string
  alergias?: string
  fotoUrl?: string
  observacoes?: string
  unidade?: string
  criadoEm: string
  atualizadoEm: string
}

export interface Consulta {
  id: string
  patientId: string
  petId?: string
  veterinario: string
  motivo: string
  exameFisico?: string
  diagnostico?: string
  prescricao?: string
  observacoes?: string
  unidade?: string
  criadoEm: string
  atualizadoEm: string
}

export interface Vacina {
  id: string
  patientId: string
  nome: string
  dataAplicacao: string
  dataProxima?: string
  lote?: string
  veterinario?: string
  unidade?: string
  criadoEm: string
}

export interface Cirurgia {
  id: string
  patientId: string
  tipo: string
  dataCirurgia: string
  veterinario?: string
  observacoes?: string
  unidade?: string
  criadoEm: string
}

export interface Exame {
  id: string
  patientId: string
  tipoExame: string
  resultado?: string
  arquivoUrl?: string
  dataExame: string
  veterinario?: string
  unidade?: string
  criadoEm: string
}

export type AgendamentoStatus = 'Pendente' | 'Confirmado' | 'Cancelado' | 'Concluido'

export interface Agendamento {
  id: string
  patientId: string
  ownerId?: string
  dataHora: string
  tipo: string
  veterinario?: string
  status: AgendamentoStatus
  observacoes?: string
  unidade?: string
  criadoEm: string
  atualizadoEm: string
}

export interface Veterinario {
  id: string
  nome: string
  crmv?: string
  especialidade?: string
  telefone?: string
  email?: string
  ativo: boolean
  unidade?: string
  criadoEm: string
  atualizadoEm: string
}

export interface Medicamento {
  id: string
  nome: string
  principioAtivo?: string
  fabricante?: string
  formaFarmaceutica?: string
  concentracao?: string
  unidadeMedida?: string
  precoCusto?: number
  precoVenda?: number
  estoqueMinimo: number
  estoqueAtual: number
  validade?: string
  unidade?: string
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export type EstoqueMovimentacaoTipo = 'Entrada' | 'Saida' | 'Ajuste' | 'Perda'

export interface EstoqueMovimentacao {
  id: string
  medicamentoId: string
  tipo: EstoqueMovimentacaoTipo
  quantidade: number
  motivo?: string
  consultaId?: string
  pacienteId?: string
  veterinarioId?: string
  usuarioId?: string
  unidade?: string
  criadoEm: string
}

export interface Servico {
  id: string
  nome: string
  descricao?: string
  categoria?: string
  preco: number
  ativo: boolean
  unidade?: string
  criadoEm: string
  atualizadoEm: string
}

export type FaturaStatus = 'Aberta' | 'Paga' | 'Parcial' | 'Cancelada'

export interface Fatura {
  id: string
  pacienteId: string
  ownerId?: string
  consultaId?: string
  cirurgiaId?: string
  status: FaturaStatus
  valorTotal: number
  valorPago: number
  desconto?: number
  observacoes?: string
  unidade?: string
  criadoEm: string
  atualizadoEm: string
}

export interface FaturaItem {
  id: string
  faturaId: string
  servicoId?: string
  descricao: string
  quantidade: number
  precoUnitario: number
  subtotal: number
  criadoEm: string
}

export type PagamentoMetodo = 'Dinheiro' | 'Cartao Credito' | 'Cartao Debito' | 'Pix' | 'Transferencia'

export interface Pagamento {
  id: string
  faturaId: string
  valor: number
  metodo: PagamentoMetodo
  dataPagamento: string
  referencia?: string
  usuarioId?: string
  unidade?: string
  criadoEm: string
}
