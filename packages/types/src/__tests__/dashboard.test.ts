import { describe, expect, it } from 'vitest'
import {
  AttentionQueueSchema,
  DashboardOverdueDeliverableActionSchema,
  DashboardOverduePaymentActionSchema,
  DashboardPriorityActionSchema,
  DashboardSummarySchema,
} from '../dashboard.js'

const paymentAction = {
  kind: 'overdue_payment' as const,
  dealId: '550e8400-e29b-41d4-a716-446655440010',
  dealTitle: 'D',
  brandName: 'B',
  paymentId: '550e8400-e29b-41d4-a716-446655440011',
  amount: 99,
  currency: 'INR' as const,
  dueDate: '2024-01-01T00:00:00.000Z',
}

const deliverableAction = {
  kind: 'overdue_deliverable' as const,
  dealId: '550e8400-e29b-41d4-a716-446655440012',
  dealTitle: 'D2',
  brandName: 'B2',
  deliverableId: '550e8400-e29b-41d4-a716-446655440013',
  deliverableTitle: 'X',
  dueDate: null,
}

const dashboardDeal = {
  id: '550e8400-e29b-41d4-a716-446655440014',
  title: 't',
  brandName: 'b',
  value: 1,
  currency: 'EUR' as const,
  status: 'ACTIVE' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  paymentSummary: {
    totalContracted: 1,
    totalReceived: 0,
    totalOutstanding: 1,
    hasOverdue: false,
    paymentCount: 0,
  },
}

describe('Dashboard priority action schemas', () => {
  it('parses overdue_payment', () => {
    expect(DashboardOverduePaymentActionSchema.parse(paymentAction)).toEqual(paymentAction)
  })

  it('parses overdue_deliverable', () => {
    expect(DashboardOverdueDeliverableActionSchema.parse(deliverableAction)).toEqual(
      deliverableAction,
    )
  })

  it('discriminated union accepts both kinds', () => {
    expect(DashboardPriorityActionSchema.parse(paymentAction).kind).toBe('overdue_payment')
    expect(DashboardPriorityActionSchema.parse(deliverableAction).kind).toBe('overdue_deliverable')
  })

  it('rejects wrong shape for kind', () => {
    expect(() =>
      DashboardPriorityActionSchema.parse({
        ...paymentAction,
        kind: 'overdue_deliverable',
      }),
    ).toThrow()
  })
})

describe('DashboardSummarySchema', () => {
  it('parses full summary', () => {
    const summary = {
      totalContractedValue: 100,
      totalReceivedValue: 50,
      totalOutstandingValue: 50,
      overduePaymentsCount: 0,
      overduePaymentsValue: 0,
      activeDealsCount: 1,
      totalDealsCount: 2,
      dominantCurrency: 'GBP' as const,
      recentDeals: [dashboardDeal],
      priorityActionsTotalCount: 1,
      priorityActions: [paymentAction],
    }
    expect(DashboardSummarySchema.parse(summary).recentDeals).toHaveLength(1)
  })
})

describe('AttentionQueueSchema', () => {
  it('parses actions array', () => {
    expect(AttentionQueueSchema.parse({ actions: [deliverableAction] }).actions).toHaveLength(1)
  })
})
