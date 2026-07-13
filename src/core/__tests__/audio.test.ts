import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatSenhaForSpeech,
  buildCallSpeechText,
  anunciarPaciente,
  primeAudioSystem,
  initAutomaticAudioSystem,
} from '../audio'

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

describe('anunciarPaciente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Mock speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: vi.fn(),
        speak: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
        onvoiceschanged: null,
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    delete (window as any).speechSynthesis
  })

  it('should not throw with petData (speak may not run in jsdom)', async () => {
    await expect(
      anunciarPaciente({ senha: 'N001', localDirecionado: 'Triagem' }, { senha: '', local: '' })
    ).resolves.not.toThrow()
  })

  it('should not throw with fallback', async () => {
    await expect(anunciarPaciente(null, { senha: 'A001', local: 'Consulta' })).resolves.not.toThrow()
  })

  it('should not throw without speechSynthesis', async () => {
    delete (window as any).speechSynthesis
    await expect(anunciarPaciente(null, {})).resolves.not.toThrow()
  })
})

describe('primeAudioSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: vi.fn(),
        speak: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
        onvoiceschanged: null,
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    delete (window as any).speechSynthesis
  })

  it('should not throw when priming', () => {
    expect(() => primeAudioSystem()).not.toThrow()
  })

  it('should not throw without speechSynthesis', () => {
    delete (window as any).speechSynthesis
    expect(() => primeAudioSystem()).not.toThrow()
  })

  it('should only prime once (no error on second call)', () => {
    primeAudioSystem()
    expect(() => primeAudioSystem()).not.toThrow()
  })
})

describe('initAutomaticAudioSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('addEventListener', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should add event listeners for user interaction', () => {
    initAutomaticAudioSystem()
    expect(window.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), { once: true })
    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), { once: true })
    expect(window.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { once: true })
  })
})
