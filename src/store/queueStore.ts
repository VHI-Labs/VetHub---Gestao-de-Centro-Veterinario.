import { create } from 'zustand'
import type { Pet, CallHistoryItem, Species } from '../types'
import { getQueue, getHistory, getCallHistory, getActiveCall } from '../core/engine'

interface QueueState {
  dogs: Pet[]
  cats: Pet[]
  wild: Pet[]
  history: Pet[]
  activeCallDog: Pet | null
  activeCallCat: Pet | null
  activeCallWild: Pet | null
  callHistoryDog: CallHistoryItem[]
  callHistoryCat: CallHistoryItem[]
  callHistoryWild: CallHistoryItem[]
  loading: boolean
  unidade: string
  isAdmin: boolean
  setCampus: (unidade: string, isAdmin: boolean) => void
  refresh: () => Promise<void>
}

let refreshPromise: Promise<void> | null = null

export const useQueueStore = create<QueueState>((set, get) => ({
  dogs: [],
  cats: [],
  wild: [],
  history: [],
  activeCallDog: null,
  activeCallCat: null,
  activeCallWild: null,
  callHistoryDog: [],
  callHistoryCat: [],
  callHistoryWild: [],
  loading: true,
  unidade: '',
  isAdmin: false,
  setCampus: (unidade, isAdmin) => {
    set({ unidade, isAdmin })
    get().refresh()
  },
  refresh: async () => {
    if (refreshPromise) return refreshPromise
    refreshPromise = doRefresh(get, set).finally(() => { refreshPromise = null })
    return refreshPromise
  }
}))

async function doRefresh(
  get: () => QueueState,
  set: (partial: Partial<QueueState>) => void
): Promise<void> {
  const { unidade } = get()
  const u = unidade === "Todos" ? '' : unidade
  const [dogs, cats, wild, history, activeCallDog, activeCallCat, activeCallWild, callHistoryDog, callHistoryCat, callHistoryWild] = await Promise.all([
    getQueue('Cão', u),
    getQueue('Gato', u),
    getQueue('Animais Silvestres', u),
    getHistory(u),
    getActiveCall('Cão', u),
    getActiveCall('Gato', u),
    getActiveCall('Animais Silvestres', u),
    getCallHistory('Cão', u),
    getCallHistory('Gato', u),
    getCallHistory('Animais Silvestres', u),
  ])
  set({
    dogs, cats, wild, history,
    activeCallDog, activeCallCat, activeCallWild,
    callHistoryDog, callHistoryCat, callHistoryWild,
    loading: false
  })
}

export async function loadQueueStore() {
  await useQueueStore.getState().refresh()
}
