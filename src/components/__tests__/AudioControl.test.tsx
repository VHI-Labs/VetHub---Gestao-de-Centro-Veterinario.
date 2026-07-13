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

  it('should start checked (unmuted) by default', () => {
    render(<AudioControl />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    // Initial muted=false, so checkbox checked={!false}={true}
    expect(checkbox.checked).toBe(true)
  })

  it('should toggle mute state when clicked', () => {
    render(<AudioControl />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement

    // Initially unmuted (checked)
    expect(checkbox.checked).toBe(true)

    // Click to mute
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(false)

    // Click to unmute again
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('should persist mute state to localStorage', () => {
    render(<AudioControl />)
    // Initially muted=false, so localStorage should be 'false'
    expect(localStorage.getItem('vethub_video_muted')).toBe('false')
  })

  it('should dispatch storage-sync event on toggle', () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
    render(<AudioControl />)

    fireEvent.click(screen.getByRole('checkbox'))

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event))
    dispatchEventSpy.mockRestore()
  })
})
