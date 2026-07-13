import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useQueueStore } from '../store/queueStore'

export function useRealtimeQueue() {
  useEffect(() => {
    const channel = supabase
      .channel('queue-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pets' }, () => {
        useQueueStore.getState().refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'call_history' }, () => {
        useQueueStore.getState().refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
