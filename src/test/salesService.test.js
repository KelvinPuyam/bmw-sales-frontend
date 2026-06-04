import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  formatNumber,
  formatEuro,
  formatUnits,
  aggregateByYear,
  aggregateByModel,
  getFilters,
  getSalesByYear,
  getSalesByModel,
} from '../services/salesService'

// ─── Pure formatter tests ────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats numbers with locale separators', () => {
    expect(formatNumber(1234567)).toBe('12,34,567')
  })
  it('returns "-" for falsy values', () => {
    expect(formatNumber(0)).toBe('-')
    expect(formatNumber(null)).toBe('-')
    expect(formatNumber(undefined)).toBe('-')
  })
})

describe('formatEuro', () => {
  it('formats billions', () => {
    expect(formatEuro(2_500_000_000)).toBe('€2.5B')
  })
  it('formats millions', () => {
    expect(formatEuro(3_200_000)).toBe('€3.2M')
  })
  it('formats thousands', () => {
    expect(formatEuro(45_000)).toBe('€45.0K')
  })
  it('formats small numbers with € prefix', () => {
    expect(formatEuro(500)).toBe('€500')
  })
})

describe('formatUnits', () => {
  it('formats millions', () => {
    expect(formatUnits(2_000_000)).toBe('2.0M')
  })
  it('formats thousands', () => {
    expect(formatUnits(15_000)).toBe('15.0K')
  })
  it('returns raw number when under 1000', () => {
    expect(formatUnits(999)).toBe(999)
  })
})

// ─── Aggregation tests ───────────────────────────────────────────────────────

describe('aggregateByYear', () => {
  const rawData = [
    { year: 2022, model: '3 Series', total_revenue: 1_000_000, total_units: 100 },
    { year: 2022, model: '5 Series', total_revenue: 2_000_000, total_units: 150 },
    { year: 2023, model: '3 Series', total_revenue: 1_500_000, total_units: 120 },
  ]

  it('sums revenue and units per year', () => {
    const result = aggregateByYear(rawData)
    const yr2022 = result.find((r) => r.year === 2022)
    expect(yr2022.revenue).toBe(3_000_000)
    expect(yr2022.units).toBe(250)
  })

  it('produces one entry per unique year', () => {
    const result = aggregateByYear(rawData)
    expect(result).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(aggregateByYear([])).toHaveLength(0)
  })
})

describe('aggregateByModel', () => {
  const rawData = [
    { model: 'X5', total_units: 200 },
    { model: 'X5', total_units: 300 },
    { model: 'M3', total_units: 100 },
  ]

  it('sums units per model', () => {
    const result = aggregateByModel(rawData)
    const x5 = result.find((r) => r.name === 'X5')
    expect(x5.value).toBe(500)
  })

  it('produces one entry per unique model', () => {
    const result = aggregateByModel(rawData)
    expect(result).toHaveLength(2)
  })
})

// ─── API call tests (mocked) ─────────────────────────────────────────────────

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '../api/axios'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getFilters', () => {
  it('calls /sales/filters and returns data', async () => {
    api.get.mockResolvedValue({ data: { years: [2020, 2021, 2022] } })
    const result = await getFilters()
    expect(api.get).toHaveBeenCalledWith('/sales/filters')
    expect(result.years).toContain(2021)
  })
})

describe('getSalesByYear', () => {
  it('passes year param when provided', async () => {
    api.get.mockResolvedValue({ data: [] })
    await getSalesByYear(2022)
    expect(api.get).toHaveBeenCalledWith('/sales/by-year', { params: { year: 2022 } })
  })

  it('passes undefined when no year given', async () => {
    api.get.mockResolvedValue({ data: [] })
    await getSalesByYear(null)
    expect(api.get).toHaveBeenCalledWith('/sales/by-year', { params: { year: undefined } })
  })
})

describe('getSalesByModel', () => {
  it('calls /sales/by-model with correct params', async () => {
    api.get.mockResolvedValue({ data: [] })
    await getSalesByModel(2023)
    expect(api.get).toHaveBeenCalledWith('/sales/by-model', { params: { year: 2023 } })
  })
})
