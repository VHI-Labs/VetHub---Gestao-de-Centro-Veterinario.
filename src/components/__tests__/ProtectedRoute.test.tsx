import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'

// Mock the auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../context/AuthContext'
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: true })
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<ProtectedRoute><div>Conteúdo Protegido</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should redirect to / when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false })
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Página Inicial</div>} />
          <Route path="/admin" element={<ProtectedRoute><div>Conteúdo Protegido</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Página Inicial')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument()
  })

  it('should render children when authenticated (no admin required)', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'user', loading: false })
    
    render(
      <MemoryRouter initialEntries={['/recepcao']}>
        <Routes>
          <Route path="/recepcao" element={<ProtectedRoute><div>Conteúdo Protegido</div></ProtectedRoute>} />
          <Route path="/" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument()
  })

  it('should redirect non-admin to /recepcao when requireAdmin is true', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'user', loading: false })
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/recepcao" element={<div>Recepção</div>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><div>Admin</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Recepção')).toBeInTheDocument()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('should allow admin user when requireAdmin is true', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'admin', loading: false })
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/recepcao" element={<div>Recepção</div>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><div>Painel Admin</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Painel Admin')).toBeInTheDocument()
    expect(screen.queryByText('Recepção')).not.toBeInTheDocument()
  })
})
