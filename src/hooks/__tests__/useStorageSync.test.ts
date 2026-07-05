import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStorageSync } from '../useStorageSync'

// Mock queueStore
const mockRefresh = vi.fn()
vi.mock('../../store/queueStore', () => ({
  useQueueStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ refresh: mockRefresh }),
}))

describe('useStorageSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should add event listeners on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const { unmount } = renderHook(() => useStorageSync())

    expect(addEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('storage-sync', expect.any(Function))

    unmount()
    addEventListenerSpy.mockRestore()
  })

  it('should call refresh when storage event is fired', () => {
    renderHook(() => useStorageSync())

    window.dispatchEvent(new Event('storage'))
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('should call refresh when storage-sync event is fired', () => {
    renderHook(() => useStorageSync())

    window.dispatchEvent(new Event('storage-sync'))
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('should remove event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useStorageSync())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage-sync', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})
