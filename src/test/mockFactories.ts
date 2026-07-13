import type { Pet, Owner, Patient, Agendamento } from '../types'
import type { EhrDashboardMetrics } from '../core/ehr'

/** Sample dog for queue tests */
export const MOCK_DOG: Pet = {
  id: 'dog-1', senha: 'N001', especie: 'Cão',
  tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde',
  status: 'Aguardando direcionamento', localDirecionado: 'Triagem',
  dataHora: '2026-06-25T10:00:00Z', unidade: 'HOVET Central',
}

/** Sample cat for queue tests */
export const MOCK_CAT: Pet = {
  id: 'cat-1', senha: 'N002', especie: 'Gato',
  tipoAtendimento: 'Pronto Atendimento', prioridade: 'Amarelo',
  status: 'Aguardando direcionamento', localDirecionado: 'Consulta',
  dataHora: '2026-06-25T11:00:00Z', unidade: 'HOVET Central',
}

/** Sample wild animal for queue tests */
export const MOCK_WILD: Pet = {
  id: 'wild-1', senha: 'N003', especie: 'Animais Silvestres',
  tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde',
  status: 'Aguardando direcionamento', localDirecionado: '',
  dataHora: '2026-06-25T12:00:00Z', unidade: 'HOVET Central',
}

/** Sample history item */
export const MOCK_HISTORY: Pet = {
  id: 'hist-1', senha: 'N000', especie: 'Cão',
  tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde',
  status: 'Finalizado', localDirecionado: 'Triagem',
  dataHora: '2026-06-25T09:00:00Z', unidade: 'HOVET Central',
}

/** Sample triagem result */
export const MOCK_TRIAGEM_RESULT: Pet = {
  id: 'T-123', senha: 'N001', especie: 'Cão',
  tipoAtendimento: 'Pronto Atendimento', prioridade: 'Verde',
  status: 'Aguardando direcionamento', localDirecionado: '',
  dataHora: '2026-06-25T10:00:00Z',
}

/** Sample owners */
export const MOCK_OWNERS: Owner[] = [
  { id: 'own-1', nome: 'João Silva', telefone: '11999999999', cpf: '12345678901', criadoEm: '', atualizadoEm: '' },
  { id: 'own-2', nome: 'Maria Souza', telefone: '11988888888', criadoEm: '', atualizadoEm: '' },
]

/** Sample patients */
export const MOCK_PATIENTS: Patient[] = [
  { id: 'pat-1', nome: 'Rex', especie: 'Cão', raca: 'Labrador', idade: '5 anos', peso: 30, criadoEm: '', atualizadoEm: '' },
  { id: 'pat-2', nome: 'Mimi', especie: 'Gato', raca: 'Persa', idade: '3 anos', peso: 4, criadoEm: '', atualizadoEm: '' },
  { id: 'pat-3', nome: 'Pipoca', especie: 'Cão', raca: 'SRD', idade: '2 anos', criadoEm: '', atualizadoEm: '' },
]

/** Patient lookup map for Agendamentos tests */
export const MOCK_PATIENT_MAP: Record<string, { id: string; nome: string; especie: string }> = {
  'pat-1': { id: 'pat-1', nome: 'Rex', especie: 'Cão' },
  'pat-2': { id: 'pat-2', nome: 'Mimi', especie: 'Gato' },
  'pat-3': { id: 'pat-3', nome: 'Pipoca', especie: 'Cão' },
}

/** Sample agendamentos */
export const MOCK_AGENDAMENTOS: Agendamento[] = [
  { id: 'age-1', patientId: 'pat-1', dataHora: '2026-06-15T10:00:00Z', tipo: 'Consulta', veterinario: 'Dr. Vet', status: 'Pendente', unidade: 'HOVET', criadoEm: '', atualizadoEm: '' },
  { id: 'age-2', patientId: 'pat-2', dataHora: '2026-06-20T14:30:00Z', tipo: 'Cirurgia', veterinario: 'Dr. Cirurgiao', status: 'Confirmado', unidade: 'HOVET', criadoEm: '', atualizadoEm: '' },
  { id: 'age-3', patientId: 'pat-3', dataHora: '2026-06-25T08:00:00Z', tipo: 'Exame', status: 'Cancelado', unidade: 'HOVET', criadoEm: '', atualizadoEm: '' },
]

/** Sample dashboard metrics */
export const MOCK_DASHBOARD_METRICS: EhrDashboardMetrics = {
  totalPacientes: 150,
  totalConsultas: 320,
  totalTutores: 80,
  totalVacinasAVencer: 25,
  sexoBreakdown: [
    { sexo: 'Macho', count: 80 },
    { sexo: 'Fêmea', count: 70 },
  ],
  especieSexoBreakdown: [
    { especie: 'Cão', sexo: 'Macho', count: 50 },
    { especie: 'Cão', sexo: 'Fêmea', count: 40 },
    { especie: 'Gato', sexo: 'Macho', count: 30 },
    { especie: 'Gato', sexo: 'Fêmea', count: 30 },
  ],
}

/** Sample users for AdminPage */
export const MOCK_USERS = [
  { id: 'user-1', email: 'admin@vethub.com', role: 'admin', unidade: 'Mooca', funcoes: [] },
  { id: 'user-2', email: 'user@vethub.com', role: 'user', unidade: 'Paulista', funcoes: ['Recepcao', 'Fila'] },
]

/** Initial state for queue store */
export const INITIAL_QUEUE_STATE = {
  dogs: [] as Pet[],
  cats: [] as Pet[],
  wild: [] as Pet[],
  history: [] as Pet[],
  loading: false,
}
