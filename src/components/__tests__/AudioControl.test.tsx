import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AudioControl from '../AudioControl'

describe('AudioControl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render title', () => {
    render(<AudioControl />)
    expect(screen.getByText('Áudio das TVs')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<AudioControl />)
    expect(screen.getByText(/Controle se os vídeos/)).toBeInTheDocument()
  })

  it('should start unchecked (muted) by default', () => {
    render(<AudioControl />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  it('should toggle mute state when clicked', () => {
    render(<AudioControl />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement

    // Click to unmute
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)

    // Click to mute again
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(false)
  })

  it('should persist mute state to localStorage', () => {
    render(<AudioControl />)
    expect(localStorage.getItem('vethub_video_muted')).toBe('true')
  })

  it('should dispatch storage-sync event on toggle', () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
    render(<AudioControl />)

    fireEvent.click(screen.getByRole('checkbox'))

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event))
    dispatchEventSpy.mockRestore()
  })
})
