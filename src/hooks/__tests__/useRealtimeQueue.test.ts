import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRealtimeQueue } from '../useRealtimeQueue'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}))

vi.mock('../../store/queueStore', () => ({
  useQueueStore: {
    getState: vi.fn(),
  },
}))

import { supabase } from '../../lib/supabase'
import { useQueueStore } from '../../store/queueStore'

describe('useRealtimeQueue', () => {
  const mockSubscribe = vi.fn()
  const mockOn = vi.fn()
  const mockChannel = { on: mockOn, subscribe: mockSubscribe }
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    const mockChannelFn = supabase.channel as ReturnType<typeof vi.fn>
    mockChannelFn.mockReturnValue(mockChannel)
    mockOn.mockReturnValue(mockChannel)
    mockSubscribe.mockReturnValue(undefined)
    ;(useQueueStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      refresh: mockRefresh,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a channel on mount', () => {
    renderHook(() => useRealtimeQueue())
    expect(supabase.channel).toHaveBeenCalledWith('queue-changes')
  })

  it('should subscribe to postgres changes on pets table', () => {
    renderHook(() => useRealtimeQueue())
    expect(mockOn).toHaveBeenCalledWith(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pets' },
      expect.any(Function)
    )
  })

  it('should subscribe to postgres changes on call_history table', () => {
    renderHook(() => useRealtimeQueue())
    expect(mockOn).toHaveBeenCalledWith(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'call_history' },
      expect.any(Function)
    )
  })

  it('should call subscribe on the channel', () => {
    renderHook(() => useRealtimeQueue())
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('should call refresh when pets change is received', () => {
    renderHook(() => useRealtimeQueue())
    // Get the callback for pets changes and call it
    const petsCallback = mockOn.mock.calls.find(
      (call: unknown[]) => (call[1] as { table?: string })?.table === 'pets'
    )?.[2]
    petsCallback()
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('should call refresh when call_history change is received', () => {
    renderHook(() => useRealtimeQueue())
    const historyCallback = mockOn.mock.calls.find(
      (call: unknown[]) => (call[1] as { table?: string })?.table === 'call_history'
    )?.[2]
    historyCallback()
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('should remove channel on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeQueue())
    unmount()
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
  })
})
