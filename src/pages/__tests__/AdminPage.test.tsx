import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import AdminPage from '../AdminPage'
import { MOCK_USERS } from '../../test/mockFactories'
import { renderPage } from '../../test/pageTestSetup'

// Hoist all mock variables so they're available in vi.mock factories
const { mockNavigate, mockSupabaseSelect, mockSupabaseRpc } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSupabaseSelect: vi.fn(),
  mockSupabaseRpc: vi.fn(),
}))

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock AuthContext (via __mocks__/AuthContext.tsx)
vi.mock('../../context/AuthContext')
import { useAuth } from '../../context/AuthContext'
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'user_profiles') {
        return {
          select: mockSupabaseSelect,
          update: (_data: Record<string, unknown>) => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      }
      return {
        select: mockSupabaseSelect,
        update: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      }
    },
    rpc: mockSupabaseRpc,
  },
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  PawPrint: () => <span>🐾</span>,
  LogOut: () => <span>🚪</span>,
  Shield: () => <span>🛡</span>,
  AlertTriangle: () => <span>⚠</span>,
  RefreshCw: () => <span>🔄</span>,
  UserPlus: () => <span>👤</span>,
  Tv: () => <span>📺</span>,
  ClipboardList: () => <span>📋</span>,
}))

const renderAdminPage = () => renderPage(<AdminPage />, ['/admin'])

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: MOCK_USERS,
        error: null,
      }),
    })
    mockSupabaseRpc.mockResolvedValue({ data: 3, error: null })
  })

  it('should render nothing if not admin', () => {
    mockUseAuth.mockReturnValue({ user: null, role: 'user', signOut: vi.fn() })
    const { container } = renderAdminPage()
    expect(container.innerHTML).toBe('')
  })

  it('should redirect to recepcao if role is not admin after mount', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'user', signOut: vi.fn() })
    renderAdminPage()
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/recepcao')
    })
  })

  it('should render admin panel for admin users', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', email: 'admin@test.com' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('Administração')).toBeInTheDocument()
    })
  })

  it('should show loading state', async () => {
    mockSupabaseSelect.mockReturnValue({
      order: vi.fn().mockReturnValue(new Promise(() => {})),
    })
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('Carregando...')).toBeInTheDocument()
    })
  })

  it('should render user list for admin', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', email: 'admin@test.com' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('admin@vethub.com')).toBeInTheDocument()
      expect(screen.getByText('user@vethub.com')).toBeInTheDocument()
    })
  })

  it('should show admin badge for admin users', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', email: 'admin@test.com' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })
  })

  it('should show permission toggles for regular users', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-2', email: 'user@vethub.com' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('Recepcao')).toBeInTheDocument()
      expect(screen.getByText('Fila')).toBeInTheDocument()
    })
  })

  it('should call signOut when sair clicked', async () => {
    const mockSignOut = vi.fn()
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'admin', signOut: mockSignOut })
    renderAdminPage()

    await waitFor(() => { expect(screen.getByText('Administração')).toBeInTheDocument() })

    fireEvent.click(screen.getByText('Sair'))
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should show auditoria button', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('Auditoria')).toBeInTheDocument()
    })
  })

  it('should show sincronizar button', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('Sincronizar')).toBeInTheDocument()
    })
  })

  it('should call rpc when sincronizar clicked', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => { expect(screen.getByText('Administração')).toBeInTheDocument() })

    fireEvent.click(screen.getByText('Sincronizar'))

    await waitFor(() => {
      expect(mockSupabaseRpc).toHaveBeenCalledWith('sync_missing_profiles')
    })
  })

  it('should show sync result message', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => { expect(screen.getByText('Administração')).toBeInTheDocument() })

    fireEvent.click(screen.getByText('Sincronizar'))

    await waitFor(() => {
      expect(screen.getByText(/3 usuário/)).toBeInTheDocument()
    })
  })

  it('should render unidade selects for users', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, role: 'admin', signOut: vi.fn() })
    renderAdminPage()

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(2)
    })
  })
})
