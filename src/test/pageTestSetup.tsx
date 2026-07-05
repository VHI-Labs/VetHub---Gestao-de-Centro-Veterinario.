import { vi } from 'vitest'
import { type ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/**
 * Extract the mock useAuth function after importing.
 * Pass the actual imported useAuth to get the typed mock.
 */
export function asMockAuth(useAuth: unknown) {
  return useAuth as ReturnType<typeof vi.fn>
}

/** Render a page component wrapped in MemoryRouter */
export function renderPage(
  ui: ReactElement,
  initialEntries: string[] = ['/']
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  )
}
