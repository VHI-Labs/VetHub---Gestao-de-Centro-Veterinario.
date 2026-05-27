import { useState, useEffect } from 'react'

export function useWaitTimer(dataHora: string) {
  const [label, setLabel] = useState('Aguardando...')

  useEffect(() => {
    function update() {
      const diffMs = Date.now() - new Date(dataHora).getTime()
      const totalSeconds = Math.floor(diffMs / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      setLabel(`Aguardando há ${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [dataHora])

  return label
}
