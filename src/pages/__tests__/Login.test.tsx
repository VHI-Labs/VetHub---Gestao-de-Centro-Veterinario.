import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('lucide-react', () => ({
  Lock: () => <span>🔒</span>,
  Mail: () => <span>📧</span>,
  PawPrint: () => <span>🐾</span>,
  ArrowLeft: () => <span>⬅</span>,
  ChevronDown: () => <span>⬇</span>,
  ChevronUp: () => <span>⬆</span>,
  Shield: () => <span>🛡</span>,
  Stethoscope: () => <span>🩺</span>,
  Receipt: () => <span>🧾</span>,
  User: () => <span>👤</span>,
  Eye: () => <span>👁</span>,
}))

import { useAuth } from '../../context/AuthContext'
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Login />
    </MemoryRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn().mockResolvedValue({ error: null }),
      resetPassword: vi.fn().mockResolvedValue({ error: null }),
    })
  })

  it('should render the login form', () => {
    renderLogin()
    expect(screen.getByText('VetHub')).toBeInTheDocument()
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument()
  })

  it('should have email and password inputs', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
  })

  it('should have submit button', () => {
    renderLogin()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })

  it('should show loading state when authenticating', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      resetPassword: vi.fn(),
    })
    renderLogin()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should show error message on failed login', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn().mockResolvedValue({ error: { message: 'Email ou senha inválidos' } }),
      resetPassword: vi.fn().mockResolvedValue({ error: null }),
    })
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(screen.getByText('Email ou senha inválidos')).toBeInTheDocument()
    })
  })

  it('should show test accounts dropdown', () => {
    renderLogin()
    expect(screen.getByText('Contas de teste disponíveis')).toBeInTheDocument()
  })

  it('should fill credentials when test account is clicked', () => {
    renderLogin()
    fireEvent.click(screen.getByText('Contas de teste disponíveis'))

    // Click on Admin account
    fireEvent.click(screen.getByText('Admin'))

    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
    expect(emailInput.value).toBe('admin@vethub.com.br')
  })

  it('should show forgot password link', () => {
    renderLogin()
    expect(screen.getByText('Esqueceu a senha?')).toBeInTheDocument()
  })

  it('should show reset password modal when clicking forgot password', () => {
    renderLogin()
    fireEvent.click(screen.getByText('Esqueceu a senha?'))
    expect(screen.getByText('Redefinir Senha')).toBeInTheDocument()
    expect(screen.getByText('Enviar')).toBeInTheDocument()
  })

  it('should show success message after password reset', async () => {
    renderLogin()
    fireEvent.click(screen.getByText('Esqueceu a senha?'))

    fireEvent.change(screen.getByPlaceholderText('Seu email'), { target: { value: 'test@test.com' } })
    fireEvent.click(screen.getByText('Enviar'))

    await waitFor(() => {
      expect(screen.getByText('Email enviado! Verifique sua caixa de entrada.')).toBeInTheDocument()
    })
  })

  it('should show error on password reset failure', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      resetPassword: vi.fn().mockResolvedValue({ error: { message: 'Email não encontrado' } }),
    })
    renderLogin()
    fireEvent.click(screen.getByText('Esqueceu a senha?'))

    fireEvent.change(screen.getByPlaceholderText('Seu email'), { target: { value: 'test@test.com' } })
    fireEvent.click(screen.getByText('Enviar'))

    await waitFor(() => {
      expect(screen.getByText('Email não encontrado')).toBeInTheDocument()
    })
  })

  it('should not crash when user is already logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@test.com' },
      loading: false,
      signIn: vi.fn(),
      resetPassword: vi.fn(),
    })

    expect(() => renderLogin()).not.toThrow()
  })
})
