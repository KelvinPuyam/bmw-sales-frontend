import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Overview from '../pages/Overview'

// ── Mock deps ──────────────────────────────────────────────────────────────
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

vi.mock('../services/salesService', () => ({
  getFilters: vi.fn(),
  getSalesByYear: vi.fn(),
  getSalesByModel: vi.fn(),
  formatNumber: (n) => (n ? n.toLocaleString() : '-'),
}))

import { getFilters, getSalesByYear, getSalesByModel } from '../services/salesService'

const mockSummary = [
  { total_units: 120000, total_revenue: 5000000000, avg_price_eur: 41666, avg_bev_share: 22 },
]
const mockModels = [
  { model: '3 Series', year: 2023, total_units: 60000, total_revenue: 2400000000, avg_price_eur: 40000 },
  { model: 'X5',       year: 2023, total_units: 30000, total_revenue: 1800000000, avg_price_eur: 60000 },
]
const mockFilters = { years: [2021, 2022, 2023] }

beforeEach(() => {
  vi.clearAllMocks()
  getFilters.mockResolvedValue(mockFilters)
  getSalesByYear.mockResolvedValue(mockSummary)
  getSalesByModel.mockResolvedValue(mockModels)
})

const renderOverview = () =>
  render(<MemoryRouter><Overview /></MemoryRouter>)

describe('Overview page', () => {
  it('renders the page title', async () => {
    renderOverview()
    await waitFor(() => expect(screen.getByText('Sales Overview')).toBeInTheDocument())
  })

  it('shows KPI cards after data loads', async () => {
    renderOverview()
    await waitFor(() => {
      // All KPI titles also appear as table headers, so use getAllByText
      // and just confirm at least 1 (the card) is rendered
      expect(screen.getAllByText('Total Units').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Revenue (€)').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Avg Price (€)').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('BEV Share (%)').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders model rows in the table', async () => {
    renderOverview()
    await waitFor(() => {
      expect(screen.getByText('3 Series')).toBeInTheDocument()
      expect(screen.getByText('X5')).toBeInTheDocument()
    })
  })

  it('filters the model table by search input', async () => {
    const user = userEvent.setup()
    renderOverview()
    await waitFor(() => screen.getByText('3 Series'))

    await user.type(screen.getByPlaceholderText('Search model...'), 'X5')

    expect(screen.queryByText('3 Series')).not.toBeInTheDocument()
    expect(screen.getByText('X5')).toBeInTheDocument()
  })

  it('shows "No results" when search matches nothing', async () => {
    const user = userEvent.setup()
    renderOverview()
    await waitFor(() => screen.getByText('3 Series'))

    await user.type(screen.getByPlaceholderText('Search model...'), 'Z9 NonExistent')

    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('does not show KPI cards when summary is empty', async () => {
    getSalesByYear.mockResolvedValue([])
    renderOverview()
    // Wait for the table to load so we know rendering is done
    await waitFor(() => screen.getByText('3 Series'))
    expect(screen.queryByText('Total Units')).not.toBeInTheDocument()
  })

  it('refetches data when a year is selected from the dropdown', async () => {
    const user = userEvent.setup()
    renderOverview()
    await waitFor(() => screen.getByText('Sales Overview'))

    const dropdown = screen.getByRole('combobox')
    await user.selectOptions(dropdown, '2022')

    await waitFor(() => {
      // getSalesByYear called at least twice: initial load + year change
      expect(getSalesByYear).toHaveBeenCalledTimes(2)
      expect(getSalesByYear).toHaveBeenCalledWith('2022')
    })
  })
})
