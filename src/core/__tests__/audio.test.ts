import { describe, it, expect } from 'vitest'
import { formatSenhaForSpeech, buildCallSpeechText } from '../audio'

describe('formatSenhaForSpeech', () => {
  it('should convert digits to spoken words', () => {
    expect(formatSenhaForSpeech('N001')).toBe('N zero zero um')
  })

  it('should replace hyphen with space', () => {
    expect(formatSenhaForSpeech('N-001')).toBe('N zero zero um')
  })

  it('should handle multiple digits', () => {
    expect(formatSenhaForSpeech('123')).toBe('um dois três')
  })

  it('should handle all digits 0-9', () => {
    expect(formatSenhaForSpeech('0123456789')).toBe('zero um dois três quatro cinco seis sete oito nove')
  })

  it('should preserve letters (case preserved)', () => {
    expect(formatSenhaForSpeech('ABC')).toBe('A B C')
  })

  it('should trim extra whitespace', () => {
    expect(formatSenhaForSpeech('N  -  123')).toBe('N um dois três')
  })

  it('should handle empty string', () => {
    expect(formatSenhaForSpeech('')).toBe('')
  })

  it('should handle string with only hyphens', () => {
    expect(formatSenhaForSpeech('--')).toBe('-')
  })
})

describe('buildCallSpeechText', () => {
  it('should build speech text from petData', () => {
    const petData = { senha: 'N-001', localDirecionado: 'Triagem' }
    const result = buildCallSpeechText(petData, { senha: '', local: '' })
    expect(result).toBe('Senha N zero zero um. Comparecer ao Triagem.')
  })

  it('should use fallback when petData is null', () => {
    const fallback = { senha: 'A-001', local: 'Consulta' }
    const result = buildCallSpeechText(null, fallback)
    expect(result).toBe('Senha A zero zero um. Comparecer ao Consulta.')
  })

  it('should default local to Triagem when no local is provided', () => {
    const fallback = { senha: 'N001' }
    const result = buildCallSpeechText(null, fallback)
    expect(result).toContain('Comparecer ao Triagem.')
  })

  it('should use empty string for senha when nothing is provided', () => {
    const fallback = {}
    const result = buildCallSpeechText(null, fallback)
    expect(result).toBe('Senha . Comparecer ao Triagem.')
  })

  it('should prefer petData over fallback', () => {
    const petData = { senha: 'N-001', localDirecionado: 'Triagem' }
    const fallback = { senha: 'A-999', local: 'Consulta' }
    const result = buildCallSpeechText(petData, fallback)
    expect(result).toBe('Senha N zero zero um. Comparecer ao Triagem.')
  })
})
