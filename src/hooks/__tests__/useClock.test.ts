import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useClock } from '../useClock'

describe('useClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-25T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial formatted time', () => {
    const { result } = renderHook(() => useClock())
    expect(result.current).toContain('2026')
    expect(result.current).toContain('12:00:00')
  })

  it('should update time after 1 second', () => {
    const { result } = renderHook(() => useClock())
    
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current).toContain('12:00:01')
  })

  it('should update time after 5 seconds', () => {
    const { result } = renderHook(() => useClock())
    
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toContain('12:00:05')
  })

  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = renderHook(() => useClock())
    
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})
