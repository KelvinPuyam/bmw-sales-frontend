import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

// Helper: renders Sidebar inside a router so useNavigate/useLocation work
const renderSidebar = (props = {}, initialPath = '/overview') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar logout={props.logout ?? vi.fn()} />
    </MemoryRouter>
  )

describe('Sidebar', () => {
  it('renders the BMW Dashboard title', () => {
    renderSidebar()
    expect(screen.getByText('BMW Dashboard')).toBeInTheDocument()
  })

  it('renders all three nav links', () => {
    renderSidebar()
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('renders a logout button', () => {
    renderSidebar()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('calls the logout callback when the button is clicked', async () => {
    const logout = vi.fn()
    const user = userEvent.setup()
    renderSidebar({ logout })
    await user.click(screen.getByRole('button', { name: /logout/i }))
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('highlights the active route', () => {
    renderSidebar({}, '/analytics')
    const analyticsLink = screen.getByText('Analytics')
    // Active class contains bg-gray-700
    expect(analyticsLink.className).toMatch(/bg-gray-700/)
  })

  it('does not highlight inactive routes', () => {
    renderSidebar({}, '/analytics')
    const overviewLink = screen.getByText('Overview')
    expect(overviewLink.className).not.toMatch(/bg-gray-700/)
  })
})
