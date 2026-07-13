import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  searchOwners,
  getOwner,
  createOwner,
  updateOwner,
  deleteOwner,
  searchPatients,
  getPatient,
  getPatientsByOwner,
  createPatient,
  updatePatient,
  deletePatient,
  getConsultasByPatient,
  createConsulta,
  updateConsulta,
  deleteConsulta,
  getVacinasByPatient,
  createVacina,
  getCirurgiasByPatient,
  createCirurgia,
  getExamesByPatient,
  createExame,
  getAgendamentos,
  getAgendamentosByPatient,
  createAgendamento,
  updateAgendamentoStatus,
  deleteAgendamento,
  getEhrDashboardMetrics,
  linkPetToPatient,
} from '../ehr'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

vi.mock('../audit', () => ({
  logAudit: vi.fn(),
}))

import { supabase } from '../../lib/supabase'
import { makeChain, makeErrorChain, makeCountChain } from '../../test/mocks'
const mockFrom = supabase.from as ReturnType<typeof vi.fn>

// ============================================================
// OWNERS
// ============================================================
describe('searchOwners', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return owners list', async () => {
    mockFrom.mockReturnValue(makeChain([{ id: 'own-1', nome: 'João', criado_em: '', atualizado_em: '' }]))
    const result = await searchOwners('')
    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe('João')
  })

  it('should return empty on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    const result = await searchOwners('')
    expect(result).toEqual([])
  })
})

describe('getOwner', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return single owner', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'own-1', nome: 'João', criado_em: '', atualizado_em: '' }))
    const result = await getOwner('own-1')
    expect(result).not.toBeNull()
    expect(result!.nome).toBe('João')
  })

  it('should return null on error', async () => {
    mockFrom.mockReturnValue(makeErrorChain())
    const result = await getOwner('own-1')
    expect(result).toBeNull()
  })
})

describe('createOwner', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should create and return owner', async () => {
    mockFrom.mockReturnValue(makeChain())
    const result = await createOwner({ nome: 'João', unidade: '' } as any)
    expect(result.nome).toBe('João')
    expect(result.criadoEm).toBeDefined()
  })
})

describe('updateOwner', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should update owner fields', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(updateOwner('own-1', { nome: 'Novo Nome' })).resolves.not.toThrow()
    expect(mockFrom).toHaveBeenCalledWith('owners')
  })
})

describe('deleteOwner', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should soft delete owner', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'own-1', nome: 'João' }))
    await expect(deleteOwner('own-1')).resolves.not.toThrow()
  })
})

// ============================================================
// PATIENTS
// ============================================================
describe('searchPatients', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return patients list', async () => {
    mockFrom.mockReturnValue(makeChain([{ id: 'pac-1', nome: 'Rex', especie: 'Cão', criado_em: '', atualizado_em: '' }]))
    const result = await searchPatients('')
    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe('Rex')
  })

  it('should filter by especie', async () => {
    const chain = makeChain([])
    mockFrom.mockReturnValue(chain)
    await searchPatients('', '', 'Cão')
    expect(chain.eq).toHaveBeenCalledWith('especie', 'Cão')
  })
})

describe('getPatient', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return single patient', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'pac-1', nome: 'Rex', especie: 'Cão', criado_em: '', atualizado_em: '' }))
    const result = await getPatient('pac-1')
    expect(result).not.toBeNull()
    expect(result!.nome).toBe('Rex')
  })
})

describe('createPatient', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should create and return patient', async () => {
    mockFrom.mockReturnValue(makeChain())
    const result = await createPatient({ nome: 'Rex', especie: 'Cão', unidade: '' } as any)
    expect(result.nome).toBe('Rex')
    expect(result.especie).toBe('Cão')
  })
})

describe('updatePatient', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should update patient fields', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(updatePatient('pac-1', { nome: 'NovoNome' })).resolves.not.toThrow()
  })
})

describe('deletePatient', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should soft delete patient', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'pac-1', nome: 'Rex' }))
    await expect(deletePatient('pac-1')).resolves.not.toThrow()
  })
})

// ============================================================
// CONSULTAS
// ============================================================
describe('getConsultasByPatient', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return consultas list', async () => {
    mockFrom.mockReturnValue(makeChain([{ id: 'cons-1', patient_id: 'pac-1', veterinario: 'Dr. Vet', motivo: 'Check-up', criado_em: '', atualizado_em: '' }]))
    const result = await getConsultasByPatient('pac-1')
    expect(result).toHaveLength(1)
    expect(result[0].motivo).toBe('Check-up')
  })
})

describe('createConsulta', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should create and return consulta', async () => {
    mockFrom.mockReturnValue(makeChain())
    const result = await createConsulta({ patientId: 'pac-1', veterinario: 'Dr. Vet', motivo: 'Check-up', unidade: '' } as any)
    expect(result.motivo).toBe('Check-up')
    expect(result.criadoEm).toBeDefined()
  })
})

