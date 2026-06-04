import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '../components/Card'

describe('Card', () => {
  it('renders the title', () => {
    render(<Card title="Total Sales" value="€12.3M" />)
    expect(screen.getByText('Total Sales')).toBeInTheDocument()
  })

  it('renders the value', () => {
    render(<Card title="Total Sales" value="€12.3M" />)
    expect(screen.getByText('€12.3M')).toBeInTheDocument()
  })

  it('renders numeric values as strings', () => {
    render(<Card title="Units Sold" value={42000} />)
    expect(screen.getByText('42000')).toBeInTheDocument()
  })

  it('renders nothing for value when value is empty string', () => {
    render(<Card title="Empty Card" value="" />)
    const heading = screen.getByRole('heading')
    expect(heading.textContent).toBe('')
  })
})
