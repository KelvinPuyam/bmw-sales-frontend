import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Profile from '../pages/Profile'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

vi.mock('../services/userService', () => ({
  getMe: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}))

import { getMe, updateProfile, changePassword } from '../services/userService'

const mockUser = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  phone: '555-0100',
  dob: '1990-05-15',
  username: 'janedoe',
  role: 'admin',
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  getMe.mockResolvedValue(mockUser)
})

const renderProfile = () =>
  render(<MemoryRouter><Profile /></MemoryRouter>)

describe('Profile page — loading state', () => {
  it('shows loading text before data arrives', () => {
    // Never resolve so we stay in loading state
    getMe.mockReturnValue(new Promise(() => {}))
    renderProfile()
    expect(screen.getByText(/loading profile/i)).toBeInTheDocument()
  })
})

describe('Profile page — loaded state', () => {
  it('renders the profile heading after load', async () => {
    renderProfile()
    await waitFor(() => expect(screen.getByText('Your Profile')).toBeInTheDocument())
  })

  it('populates inputs with user data', async () => {
    renderProfile()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument()
    })
  })

  it('username field is disabled (read-only)', async () => {
    renderProfile()
    await waitFor(() => screen.getByDisplayValue('janedoe'))
    expect(screen.getByDisplayValue('janedoe')).toBeDisabled()
  })

  it('calls updateProfile with current user data on Save', async () => {
    updateProfile.mockResolvedValue()
    const user = userEvent.setup()
    renderProfile()
    await waitFor(() => screen.getByText('Save Changes'))
    await user.click(screen.getByText('Save Changes'))
    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ email: 'jane@example.com' }))
    )
  })

  it('shows alert on successful save', async () => {
    updateProfile.mockResolvedValue()
    const user = userEvent.setup()
    renderProfile()
    await waitFor(() => screen.getByText('Save Changes'))
    await user.click(screen.getByText('Save Changes'))
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Profile updated successfully'))
  })
})

describe('Profile page — Change Password modal', () => {
  it('modal is hidden initially', async () => {
    renderProfile()
    await waitFor(() => screen.getByText('Your Profile'))
    // The modal heading (h3) should not be visible — the "Change Password" button is always in DOM
    expect(screen.queryByRole('heading', { name: 'Change Password' })).not.toBeInTheDocument()
  })

  it('opens the modal when "Change Password" link is clicked', async () => {
    const user = userEvent.setup()
    renderProfile()
    await waitFor(() => screen.getByText('Change Password'))
    await user.click(screen.getByText('Change Password'))
    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument()
  })

  it('closes the modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderProfile()
    await waitFor(() => screen.getByText('Change Password'))
    await user.click(screen.getByText('Change Password'))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('heading', { name: 'Change Password' })).not.toBeInTheDocument()
  })

  it('shows alert and closes modal on successful password change', async () => {
    changePassword.mockResolvedValue()
    const user = userEvent.setup()
    renderProfile()
    await waitFor(() => screen.getByText('Change Password'))
    await user.click(screen.getByText('Change Password'))

    // Fill in matching passwords
    const inputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(inputs[0], 'oldpass')
    await user.type(inputs[1], 'newpass123')
    await user.type(inputs[2], 'newpass123')

    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        old_password: 'oldpass',
        new_password: 'newpass123',
      })
      expect(window.alert).toHaveBeenCalledWith('Password updated successfully')
    })
    expect(screen.queryByRole('heading', { name: 'Change Password' })).not.toBeInTheDocument()
  })

  it('shows alert when new passwords do not match', async () => {
    const user = userEvent.setup()
    renderProfile()
    await waitFor(() => screen.getByText('Change Password'))
    await user.click(screen.getByText('Change Password'))

    const inputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(inputs[1], 'newpass123')
    await user.type(inputs[2], 'different456')

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(window.alert).toHaveBeenCalledWith('Passwords do not match')
    expect(changePassword).not.toHaveBeenCalled()
  })
})
