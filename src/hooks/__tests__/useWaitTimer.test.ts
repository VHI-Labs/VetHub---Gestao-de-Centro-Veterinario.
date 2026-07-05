import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWaitTimer } from '../useWaitTimer'

describe('useWaitTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-25T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should show "Aguardando..." initially right at the start time', () => {
    const now = new Date('2026-06-25T12:00:00')
    const { result } = renderHook(() => useWaitTimer(now.toISOString()))
    expect(result.current).toContain('Aguardando')
  })

  it('should show elapsed time format after some seconds', () => {
    const past = new Date('2026-06-25T11:59:50')
    const { result } = renderHook(() => useWaitTimer(past.toISOString()))
    
    act(() => {
      vi.advanceTimersByTime(11000)
    })

    expect(result.current).toContain('Aguardando há')
  })

  it('should handle undefined dataHora with defaults', () => {
    const { result } = renderHook(() => useWaitTimer(undefined as unknown as string))
    expect(result.current).toBeDefined()
  })

  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = renderHook(() => useWaitTimer(new Date().toISOString()))
    
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})
