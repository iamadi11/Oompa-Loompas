import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'
import { generateShareToken } from '../lib/share-token.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  session: { findUnique: ReturnType<typeof vi.fn> }
  deal: {
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

const baseDeal = {
  id: 'd1',
  userId: TEST_USER_ID,
  title: 'Brand Collab',
  brandName: 'Nike',
  value: { toNumber: () => 50000 },
  currency: 'INR',
  status: 'ACTIVE',
  startDate: null,
  endDate: null,
  notes: null,
  shareToken: null,
  createdAt: new Date('2026-04-09T00:00:00.000Z'),
  updatedAt: new Date('2026-04-09T00:00:00.000Z'),
  deliverables: [],
  payments: [],
}

// ─── generateShareToken unit tests ────────────────────────────────────────────

describe('generateShareToken', () => {
  it('returns a 64-character hex string', () => {
    const token = generateShareToken()
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })

  it('returns a different token each call', () => {
    const a = generateShareToken()
    const b = generateShareToken()
    expect(a).not.toBe(b)
  })
})

// ─── POST /api/v1/deals/:id/share ─────────────────────────────────────────────

describe('POST /api/v1/deals/:id/share', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('generates a token and returns 200 with shareUrl', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue({ ...baseDeal, shareToken: null })
    mockPrisma.deal.update.mockImplementation(({ data }: { data: { shareToken: string } }) =>
      Promise.resolve({ ...baseDeal, shareToken: data.shareToken }),
    )

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals/d1/share',
      headers: auth,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json<{ data: { shareToken: string; shareUrl: string } }>()
    expect(body.data.shareToken).toMatch(/^[0-9a-f]{64}$/)
    expect(body.data.shareUrl).toContain('/p/')
    await fastify.close()
  })

  it('returns 404 when deal does not belong to user', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals/d1/share',
      headers: auth,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 401 when not authenticated', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals/d1/share',
    })
    expect(response.statusCode).toBe(401)
    await fastify.close()
  })
})

// ─── DELETE /api/v1/deals/:id/share ───────────────────────────────────────────

describe('DELETE /api/v1/deals/:id/share', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('clears the token and returns 200', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue({ ...baseDeal, shareToken: 'abc123' })
    mockPrisma.deal.update.mockResolvedValue({ ...baseDeal, shareToken: null })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/api/v1/deals/d1/share',
      headers: auth,
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('returns 404 when deal does not belong to user', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/api/v1/deals/d1/share',
      headers: auth,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })
})

// ─── GET /api/v1/share/:token (PUBLIC) ────────────────────────────────────────

describe('GET /api/v1/share/:token', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with proposal view when token exists', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue({
      ...baseDeal,
      shareToken: 'valid-token',
      deliverables: [
        {
          id: 'deliv1',
          title: '1 Instagram Reel',
          platform: 'INSTAGRAM',
          type: 'REEL',
          dueDate: null,
          status: 'PENDING',
        },
      ],
      payments: [
        {
          id: 'pay1',
          amount: { toNumber: () => 25000 },
          currency: 'INR',
          status: 'PENDING',
          dueDate: null,
        },
      ],
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/share/valid-token',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json<{
      data: { title: string; brandName: string; deliverables: unknown[]; payments: unknown[] }
    }>()
    expect(body.data.title).toBe('Brand Collab')
    expect(body.data.brandName).toBe('Nike')
    expect(body.data.deliverables).toHaveLength(1)
    expect(body.data.payments).toHaveLength(1)
    await fastify.close()
  })

  it('returns 404 when token is unknown', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/share/unknown-token',
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('does NOT require authentication', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue({
      ...baseDeal,
      shareToken: 'valid-token',
    })

    const fastify = await buildServer()
    // No auth header — must still return 200
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/share/valid-token',
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })
})
