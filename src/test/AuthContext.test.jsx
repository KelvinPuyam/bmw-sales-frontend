import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth, triggerLogout } from '../context/AuthContext'

// Simple consumer component to expose context values in tests
const TestConsumer = () => {
  const { token, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="token">{token ?? 'none'}</span>
      <button onClick={() => login('test-token-123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

const renderWithAuth = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('AuthContext', () => {
  it('reads existing token from localStorage on mount', () => {
    localStorage.setItem('token', 'existing-token')
    renderWithAuth()
    expect(screen.getByTestId('token').textContent).toBe('existing-token')
  })

  it('shows "none" when no token exists', () => {
    renderWithAuth()
    expect(screen.getByTestId('token').textContent).toBe('none')
  })

  it('login() sets the token in state and localStorage', async () => {
    const user = userEvent.setup()
    renderWithAuth()
    await user.click(screen.getByText('Login'))
    expect(screen.getByTestId('token').textContent).toBe('test-token-123')
    expect(localStorage.getItem('token')).toBe('test-token-123')
  })

  it('logout() clears the token from state and localStorage', async () => {
    localStorage.setItem('token', 'existing-token')
    const user = userEvent.setup()
    renderWithAuth()
    await user.click(screen.getByText('Logout'))
    expect(screen.getByTestId('token').textContent).toBe('none')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('triggerLogout() removes the token', async () => {
    localStorage.setItem('token', 'existing-token')
    const user = userEvent.setup()
    renderWithAuth()
    // First do a login to register logoutHandler
    await user.click(screen.getByText('Login'))
    act(() => triggerLogout())
    expect(screen.getByTestId('token').textContent).toBe('none')
  })
})
