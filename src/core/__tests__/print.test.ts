import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { triggerPrintPrescription } from '../print'
import type { Pet } from '../../types'

describe('triggerPrintPrescription', () => {
  const mockPet: Pet = {
    id: 'pet-1',
    senha: 'N001',
    especie: 'Cão',
    tipoAtendimento: 'Pronto Atendimento',
    prioridade: 'Vermelho',
    status: 'Chamado',
    localDirecionado: 'UTI',
    dataHora: '2026-06-25T10:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.print
    window.print = vi.fn()
    // Clear any previous print areas
    const existing = document.getElementById('print-area-wrapper')
    if (existing) existing.remove()
  })

  afterEach(() => {
    const existing = document.getElementById('print-area-wrapper')
    if (existing) existing.remove()
  })

  it('should create print-area-wrapper if not exists', () => {
    expect(document.getElementById('print-area-wrapper')).toBeNull()
    triggerPrintPrescription(mockPet)
    expect(document.getElementById('print-area-wrapper')).not.toBeNull()
  })

  it('should reuse existing print-area-wrapper', () => {
    const wrapper = document.createElement('div')
    wrapper.id = 'print-area-wrapper'
    document.body.appendChild(wrapper)
    expect(document.getElementById('print-area-wrapper')).toBe(wrapper)
    triggerPrintPrescription(mockPet)
    expect(document.getElementById('print-area-wrapper')).toBe(wrapper)
  })

  it('should call window.print', () => {
    triggerPrintPrescription(mockPet)
    expect(window.print).toHaveBeenCalledTimes(1)
  })

  it('should include pet senha in print content', () => {
    triggerPrintPrescription(mockPet)
    const wrapper = document.getElementById('print-area-wrapper')
    expect(wrapper!.innerHTML).toContain('N001')
  })

  it('should include pet especie in print content', () => {
    triggerPrintPrescription(mockPet)
    const wrapper = document.getElementById('print-area-wrapper')
    expect(wrapper!.innerHTML).toContain('Cão')
  })

  it('should include pet prioridade in print content', () => {
    triggerPrintPrescription(mockPet)
    const wrapper = document.getElementById('print-area-wrapper')
    expect(wrapper!.innerHTML).toContain('VERMELHO')
  })

  it('should include localDirecionado in print content', () => {
    triggerPrintPrescription(mockPet)
    const wrapper = document.getElementById('print-area-wrapper')
    expect(wrapper!.innerHTML).toContain('UTI')
  })

  it('should include print-header class', () => {
    triggerPrintPrescription(mockPet)
    const wrapper = document.getElementById('print-area-wrapper')
    expect(wrapper!.innerHTML).toContain('print-header')
  })

  it('should include print-footer section', () => {
    triggerPrintPrescription(mockPet)
    const wrapper = document.getElementById('print-area-wrapper')
    expect(wrapper!.innerHTML).toContain('print-footer')
  })

  it('should handle cleanText fallback for missing fields', () => {
    const incompletePet: Pet = {
      id: 'pet-2',
      senha: '',
      especie: 'Cão',
      tipoAtendimento: '',
      prioridade: 'Verde',
      status: 'Aguardando',
      localDirecionado: '',
      dataHora: '2026-06-25T10:00:00Z',
    }
    triggerPrintPrescription(incompletePet)
    const wrapper = document.getElementById('print-area-wrapper')
    expect(wrapper!.innerHTML).toContain('Não informado')
  })

  it('should format the date in Brazilian format', () => {
    triggerPrintPrescription(mockPet)
    const wrapper = document.getElementById('print-area-wrapper')
    expect(wrapper!.innerHTML).toContain('25/06/2026')
  })
})