describe('updateConsulta', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should update consulta fields', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(updateConsulta('cons-1', { diagnostico: 'Saudável' })).resolves.not.toThrow()
  })
})

describe('deleteConsulta', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should soft delete consulta', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'cons-1', motivo: 'Check-up' }))
    await expect(deleteConsulta('cons-1')).resolves.not.toThrow()
  })
})

// ============================================================
// VACINAS / CIRURGIAS / EXAMES
// ============================================================
describe('Vacinas CRUD', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should list vacinas by patient', async () => {
    mockFrom.mockReturnValue(makeChain([{ id: 'vac-1', patient_id: 'pac-1', nome: 'V10', data_aplicacao: '2026-01-15', criado_em: '' }]))
    const result = await getVacinasByPatient('pac-1')
    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe('V10')
  })

  it('should create vacina', async () => {
    mockFrom.mockReturnValue(makeChain())
    const result = await createVacina({ patientId: 'pac-1', nome: 'V10', dataAplicacao: '2026-01-15', unidade: '' } as any)
    expect(result.nome).toBe('V10')
  })
})

describe('Cirurgias CRUD', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should list cirurgias by patient', async () => {
    mockFrom.mockReturnValue(makeChain([{ id: 'cir-1', patient_id: 'pac-1', tipo: 'Castração', data_cirurgia: '', criado_em: '' }]))
    const result = await getCirurgiasByPatient('pac-1')
    expect(result).toHaveLength(1)
  })

  it('should create cirurgia', async () => {
    mockFrom.mockReturnValue(makeChain())
    const result = await createCirurgia({ patientId: 'pac-1', tipo: 'Castração', dataCirurgia: '', unidade: '' } as any)
    expect(result.tipo).toBe('Castração')
  })
})

describe('Exames CRUD', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should list exames by patient', async () => {
    mockFrom.mockReturnValue(makeChain([{ id: 'exa-1', patient_id: 'pac-1', tipo_exame: 'Hemograma', data_exame: '', criado_em: '' }]))
    const result = await getExamesByPatient('pac-1')
    expect(result).toHaveLength(1)
  })

  it('should create exame', async () => {
    mockFrom.mockReturnValue(makeChain())
    const result = await createExame({ patientId: 'pac-1', tipoExame: 'Hemograma', dataExame: '', unidade: '' } as any)
    expect(result.tipoExame).toBe('Hemograma')
  })
})

// ============================================================
// AGENDAMENTOS
// ============================================================
describe('getAgendamentos', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should return agendamentos list', async () => {
    mockFrom.mockReturnValue(makeChain([{ id: 'age-1', patient_id: 'pac-1', data_hora: '', tipo: 'Consulta', criado_em: '', atualizado_em: '' }]))
    const result = await getAgendamentos()
    expect(result).toHaveLength(1)
  })
})

describe('createAgendamento', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should create and return agendamento', async () => {
    mockFrom.mockReturnValue(makeChain())
    const result = await createAgendamento({ patientId: 'pac-1', dataHora: '2026-07-01T14:00:00Z', tipo: 'Consulta', unidade: '' } as any)
    expect(result.tipo).toBe('Consulta')
  })
})

describe('updateAgendamentoStatus', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should update status', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(updateAgendamentoStatus('age-1', 'Confirmado')).resolves.not.toThrow()
  })
})

describe('deleteAgendamento', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should soft delete agendamento', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'age-1', tipo: 'Consulta' }))
    await expect(deleteAgendamento('age-1')).resolves.not.toThrow()
  })
})

// ============================================================
// DASHBOARD METRICS
// ============================================================
describe('getEhrDashboardMetrics', () => {
  beforeEach(() => { vi.clearAllMocks() })



  it('should return dashboard metrics with zeros', async () => {
    mockFrom.mockReturnValue(makeCountChain(0))
    const result = await getEhrDashboardMetrics()
    expect(result.totalPacientes).toBe(0)
    expect(result.totalConsultas).toBe(0)
    expect(result.totalTutores).toBe(0)
    expect(result.totalVacinasAVencer).toBe(0)
  })

  it('should return counts for all metrics', async () => {
    mockFrom.mockReturnValue(makeCountChain(5))
    const result = await getEhrDashboardMetrics()
    expect(result.totalPacientes).toBe(5)
    expect(result.totalConsultas).toBe(5)
    expect(result.totalTutores).toBe(5)
  })
})

// ============================================================
// LINK PET → PATIENT
// ============================================================
describe('linkPetToPatient', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should update pet with patient_id', async () => {
    mockFrom.mockReturnValue(makeChain())
    await expect(linkPetToPatient('pet-1', 'pac-1')).resolves.not.toThrow()
    expect(mockFrom).toHaveBeenCalledWith('pets')
  })
})
