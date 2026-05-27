import { useState, useEffect } from 'react'

export function useClock() {
  const [time, setTime] = useState(new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }))

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
