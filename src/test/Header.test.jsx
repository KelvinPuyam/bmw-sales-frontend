import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../components/Header'

describe('Header', () => {
  it('renders the title', () => {
    render(<Header title="Sales Overview" />)
    expect(screen.getByText('Sales Overview')).toBeInTheDocument()
  })

  it('does not render dropdown when filters is absent', () => {
    render(<Header title="Overview" />)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('does not render dropdown when filters.years is absent', () => {
    render(<Header title="Overview" filters={{}} setSelectedYear={vi.fn()} />)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('renders year dropdown when filters and setSelectedYear are provided', () => {
    render(
      <Header
        title="Overview"
        filters={{ years: [2021, 2022, 2023] }}
        setSelectedYear={vi.fn()}
      />
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('lists all years plus the "All Years" option', () => {
    render(
      <Header
        title="Overview"
        filters={{ years: [2021, 2022, 2023] }}
        setSelectedYear={vi.fn()}
      />
    )
    expect(screen.getAllByRole('option')).toHaveLength(4) // "All Years" + 3 years
  })

  it('calls setSelectedYear when a year is chosen', async () => {
    const setSelectedYear = vi.fn()
    const user = userEvent.setup()
    render(
      <Header
        title="Overview"
        filters={{ years: [2021, 2022] }}
        setSelectedYear={setSelectedYear}
      />
    )
    await user.selectOptions(screen.getByRole('combobox'), '2022')
    expect(setSelectedYear).toHaveBeenCalledWith('2022')
  })
})
