import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VideoManager from '../VideoManager'

vi.mock('../../core/engine', () => ({
  getTvVideos: vi.fn(),
  addTvVideo: vi.fn(),
  removeTvVideo: vi.fn(),
  extractYoutubeId: vi.fn(),
}))

import { getTvVideos, addTvVideo, removeTvVideo, extractYoutubeId } from '../../core/engine'
const mockGetVideos = getTvVideos as ReturnType<typeof vi.fn>
const mockAddVideo = addTvVideo as ReturnType<typeof vi.fn>
const mockRemoveVideo = removeTvVideo as ReturnType<typeof vi.fn>
const mockExtractId = extractYoutubeId as ReturnType<typeof vi.fn>

function renderVideoManager() {
  return render(
    <MemoryRouter>
      <VideoManager />
    </MemoryRouter>
  )
}

describe('VideoManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetVideos.mockResolvedValue([])
    mockAddVideo.mockResolvedValue({ id: 'tv-1', youtubeUrl: 'https://youtube.com/watch?v=test123', ordem: 0 })
    mockExtractId.mockImplementation((url: string) => {
      if (url.includes('youtube') || url.includes('youtu.be')) return 'test123'
      return null
    })
  })

  it('should render title', async () => {
    renderVideoManager()
    await waitFor(() => {
      expect(screen.getByText('Playlist de Vídeos')).toBeInTheDocument()
    })
  })

  it('should show empty status when no videos', async () => {
    renderVideoManager()
    await waitFor(() => {
      expect(screen.getByText(/Nenhum vídeo na playlist/)).toBeInTheDocument()
    })
  })

  it('should call addTvVideo on form submit', async () => {
    renderVideoManager()
    const input = screen.getByPlaceholderText(/https:\/\/www.youtube.com/)
    fireEvent.change(input, { target: { value: 'https://youtu.be/test123' } })
    fireEvent.click(screen.getByText('+ Adicionar'))

    await waitFor(() => {
      expect(mockAddVideo).toHaveBeenCalled()
    })
  })

  it('should show error for invalid URL', async () => {
    mockExtractId.mockReturnValue(null)
    renderVideoManager()
    const input = screen.getByPlaceholderText(/https:\/\/www.youtube.com/)
    fireEvent.change(input, { target: { value: 'invalid-url' } })
    fireEvent.click(screen.getByText('+ Adicionar'))

    await waitFor(() => {
      expect(screen.getByText('Link do YouTube inválido.')).toBeInTheDocument()
    })
  })

  it('should render video list when videos exist', async () => {
    mockGetVideos.mockResolvedValue([
      { id: 'tv-1', youtubeUrl: 'https://youtube.com/watch?v=abc123', ordem: 0 },
      { id: 'tv-2', youtubeUrl: 'https://youtu.be/def456', ordem: 1 },
    ])
    renderVideoManager()
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('should call removeTvVideo when remove button is clicked', async () => {
    mockGetVideos.mockResolvedValue([
      { id: 'tv-1', youtubeUrl: 'https://youtube.com/watch?v=abc123', ordem: 0 },
    ])
    renderVideoManager()
    
    await waitFor(() => {
      const removeButtons = screen.getAllByTitle('Remover')
      expect(removeButtons.length).toBeGreaterThan(0)
      fireEvent.click(removeButtons[0])
    })

    expect(mockRemoveVideo).toHaveBeenCalledWith('tv-1')
  })
})
