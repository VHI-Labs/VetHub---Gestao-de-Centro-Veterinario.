import { describe, it, expect } from 'vitest'
import {
  formatOwnerDbToTs,
  formatPatientDbToTs,
  formatConsultaDbToTs,
  formatVacinaDbToTs,
  formatCirurgiaDbToTs,
  formatExameDbToTs,
  formatAgendamentoDbToTs,
} from '../ehr'

describe('formatOwnerDbToTs', () => {
  it('should convert snake_case DB row to camelCase Owner', () => {
    const row = {
      id: 'own-1',
      nome: 'João Silva',
      cpf: '12345678901',
      telefone: '11999999999',
      email: 'joao@email.com',
      endereco: 'Rua A, 123',
      unidade: 'HOVET Central',
      criado_em: '2026-01-01T10:00:00Z',
      atualizado_em: '2026-06-01T10:00:00Z',
    }
    const result = formatOwnerDbToTs(row)
    expect(result).toEqual({
      id: 'own-1',
      nome: 'João Silva',
      cpf: '12345678901',
      telefone: '11999999999',
      email: 'joao@email.com',
      endereco: 'Rua A, 123',
      unidade: 'HOVET Central',
      criadoEm: '2026-01-01T10:00:00Z',
      atualizadoEm: '2026-06-01T10:00:00Z',
    })
  })

  it('should handle empty optional fields', () => {
    const row = {
      id: 'own-2',
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      endereco: '',
      unidade: '',
      criado_em: '2026-01-01T10:00:00Z',
      atualizado_em: '2026-06-01T10:00:00Z',
    }
    const result = formatOwnerDbToTs(row)
    expect(result.cpf).toBeUndefined()
    expect(result.telefone).toBeUndefined()
    expect(result.email).toBeUndefined()
    expect(result.endereco).toBeUndefined()
  })

  it('should use current date as fallback when dates are missing', () => {
    const row = { id: 'own-3', nome: 'Teste' }
    const result = formatOwnerDbToTs(row)
    expect(result.criadoEm).toBeDefined()
    expect(result.atualizadoEm).toBeDefined()
  })
})

describe('formatPatientDbToTs', () => {
  it('should convert DB row to Patient', () => {
    const row = {
      id: 'pac-1',
      owner_id: 'own-1',
      nome: 'Rex',
      especie: 'Cão',
      raca: 'Labrador',
      sexo: 'M',
      pelagem: 'Caramelo',
      peso: 30.5,
      idade: '5 anos',
      microchip: 'MC123',
      alergias: 'Nenhuma',
      foto_url: 'https://example.com/foto.jpg',
      observacoes: 'Observação teste',
      unidade: 'HOVET',
      criado_em: '2026-01-01T10:00:00Z',
      atualizado_em: '2026-06-01T10:00:00Z',
    }
    const result = formatPatientDbToTs(row)
    expect(result).toEqual({
      id: 'pac-1',
      ownerId: 'own-1',
      nome: 'Rex',
      especie: 'Cão',
      raca: 'Labrador',
      sexo: 'M',
      pelagem: 'Caramelo',
      peso: 30.5,
      idade: '5 anos',
      microchip: 'MC123',
      alergias: 'Nenhuma',
      fotoUrl: 'https://example.com/foto.jpg',
      observacoes: 'Observação teste',
      unidade: 'HOVET',
      criadoEm: '2026-01-01T10:00:00Z',
      atualizadoEm: '2026-06-01T10:00:00Z',
    })
  })

  it('should default especie to Cão when missing', () => {
    const result = formatPatientDbToTs({ id: 'pac-2', nome: 'Teste' })
    expect(result.especie).toBe('Cão')
  })

  it('should convert peso to number', () => {
    const result = formatPatientDbToTs({ id: 'pac-3', nome: 'Teste', peso: '25' })
    expect(result.peso).toBe(25)
  })

  it('should handle null peso', () => {
    const result = formatPatientDbToTs({ id: 'pac-4', nome: 'Teste', peso: null })
    expect(result.peso).toBeUndefined()
  })
})

describe('formatConsultaDbToTs', () => {
  it('should convert DB row to Consulta', () => {
    const row = {
      id: 'cons-1',
      patient_id: 'pac-1',
      pet_id: 'pet-1',
      veterinario: 'Dr. Vet',
      motivo: 'Check-up',
      exame_fisico: 'Normal',
      diagnostico: 'Saudável',
      prescricao: 'Vacina anual',
      observacoes: 'Sem alterações',
      unidade: 'HOVET',
      criado_em: '2026-01-01T10:00:00Z',
      atualizado_em: '2026-06-01T10:00:00Z',
    }
    const result = formatConsultaDbToTs(row)
    expect(result).toEqual({
      id: 'cons-1',
      patientId: 'pac-1',
      petId: 'pet-1',
      veterinario: 'Dr. Vet',
      motivo: 'Check-up',
      exameFisico: 'Normal',
      diagnostico: 'Saudável',
      prescricao: 'Vacina anual',
      observacoes: 'Sem alterações',
      unidade: 'HOVET',
      criadoEm: '2026-01-01T10:00:00Z',
      atualizadoEm: '2026-06-01T10:00:00Z',
    })
  })

  it('should handle optional petId', () => {
    const row = {
      id: 'cons-2',
      patient_id: 'pac-1',
      veterinario: 'Dr.',
      motivo: 'Rotina',
      criado_em: '2026-01-01T10:00:00Z',
      atualizado_em: '2026-06-01T10:00:00Z',
    }
    const result = formatConsultaDbToTs(row)
    expect(result.petId).toBeUndefined()
  })
})

