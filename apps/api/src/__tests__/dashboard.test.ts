import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { DashboardPriorityAction } from '@oompa/types'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'

const mockPrisma = prisma as typeof prisma & {
  deal: {
    findMany: ReturnType<typeof vi.fn>
  }
}

const DEAL_ID_1 = '550e8400-e29b-41d4-a716-446655440001'
const DEAL_ID_2 = '550e8400-e29b-41d4-a716-446655440002'

function makeDecimal(n: number) {
  return { toNumber: () => n, toString: () => String(n) }
}

const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

const mockDeal1 = {
  id: DEAL_ID_1,
  title: 'Brand Deal A',
  brandName: 'Acme Corp',
  value: makeDecimal(80000),
  currency: 'INR',
  status: 'ACTIVE',
  startDate: null,
  endDate: null,
  notes: null,
  createdAt: new Date('2026-04-03T00:00:00.000Z'),
  updatedAt: new Date('2026-04-03T00:00:00.000Z'),
  payments: [
    {
      id: 'pay-1',
      dealId: DEAL_ID_1,
      amount: makeDecimal(40000),
      currency: 'INR',
      status: 'RECEIVED',
      dueDate: null,
      receivedAt: new Date('2026-04-01T00:00:00.000Z'),
      notes: null,
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-01T00:00:00.000Z'),
    },
    {
      id: 'pay-2',
      dealId: DEAL_ID_1,
      amount: makeDecimal(40000),
      currency: 'INR',
      status: 'PENDING',
      dueDate: pastDate,
      receivedAt: null,
      notes: null,
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-01T00:00:00.000Z'),
    },
  ],
  deliverables: [],
}

const mockDeal2 = {
  id: DEAL_ID_2,
  title: 'Brand Deal B',
  brandName: 'Beta Inc',
  value: makeDecimal(45000),
  currency: 'INR',
  status: 'DRAFT',
  startDate: null,
  endDate: null,
  notes: null,
  createdAt: new Date('2026-04-04T00:00:00.000Z'),
  updatedAt: new Date('2026-04-04T00:00:00.000Z'),
  payments: [],
  deliverables: [],
}

