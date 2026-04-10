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

describe('GET /api/v1/attention/export', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
    app = await buildServer()
  })

  it('returns 401 when not authenticated', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/attention/export' })
    expect(res.statusCode).toBe(401)
  })

  it('returns 200 CSV with BOM and header only when queue empty', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([])

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/attention/export',
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    expect(String(res.headers['content-type'])).toContain('text/csv')
    expect(String(res.headers['content-disposition'])).toContain('attachment')
    expect(String(res.headers['content-disposition'])).toContain('oompa-attention-queue-')
    const body = res.body
    expect(body.charCodeAt(0)).toBe(0xfeff)
    expect(body).toContain('priority_kind,deal_id')
    const text = body.replace(/^\uFEFF/, '')
    expect(text.split('\r\n').length).toBe(1)
  })

  it('returns rows for overdue payment and deliverable', async () => {
    const duePast = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const deal = {
      id: DEAL_ID,
      title: 'Spring',
      brandName: 'Acme',
      value: makeDecimal(10000),
      currency: 'INR',
      status: 'ACTIVE',
      startDate: null,
      endDate: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      payments: [
        {
          id: 'pay-a',
          dealId: DEAL_ID,
          amount: makeDecimal(2500),
          currency: 'INR',
          status: 'PENDING',
          dueDate: duePast,
          receivedAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      deliverables: [
        {
          id: 'del-a',
          dealId: DEAL_ID,
          title: 'Reel',
          dueDate: duePast,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }
    mockPrisma.deal.findMany.mockResolvedValue([deal])

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/attention/export',
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('overdue_payment')
    expect(res.body).toContain('pay-a')
    expect(res.body).toContain('2500.00')
    expect(res.body).toContain('overdue_deliverable')
    expect(res.body).toContain('del-a')
    expect(res.body).toContain('Acme')
  })
})
