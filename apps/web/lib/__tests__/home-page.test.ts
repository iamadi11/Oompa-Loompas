import { describe, expect, it } from 'vitest'
import type { DashboardSummary } from '@oompa/types'
import { resolveHomeOverviewState } from '@/lib/home-page'

const minimalDashboard = (overrides: Partial<DashboardSummary>): DashboardSummary => ({
  totalContractedValue: 0,
  totalReceivedValue: 0,
  totalOutstandingValue: 0,
  overduePaymentsCount: 0,
  overduePaymentsValue: 0,
  activeDealsCount: 0,
  totalDealsCount: 1,
  dominantCurrency: 'INR',
  recentDeals: [],
  priorityActionsTotalCount: 0,
  priorityActions: [],
  ...overrides,
})

describe('resolveHomeOverviewState', () => {
  it('returns unavailable when data is null or undefined', () => {
    expect(resolveHomeOverviewState(null)).toEqual({ kind: 'unavailable' })
    expect(resolveHomeOverviewState(undefined)).toEqual({ kind: 'unavailable' })
  })

  it('returns empty when there are no deals', () => {
    expect(
      resolveHomeOverviewState(minimalDashboard({ totalDealsCount: 0, activeDealsCount: 0 })),
    ).toEqual({ kind: 'empty' })
  })

  it('returns ready with data when at least one deal exists', () => {
    const data = minimalDashboard({ totalDealsCount: 2 })
    expect(resolveHomeOverviewState(data)).toEqual({ kind: 'ready', data })
  })
})
