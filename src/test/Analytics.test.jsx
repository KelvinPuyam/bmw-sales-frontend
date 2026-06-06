import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Analytics from '../pages/Analytics'

// ── Mock recharts so jsdom doesn't choke on SVG canvas ─────────────────────
vi.mock('recharts', () => {
  const Stub = ({ children }) => <div>{children}</div>
  return {
    LineChart: Stub, BarChart: Stub, PieChart: Stub,
    Line: Stub, Bar: Stub, Pie: Stub, Cell: Stub,
    XAxis: Stub, YAxis: Stub, Tooltip: Stub,
    CartesianGrid: Stub, ResponsiveContainer: Stub,
  }
})

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

vi.mock('../services/salesService', () => ({
  getFilters: vi.fn(),
  getSalesByModel: vi.fn(),
  formatEuro: (n) => `€${n}`,
  formatUnits: (n) => `${n}`,
  aggregateByYear: (data) => data,
  aggregateByModel: (data) =>
    Object.values(
      data.reduce((acc, d) => {
        if (!acc[d.model]) acc[d.model] = { name: d.model, value: 0 }
        acc[d.model].value += d.total_units
        return acc
      }, {})
    ),
}))

import { getFilters, getSalesByModel } from '../services/salesService'

const mockFilters = { years: [2022, 2023] }
const mockData = [
  { model: 'X5',       year: 2022, total_revenue: 1_000_000, total_units: 200 },
  { model: '3 Series', year: 2022, total_revenue:   500_000, total_units: 100 },
  { model: 'X5',       year: 2023, total_revenue: 1_200_000, total_units: 220 },
]

beforeEach(() => {
  vi.clearAllMocks()
  getFilters.mockResolvedValue(mockFilters)
  getSalesByModel.mockResolvedValue(mockData)
})

const renderAnalytics = () =>
  render(<MemoryRouter><Analytics /></MemoryRouter>)

describe('Analytics page', () => {
  it('renders the page title', async () => {
    renderAnalytics()
    await waitFor(() => expect(screen.getByText('Sales Analytics')).toBeInTheDocument())
  })

  it('renders all four chart section headings', async () => {
    renderAnalytics()
    await waitFor(() => {
      expect(screen.getByText('Revenue Trend')).toBeInTheDocument()
      expect(screen.getByText('Units Trend')).toBeInTheDocument()
      expect(screen.getByText('Model Distribution')).toBeInTheDocument()
      expect(screen.getByText('Revenue vs Units')).toBeInTheDocument()
    })
  })

  it('renders the Model Distribution year dropdown', async () => {
    renderAnalytics()
    await waitFor(() => screen.getByText('Model Distribution'))
    // The local pie filter dropdown (value-controlled, not the Header one)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(1)
  })

  it('dropdown contains All option plus each filter year', async () => {
    renderAnalytics()
    await waitFor(() => screen.getByText('Model Distribution'))
    const options = screen.getAllByRole('option')
    const labels = options.map((o) => o.textContent)
    expect(labels).toContain('All')
    expect(labels).toContain('2022')
    expect(labels).toContain('2023')
  })

  it('calls getSalesByModel and getFilters on mount', async () => {
    renderAnalytics()
    await waitFor(() => {
      expect(getSalesByModel).toHaveBeenCalledTimes(1)
      expect(getFilters).toHaveBeenCalledTimes(1)
    })
  })

  it('changing the year dropdown updates the selected value', async () => {
    const user = userEvent.setup()
    renderAnalytics()
    await waitFor(() => screen.getByText('Model Distribution'))

    const select = screen.getAllByRole('combobox')[0]
    await user.selectOptions(select, '2022')
    expect(select.value).toBe('2022')
  })
})
