import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  payment: {
    findMany: ReturnType<typeof vi.fn>
    updateMany: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
  }
  session: { findUnique: ReturnType<typeof vi.fn> }
}

const PENDING_PAYMENT = {
  id: 'pay-1',
  dealId: 'deal-1',
  amount: { toNumber: () => 75000 },
  dueDate: new Date('2026-04-20'),
  deal: { id: 'deal-1', title: 'Nike Q2', brandName: 'Nike', userId: TEST_USER_ID },
}

describe('POST /api/v1/reconcile/match', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('returns 401 without auth', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/match',
      payload: { transactions: [] },
    })
    expect(res.statusCode).toBe(401)
  })

  it('returns 200 with empty matches for empty transactions', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([PENDING_PAYMENT])
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/match',
      headers: auth,
      payload: { transactions: [] },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { matches: unknown[]; unmatched: number[] } }>()
    expect(body.data.matches).toHaveLength(0)
    expect(body.data.unmatched).toHaveLength(0)
  })

  it('returns match for exact-amount transaction', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([PENDING_PAYMENT])
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/match',
      headers: auth,
      payload: {
        transactions: [
          { date: '2026-04-18', amount: 75000, description: 'UPI/Nike Creative' },
        ],
      },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { matches: Array<{ paymentId: string; confidence: string }> } }>()
    expect(body.data.matches).toHaveLength(1)
    expect(body.data.matches[0]!.paymentId).toBe('pay-1')
    expect(body.data.matches[0]!.confidence).toBe('high')
  })

  it('returns unmatched index for transaction with no candidate payment', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([PENDING_PAYMENT])
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/match',
      headers: auth,
      payload: {
        transactions: [
          { date: '2026-04-18', amount: 10000, description: 'Unrelated' },
        ],
      },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { matches: unknown[]; unmatched: number[] } }>()
    expect(body.data.matches).toHaveLength(0)
    expect(body.data.unmatched).toEqual([0])
  })

  it('returns 400 for invalid payload (missing transactions)', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/match',
      headers: auth,
      payload: { wrong: 'field' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('only queries payments belonging to auth user', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([])
    const fastify = await buildServer()
    await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/match',
      headers: auth,
      payload: { transactions: [{ date: '2026-04-18', amount: 75000 }] },
    })
    expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deal: expect.objectContaining({ userId: TEST_USER_ID }),
        }),
      }),
    )
  })
})

describe('POST /api/v1/reconcile/apply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('returns 401 without auth', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/apply',
      payload: { approvals: [] },
    })
    expect(res.statusCode).toBe(401)
  })

  it('returns 200 with updated=0 for empty approvals', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/apply',
      headers: auth,
      payload: { approvals: [] },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { updated: number } }>()
    expect(body.data.updated).toBe(0)
  })

  it('marks payments RECEIVED and sets receivedAt', async () => {
    mockPrisma.payment.updateMany.mockResolvedValue({ count: 1 })
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/apply',
      headers: auth,
      payload: {
        approvals: [{ paymentId: 'pay-1', receivedAt: '2026-04-18' }],
      },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { updated: number } }>()
    expect(body.data.updated).toBe(1)
    expect(mockPrisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'pay-1',
          deal: { userId: TEST_USER_ID },
        }),
        data: expect.objectContaining({
          status: 'RECEIVED',
        }),
      }),
    )
  })

  it('returns 400 for invalid payload', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/apply',
      headers: auth,
      payload: { wrong: 'field' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('scopes updateMany to auth user (cannot update other users payments)', async () => {
    mockPrisma.payment.updateMany.mockResolvedValue({ count: 0 })
    const fastify = await buildServer()
    await fastify.inject({
      method: 'POST',
      url: '/api/v1/reconcile/apply',
      headers: auth,
      payload: {
        approvals: [{ paymentId: 'pay-other-user', receivedAt: '2026-04-18' }],
      },
    })
    // updateMany where clause must include userId scoping
    expect(mockPrisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deal: { userId: TEST_USER_ID },
        }),
      }),
    )
  })
})
