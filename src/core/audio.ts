let hovetAudioPrimed = false
let sharedAudioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume()
  }
  return sharedAudioCtx
}

function formatSenhaForSpeech(senha: string): string {
  const digits: Record<string, string> = {
    '0': 'zero', '1': 'um', '2': 'dois', '3': 'três', '4': 'quatro',
    '5': 'cinco', '6': 'seis', '7': 'sete', '8': 'oito', '9': 'nove'
  }
  return String(senha)
    .replace('-', ' ')
    .split('')
    .map(char => digits[char] || char)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildCallSpeechText(petData: { senha?: string; localDirecionado?: string } | null, fallback: { senha?: string; local?: string }) {
  const senha = formatSenhaForSpeech(petData?.senha || fallback.senha || '')
  const local = String(petData?.localDirecionado || fallback.local || 'Triagem')
  return `Senha ${senha}. Comparecer ao ${local}.`
}

function playGongSound(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audioCtx = getAudioContext()
      const now = audioCtx.currentTime

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        const oscHarmonic = audioCtx.createOscillator()
        const gainHarmonic = audioCtx.createGain()
        oscHarmonic.type = 'sine'
        oscHarmonic.frequency.setValueAtTime(freq * 2, startTime)

        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        gainHarmonic.gain.setValueAtTime(0, startTime)
        gainHarmonic.gain.linearRampToValueAtTime(0.08, startTime + 0.03)
        gainHarmonic.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.5)

        osc.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        oscHarmonic.connect(gainHarmonic)
        gainHarmonic.connect(audioCtx.destination)

        osc.start(startTime)
        oscHarmonic.start(startTime)
        osc.stop(startTime + duration)
        oscHarmonic.stop(startTime + duration)
      }

      playTone(783.99, now, 0.8)
      playTone(659.25, now + 0.35, 1.2)

      setTimeout(() => resolve(), 2000)
    } catch {
      resolve()
    }
  })
}

function speakCall(petData: { senha?: string; localDirecionado?: string } | null, fallback: { senha?: string; local?: string }) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const texto = buildCallSpeechText(petData, fallback)
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'pt-BR'
    utterance.rate = 0.9
    utterance.pitch = 1.1

    const voices = window.speechSynthesis.getVoices()
    const voiceFeminine = voices.find(voice =>
      voice.lang.includes('pt') &&
      (voice.name.toLowerCase().includes('maria') ||
       voice.name.toLowerCase().includes('google') ||
       voice.name.toLowerCase().includes('zira') ||
       voice.name.toLowerCase().includes('luciana') ||
       voice.name.toLowerCase().includes('female'))
    )

    if (voiceFeminine) utterance.voice = voiceFeminine
    window.speechSynthesis.speak(utterance)
  }
}

export async function anunciarPaciente(petData: { senha?: string; localDirecionado?: string } | null, fallback: { senha?: string; local?: string }) {
  await playGongSound()
  setTimeout(() => {
    speakCall(petData, fallback)
  }, 500)
}

export function primeAudioSystem() {
  if (hovetAudioPrimed) return
  hovetAudioPrimed = true

  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
  } catch {
    // ignore
  }

  if ('speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance('')
      utterance.volume = 0
      utterance.lang = 'pt-BR'
      window.speechSynthesis.speak(utterance)
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
  }
}

export function initAutomaticAudioSystem() {
  primeAudioSystem()
  window.addEventListener('click', primeAudioSystem, { once: true })
  window.addEventListener('keydown', primeAudioSystem, { once: true })
  window.addEventListener('touchstart', primeAudioSystem, { once: true })
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices()
  }
}