describe('formatVacinaDbToTs', () => {
  it('should convert DB row to Vacina', () => {
    const row = {
      id: 'vac-1',
      patient_id: 'pac-1',
      nome: 'V10',
      data_aplicacao: '2026-01-15',
      data_proxima: '2027-01-15',
      lote: 'LOT-123',
      veterinario: 'Dr. Vet',
      unidade: 'HOVET',
      criado_em: '2026-01-15T10:00:00Z',
    }
    const result = formatVacinaDbToTs(row)
    expect(result).toEqual({
      id: 'vac-1',
      patientId: 'pac-1',
      nome: 'V10',
      dataAplicacao: '2026-01-15',
      dataProxima: '2027-01-15',
      lote: 'LOT-123',
      veterinario: 'Dr. Vet',
      unidade: 'HOVET',
      criadoEm: '2026-01-15T10:00:00Z',
    })
  })
})

describe('formatCirurgiaDbToTs', () => {
  it('should convert DB row to Cirurgia', () => {
    const row = {
      id: 'cir-1',
      patient_id: 'pac-1',
      tipo: 'Castração',
      data_cirurgia: '2026-03-10T08:00:00Z',
      veterinario: 'Dr. Vet',
      observacoes: 'Cirurgia bem-sucedida',
      unidade: 'HOVET',
      criado_em: '2026-03-10T10:00:00Z',
    }
    const result = formatCirurgiaDbToTs(row)
    expect(result).toEqual({
      id: 'cir-1',
      patientId: 'pac-1',
      tipo: 'Castração',
      dataCirurgia: '2026-03-10T08:00:00Z',
      veterinario: 'Dr. Vet',
      observacoes: 'Cirurgia bem-sucedida',
      unidade: 'HOVET',
      criadoEm: '2026-03-10T10:00:00Z',
    })
  })
})

describe('formatExameDbToTs', () => {
  it('should convert DB row to Exame', () => {
    const row = {
      id: 'exa-1',
      patient_id: 'pac-1',
      tipo_exame: 'Hemograma',
      resultado: 'Normal',
      arquivo_url: 'https://example.com/laudo.pdf',
      data_exame: '2026-02-20',
      veterinario: 'Dr. Vet',
      unidade: 'HOVET',
      criado_em: '2026-02-20T10:00:00Z',
    }
    const result = formatExameDbToTs(row)
    expect(result).toEqual({
      id: 'exa-1',
      patientId: 'pac-1',
      tipoExame: 'Hemograma',
      resultado: 'Normal',
      arquivoUrl: 'https://example.com/laudo.pdf',
      dataExame: '2026-02-20',
      veterinario: 'Dr. Vet',
      unidade: 'HOVET',
      criadoEm: '2026-02-20T10:00:00Z',
    })
  })
})

describe('formatAgendamentoDbToTs', () => {
  it('should convert DB row to Agendamento', () => {
    const row = {
      id: 'age-1',
      patient_id: 'pac-1',
      owner_id: 'own-1',
      data_hora: '2026-07-01T14:00:00Z',
      tipo: 'Consulta',
      veterinario: 'Dr. Vet',
      status: 'Pendente',
      observacoes: 'Retorno',
      unidade: 'HOVET',
      criado_em: '2026-06-01T10:00:00Z',
      atualizado_em: '2026-06-01T10:00:00Z',
    }
    const result = formatAgendamentoDbToTs(row)
    expect(result).toEqual({
      id: 'age-1',
      patientId: 'pac-1',
      ownerId: 'own-1',
      dataHora: '2026-07-01T14:00:00Z',
      tipo: 'Consulta',
      veterinario: 'Dr. Vet',
      status: 'Pendente',
      observacoes: 'Retorno',
      unidade: 'HOVET',
      criadoEm: '2026-06-01T10:00:00Z',
      atualizadoEm: '2026-06-01T10:00:00Z',
    })
  })

  it('should default status to Pendente', () => {
    const row = {
      id: 'age-2',
      patient_id: 'pac-1',
      data_hora: '2026-07-01T14:00:00Z',
      tipo: 'Consulta',
      criado_em: '2026-06-01T10:00:00Z',
      atualizado_em: '2026-06-01T10:00:00Z',
    }
    const result = formatAgendamentoDbToTs(row)
    expect(result.status).toBe('Pendente')
  })
})
