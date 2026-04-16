import { describe, expect, it } from 'vitest'
import { BrandProfileSchema, UpsertBrandProfileSchema, BrandProfileStatsSchema } from '../brand.js'

const iso = '2024-01-15T12:00:00.000Z'

describe('BrandProfileSchema', () => {
  it('parses valid brand profile', () => {
    const profile = BrandProfileSchema.parse({
      id: 'abc123',
      userId: 'user-1',
      brandName: 'Acme Corp',
      contactEmail: 'contact@acme.com',
      contactPhone: '+91 98765 43210',
      notes: 'Good payer, always on time',
      createdAt: iso,
      updatedAt: iso,
    })
    expect(profile.brandName).toBe('Acme Corp')
    expect(profile.contactEmail).toBe('contact@acme.com')
    expect(profile.notes).toBe('Good payer, always on time')
  })

  it('accepts null contact fields', () => {
    const profile = BrandProfileSchema.parse({
      id: 'x',
      userId: 'u',
      brandName: 'B',
      contactEmail: null,
      contactPhone: null,
      notes: null,
      createdAt: iso,
      updatedAt: iso,
    })
    expect(profile.contactEmail).toBeNull()
    expect(profile.contactPhone).toBeNull()
    expect(profile.notes).toBeNull()
  })

  it('rejects missing required fields', () => {
    expect(() => BrandProfileSchema.parse({ brandName: 'X' })).toThrow()
  })
})

describe('UpsertBrandProfileSchema', () => {
  it('allows empty body (all optional)', () => {
    expect(UpsertBrandProfileSchema.parse({})).toEqual({})
  })

  it('validates email format', () => {
    expect(() => UpsertBrandProfileSchema.parse({ contactEmail: 'notanemail' })).toThrow()
  })

  it('accepts valid email', () => {
    const result = UpsertBrandProfileSchema.parse({ contactEmail: 'brand@example.com' })
    expect(result.contactEmail).toBe('brand@example.com')
  })

  it('allows null to clear email', () => {
    const result = UpsertBrandProfileSchema.parse({ contactEmail: null })
    expect(result.contactEmail).toBeNull()
  })

  it('rejects phone over 50 chars', () => {
    expect(() => UpsertBrandProfileSchema.parse({ contactPhone: 'x'.repeat(51) })).toThrow()
  })

  it('accepts valid phone', () => {
    const result = UpsertBrandProfileSchema.parse({ contactPhone: '+91 98765 43210' })
    expect(result.contactPhone).toBe('+91 98765 43210')
  })

  it('allows null to clear phone', () => {
    expect(UpsertBrandProfileSchema.parse({ contactPhone: null })).toEqual({
      contactPhone: null,
    })
  })

  it('rejects notes over 5000 chars', () => {
    expect(() => UpsertBrandProfileSchema.parse({ notes: 'x'.repeat(5001) })).toThrow()
  })
})

describe('BrandProfileStatsSchema', () => {
  it('parses valid stats', () => {
    const stats = BrandProfileStatsSchema.parse({
      totalDeals: 5,
      overduePaymentsCount: 2,
      contractedTotals: [{ currency: 'INR', amount: 50000 }],
    })
    expect(stats.totalDeals).toBe(5)
    expect(stats.overduePaymentsCount).toBe(2)
    expect(stats.contractedTotals).toHaveLength(1)
  })

  it('parses stats with zero values', () => {
    const stats = BrandProfileStatsSchema.parse({
      totalDeals: 0,
      overduePaymentsCount: 0,
      contractedTotals: [],
    })
    expect(stats.totalDeals).toBe(0)
  })

  it('rejects negative totalDeals', () => {
    expect(() =>
      BrandProfileStatsSchema.parse({
        totalDeals: -1,
        overduePaymentsCount: 0,
        contractedTotals: [],
      }),
    ).toThrow()
  })

  it('rejects negative overduePaymentsCount', () => {
    expect(() =>
      BrandProfileStatsSchema.parse({
        totalDeals: 0,
        overduePaymentsCount: -1,
        contractedTotals: [],
      }),
    ).toThrow()
  })

  it('parses multi-currency contracted totals', () => {
    const stats = BrandProfileStatsSchema.parse({
      totalDeals: 3,
      overduePaymentsCount: 0,
      contractedTotals: [
        { currency: 'INR', amount: 100000 },
        { currency: 'USD', amount: 500 },
      ],
    })
    expect(stats.contractedTotals).toHaveLength(2)
  })
})
