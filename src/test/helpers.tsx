import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { type Mock, vi } from 'vitest'

/** Custom render with Router provider */
export function renderWithRouter(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    ...renderOptions
  }: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    )
  }
  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

/** Create a mock navigate function */
export function mockNavigate() {
  return vi.fn()
}

/** Create a mock for useAuth hook return */
export function mockUseAuth(overrides: Record<string, unknown> = {}) {
  return {
    user: null,
    role: null,
    unidade: null,
    funcoes: [],
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
    ...overrides,
  }
}

/** Type helper for mocked functions */
export type MockedFn = Mock
