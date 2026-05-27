import { useEffect } from 'react'
import { useQueueStore } from '../store/queueStore'

export function useStorageSync() {
  const refresh = useQueueStore(s => s.refresh)

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('storage', handler)
    window.addEventListener('storage-sync', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('storage-sync', handler)
    }
  }, [refresh])
}
