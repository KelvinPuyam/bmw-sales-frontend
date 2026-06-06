import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

describe('Footer', () => {
  it('renders the BMW copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/BMW Data from/i)).toBeInTheDocument()
  })

  it('includes the current year', () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })

  it('renders a Kaggle link with correct href', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /kaggle/i })
    expect(link).toHaveAttribute('href', 'https://www.kaggle.com/datasets?tags=11105-Education')
  })

  it('opens the Kaggle link in a new tab', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /kaggle/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
