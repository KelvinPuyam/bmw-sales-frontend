import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Signup from '../pages/Signup'

vi.mock('../services/authService', () => ({
  signupUser: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import { signupUser } from '../services/authService'

beforeEach(() => vi.clearAllMocks())

const renderSignup = () =>
  render(<MemoryRouter><Signup /></MemoryRouter>)

describe('Signup page', () => {
  it('renders all input fields', () => {
    renderSignup()
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument()
  })

  it('renders the Sign Up button', () => {
    renderSignup()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('renders a link back to login', () => {
    renderSignup()
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
  })

  it('calls signupUser with all form fields on submit', async () => {
    signupUser.mockResolvedValue()
    const user = userEvent.setup()
    renderSignup()

    await user.type(screen.getByPlaceholderText('First Name'), 'Jane')
    await user.type(screen.getByPlaceholderText('Last Name'), 'Doe')
    await user.type(screen.getByPlaceholderText('Username'), 'janedoe')
    await user.type(screen.getByPlaceholderText('Email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'pass123')
    await user.type(screen.getByPlaceholderText('Phone'), '555-1234')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(signupUser).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Jane',
          last_name: 'Doe',
          username: 'janedoe',
          email: 'jane@example.com',
          password: 'pass123',
          phone: '555-1234',
        })
      )
    })
  })

  it('navigates to /login after successful signup', async () => {
    signupUser.mockResolvedValue()
    const user = userEvent.setup()
    renderSignup()
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })
})
