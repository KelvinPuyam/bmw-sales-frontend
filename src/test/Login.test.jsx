import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// Mock the auth context
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

// Mock the auth service
vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
}))

import { loginUser } from '../services/authService'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  vi.clearAllMocks()
})

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

describe('Login page', () => {
  it('renders username and password inputs', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('renders a login button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('renders a link to the signup page', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })

  it('calls loginUser and navigates on successful login', async () => {
    loginUser.mockResolvedValue('jwt-token')
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'alice')
    await user.type(screen.getByPlaceholderText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({ username: 'alice', password: 'secret' })
      expect(mockLogin).toHaveBeenCalledWith('jwt-token')
      expect(mockNavigate).toHaveBeenCalledWith('/overview')
    })
  })

  it('shows "Invalid username or password" on 401', async () => {
    loginUser.mockRejectedValue({ response: { status: 401 } })
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText('Username'), 'bad')
    await user.type(screen.getByPlaceholderText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() =>
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument()
    )
  })

  it('shows "Network error" when there is no response object', async () => {
    loginUser.mockRejectedValue(new Error('Network Error'))
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() =>
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    )
  })

  it('clears the error message while typing', async () => {
    loginUser.mockRejectedValue({ response: { status: 401 } })
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => screen.getByText('Invalid username or password'))

    await user.type(screen.getByPlaceholderText('Username'), 'a')
    expect(screen.queryByText('Invalid username or password')).not.toBeInTheDocument()
  })
})
