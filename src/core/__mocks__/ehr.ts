import { vi } from 'vitest'

// All functions exported by ehr.ts are mocked as vi.fn()
export const searchOwners = vi.fn()
export const getOwner = vi.fn()
export const createOwner = vi.fn()
export const updateOwner = vi.fn()
export const deleteOwner = vi.fn()

export const searchPatients = vi.fn()
export const getPatient = vi.fn()
export const getPatientsByOwner = vi.fn()
export const createPatient = vi.fn()
export const updatePatient = vi.fn()
export const deletePatient = vi.fn()

export const getConsultasByPatient = vi.fn()
export const createConsulta = vi.fn()
export const updateConsulta = vi.fn()

export const getVacinasByPatient = vi.fn()
export const createVacina = vi.fn()
export const deleteVacina = vi.fn()

export const getCirurgiasByPatient = vi.fn()
export const createCirurgia = vi.fn()

export const getExamesByPatient = vi.fn()
export const createExame = vi.fn()

export const getAgendamentos = vi.fn()
export const getAgendamentosByPatient = vi.fn()
export const createAgendamento = vi.fn()
export const updateAgendamentoStatus = vi.fn()
export const deleteAgendamento = vi.fn()

export const getEhrDashboardMetrics = vi.fn()
export const linkPetToPatient = vi.fn()
export const genId = vi.fn()
