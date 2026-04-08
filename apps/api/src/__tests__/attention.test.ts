import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  session: { findUnique: ReturnType<typeof vi.fn> }
  deal: {
    findMany: ReturnType<typeof vi.fn>
  }
}

const DEAL_ID = '550e8400-e29b-41d4-a716-446655440099'

function makeDecimal(n: number) {
  return { toNumber: () => n, toString: () => String(n) }
}

describe('GET /api/v1/attention', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
    app = await buildServer()
  })

  it('returns 200 with empty actions when no deals', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([])

    const res = await app.inject({ method: 'GET', url: '/api/v1/attention', headers: auth })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.actions).toEqual([])
  })

  it('returns all overdue actions without dashboard cap', async () => {
    const manyPayments = Array.from({ length: 12 }, (_, i) => ({
      id: `pay-${i}`,
      dealId: DEAL_ID,
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
      id: DEAL_ID,
      title: 'Bulk',
      brandName: 'B',
      value: makeDecimal(50000),
      currency: 'INR',
      status: 'ACTIVE',
      startDate: null,
      endDate: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      payments: manyPayments,
      deliverables: [],
    }
    mockPrisma.deal.findMany.mockResolvedValue([bulkDeal])

    const res = await app.inject({ method: 'GET', url: '/api/v1/attention', headers: auth })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.actions).toHaveLength(12)
  })
})