describe('GET /api/v1/dashboard', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  beforeEach(async () => {
    vi.clearAllMocks()
    app = await buildServer()
  })

  it('returns 200 with zero summary when no deals exist', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.totalContractedValue).toBe(0)
    expect(body.data.totalReceivedValue).toBe(0)
    expect(body.data.totalOutstandingValue).toBe(0)
    expect(body.data.overduePaymentsCount).toBe(0)
    expect(body.data.overduePaymentsValue).toBe(0)
    expect(body.data.totalDealsCount).toBe(0)
    expect(body.data.activeDealsCount).toBe(0)
    expect(body.data.recentDeals).toEqual([])
    expect(body.data.priorityActions).toEqual([])
    expect(body.data.priorityActionsTotalCount).toBe(0)
  })

  it('returns correct totalContractedValue (sum of all deal values)', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1, mockDeal2])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.totalContractedValue).toBe(125000) // 80000 + 45000
  })

  it('returns correct totalReceivedValue (RECEIVED payments only)', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1, mockDeal2])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.totalReceivedValue).toBe(40000) // only pay-1 is RECEIVED
  })

  it('returns correct totalOutstandingValue', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1, mockDeal2])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.totalOutstandingValue).toBe(85000) // 125000 - 40000
  })

  it('returns correct overduePaymentsCount', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1, mockDeal2])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.overduePaymentsCount).toBe(1) // pay-2 is PENDING + past dueDate
  })

  it('returns correct overduePaymentsValue', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1, mockDeal2])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.overduePaymentsValue).toBe(40000) // pay-2 amount
  })

  it('returns correct activeDealsCount', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1, mockDeal2])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.activeDealsCount).toBe(1) // only mockDeal1 is ACTIVE
  })

  it('returns correct totalDealsCount', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1, mockDeal2])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.totalDealsCount).toBe(2)
  })

  it('returns up to 5 recentDeals with payment summaries', async () => {
    const manyDeals = Array.from({ length: 7 }, (_, i) => ({
      ...mockDeal2,
      id: `deal-${i}`,
      title: `Deal ${i}`,
      createdAt: new Date(2026, 3, i + 1),
    }))
    mockPrisma.deal.findMany.mockResolvedValue(manyDeals)

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.recentDeals).toHaveLength(5)
  })

  it('includes paymentSummary on each recentDeal', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    const deal = body.data.recentDeals[0]
    expect(deal).toBeDefined()
    expect(deal!.paymentSummary.totalContracted).toBe(80000)
    expect(deal!.paymentSummary.totalReceived).toBe(40000)
    expect(deal!.paymentSummary.totalOutstanding).toBe(40000)
    expect(deal!.paymentSummary.hasOverdue).toBe(true)
    expect(deal!.paymentSummary.paymentCount).toBe(2)
  })

  it('RECEIVED payment past dueDate is not counted as overdue', async () => {
    const receivedPastDue = {
      ...mockDeal2,
      payments: [{
        id: 'pay-3',
        dealId: DEAL_ID_2,
        amount: makeDecimal(45000),
        currency: 'INR',
        status: 'RECEIVED',
        dueDate: pastDate, // past due but RECEIVED
        receivedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
    }
    mockPrisma.deal.findMany.mockResolvedValue([receivedPastDue])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.overduePaymentsCount).toBe(0)
  })

  it('returns dominantCurrency as the most common deal currency', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1, mockDeal2])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.dominantCurrency).toBe('INR')
  })

  it('future dueDate PENDING payment is not overdue', async () => {
    const futurePending = {
      ...mockDeal2,
      payments: [{
        id: 'pay-4',
        dealId: DEAL_ID_2,
        amount: makeDecimal(45000),
        currency: 'INR',
        status: 'PENDING',
        dueDate: futureDate,
        receivedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
    }
    mockPrisma.deal.findMany.mockResolvedValue([futurePending])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.overduePaymentsCount).toBe(0)
  })

  it('returns priorityActions for overdue payments with oldest due date first', async () => {
    const olderDue = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const newerDue = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const twoOverduePayments = {
      ...mockDeal2,
      id: DEAL_ID_2,
      title: 'Dual Pay Deal',
      payments: [
        {
          id: 'pay-newer',
          dealId: DEAL_ID_2,
          amount: makeDecimal(1000),
          currency: 'INR',
          status: 'PENDING',
          dueDate: newerDue,
          receivedAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pay-older',
          dealId: DEAL_ID_2,
          amount: makeDecimal(2000),
          currency: 'INR',
          status: 'PENDING',
          dueDate: olderDue,
          receivedAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      deliverables: [],
    }
    mockPrisma.deal.findMany.mockResolvedValue([twoOverduePayments])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.priorityActions).toHaveLength(2)
    expect(body.data.priorityActions[0].kind).toBe('overdue_payment')
    expect(body.data.priorityActions[0].paymentId).toBe('pay-older')
    expect(body.data.priorityActions[1].paymentId).toBe('pay-newer')
    expect(body.data.priorityActionsTotalCount).toBe(2)
  })

  it('returns overdue_deliverable in priorityActions', async () => {
    const deliverablePastDue = {
      ...mockDeal2,
      id: DEAL_ID_2,
      title: 'Content Deal',
      payments: [],
      deliverables: [
        {
          id: 'del-1',
          dealId: DEAL_ID_2,
          title: 'Reel draft',
          platform: 'INSTAGRAM',
          type: 'REEL',
          dueDate: pastDate,
          status: 'PENDING',
          completedAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }
    mockPrisma.deal.findMany.mockResolvedValue([deliverablePastDue])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.priorityActions).toHaveLength(1)
    expect(body.data.priorityActions[0]).toMatchObject({
      kind: 'overdue_deliverable',
      dealId: DEAL_ID_2,
      deliverableId: 'del-1',
      deliverableTitle: 'Reel draft',
    })
    expect(body.data.priorityActionsTotalCount).toBe(1)
  })

  it('includes mockDeal1 overdue payment in priorityActions', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal1, mockDeal2])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    const priorityActions = body.data.priorityActions as DashboardPriorityAction[]
    const payAction = priorityActions.find((a) => a.kind === 'overdue_payment')
    expect(payAction).toMatchObject({
      kind: 'overdue_payment',
      dealId: DEAL_ID_1,
      paymentId: 'pay-2',
      amount: 40000,
    })
    expect(body.data.priorityActionsTotalCount).toBe(1)
  })

  it('orders overdue payment before overdue deliverable when due dates match', async () => {
    const sameDue = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const mixedDeal = {
      ...mockDeal2,
      id: DEAL_ID_2,
      title: 'Mixed Deal',
      payments: [
        {
          id: 'pay-same',
          dealId: DEAL_ID_2,
          amount: makeDecimal(5000),
          currency: 'INR',
          status: 'PENDING',
          dueDate: sameDue,
          receivedAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      deliverables: [
        {
          id: 'del-same',
          dealId: DEAL_ID_2,
          title: 'Story',
          platform: 'INSTAGRAM' as const,
          type: 'STORY' as const,
          dueDate: sameDue,
          status: 'PENDING',
          completedAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }
    mockPrisma.deal.findMany.mockResolvedValue([mixedDeal])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.priorityActions).toHaveLength(2)
    expect(body.data.priorityActions[0].kind).toBe('overdue_payment')
    expect(body.data.priorityActions[1].kind).toBe('overdue_deliverable')
    expect(body.data.priorityActionsTotalCount).toBe(2)
  })

  it('caps priorityActions at 10', async () => {
    const manyPayments = Array.from({ length: 12 }, (_, i) => ({
      id: `pay-${i}`,
      dealId: DEAL_ID_2,
      amount: makeDecimal(1000),
      currency: 'INR',
      status: 'PENDING',
      dueDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
      receivedAt: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    const bulkDeal = {
      ...mockDeal2,
      payments: manyPayments,
      deliverables: [],
    }
    mockPrisma.deal.findMany.mockResolvedValue([bulkDeal])

    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.priorityActions).toHaveLength(10)
    expect(body.data.priorityActionsTotalCount).toBe(12)
  })
})
