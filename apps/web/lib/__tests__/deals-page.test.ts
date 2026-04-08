import { describe, expect, it } from 'vitest'
import { isDealsNeedsAttentionFilter, getDealStatusFilter, computeStatusCounts } from '@/lib/deals-page'
import type { Deal } from '@oompa/types'

describe('isDealsNeedsAttentionFilter', () => {
  it('is true when needsAttention is the string true or 1', () => {
    expect(isDealsNeedsAttentionFilter({ needsAttention: 'true' })).toBe(true)
    expect(isDealsNeedsAttentionFilter({ needsAttention: '1' })).toBe(true)
  })

  it('is true when needsAttention is a single-element array', () => {
    expect(isDealsNeedsAttentionFilter({ needsAttention: ['true'] })).toBe(true)
    expect(isDealsNeedsAttentionFilter({ needsAttention: ['1'] })).toBe(true)
  })

  it('is false when absent, false, or other strings', () => {
    expect(isDealsNeedsAttentionFilter({})).toBe(false)
    expect(isDealsNeedsAttentionFilter({ needsAttention: undefined })).toBe(false)
    expect(isDealsNeedsAttentionFilter({ needsAttention: 'false' })).toBe(false)
    expect(isDealsNeedsAttentionFilter({ needsAttention: 'yes' })).toBe(false)
  })

  it('uses first value when needsAttention is an array', () => {
    expect(isDealsNeedsAttentionFilter({ needsAttention: ['true', 'false'] })).toBe(true)
    expect(isDealsNeedsAttentionFilter({ needsAttention: ['false', 'true'] })).toBe(false)
  })
})

describe('getDealStatusFilter', () => {
  it('returns null when status param is absent', () => {
    expect(getDealStatusFilter({})).toBeNull()
    expect(getDealStatusFilter({ status: undefined })).toBeNull()
  })

  it('returns the DealStatus when valid', () => {
    expect(getDealStatusFilter({ status: 'ACTIVE' })).toBe('ACTIVE')
    expect(getDealStatusFilter({ status: 'DRAFT' })).toBe('DRAFT')
    expect(getDealStatusFilter({ status: 'NEGOTIATING' })).toBe('NEGOTIATING')
    expect(getDealStatusFilter({ status: 'DELIVERED' })).toBe('DELIVERED')
    expect(getDealStatusFilter({ status: 'PAID' })).toBe('PAID')
    expect(getDealStatusFilter({ status: 'CANCELLED' })).toBe('CANCELLED')
  })

  it('returns null for unknown or invalid status values', () => {
    expect(getDealStatusFilter({ status: 'UNKNOWN' })).toBeNull()
    expect(getDealStatusFilter({ status: 'active' })).toBeNull()
    expect(getDealStatusFilter({ status: '' })).toBeNull()
  })

  it('uses first value when status is an array', () => {
    expect(getDealStatusFilter({ status: ['ACTIVE', 'DRAFT'] })).toBe('ACTIVE')
    expect(getDealStatusFilter({ status: ['UNKNOWN', 'ACTIVE'] })).toBeNull()
  })
})

const baseDeal: Deal = {
  id: 'd1',
  title: 'T',
  brandName: 'B',
  value: 100,
  currency: 'INR',
  status: 'ACTIVE',
  startDate: null,
  endDate: null,
  notes: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('computeStatusCounts', () => {
  it('returns all-zero counts for an empty list', () => {
    const counts = computeStatusCounts([])
    expect(counts.DRAFT).toBe(0)
    expect(counts.NEGOTIATING).toBe(0)
    expect(counts.ACTIVE).toBe(0)
    expect(counts.DELIVERED).toBe(0)
    expect(counts.PAID).toBe(0)
    expect(counts.CANCELLED).toBe(0)
  })

  it('counts each status correctly for a mixed list', () => {
    const deals: Deal[] = [
      { ...baseDeal, id: '1', status: 'ACTIVE' },
      { ...baseDeal, id: '2', status: 'ACTIVE' },
      { ...baseDeal, id: '3', status: 'DRAFT' },
      { ...baseDeal, id: '4', status: 'DELIVERED' },
      { ...baseDeal, id: '5', status: 'PAID' },
      { ...baseDeal, id: '6', status: 'CANCELLED' },
    ]
    const counts = computeStatusCounts(deals)
    expect(counts.ACTIVE).toBe(2)
    expect(counts.DRAFT).toBe(1)
    expect(counts.NEGOTIATING).toBe(0)
    expect(counts.DELIVERED).toBe(1)
    expect(counts.PAID).toBe(1)
    expect(counts.CANCELLED).toBe(1)
  })
})
