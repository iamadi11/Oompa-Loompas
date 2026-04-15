import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  session: { findUnique: ReturnType<typeof vi.fn> }
  deal: {
    count: ReturnType<typeof vi.fn>
    groupBy: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
  }
  payment: {
    count: ReturnType<typeof vi.fn>
  }
  brandProfile: {
    findUnique: ReturnType<typeof vi.fn>
    upsert: ReturnType<typeof vi.fn>
    deleteMany: ReturnType<typeof vi.fn>
  }
}

const BRAND = 'Acme%20Corp'
const BRAND_DECODED = 'Acme Corp'

const MOCK_PROFILE = {
  id: 'prof-1',
  userId: TEST_USER_ID,
  brandName: BRAND_DECODED,
  contactEmail: 'hi@acme.com',
  contactPhone: '+91 9900000000',
  notes: 'Pays on time',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
}

function setupDefaultMocks() {
  mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  mockPrisma.deal.count.mockResolvedValue(2) // brand exists
  mockPrisma.deal.groupBy.mockResolvedValue([
    { currency: 'INR', _count: { id: 2 }, _sum: { value: { toNumber: () => 50000, toString: () => '50000' } } },
  ])
  mockPrisma.payment.count.mockResolvedValue(0)
  mockPrisma.deal.findMany.mockResolvedValue([
    {
      id: 'd1',
      title: 'Collab Q1',
      value: { toNumber: () => 50000 },
      currency: 'INR',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ])
}

describe('GET /api/v1/brands/:brandName', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  beforeEach(async () => {
    vi.clearAllMocks()
    setupDefaultMocks()
    app = await buildServer()
  })

  it('returns 200 with profile + stats + recent deals when profile exists', async () => {
    mockPrisma.brandProfile.findUnique.mockResolvedValue(MOCK_PROFILE)

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/brands/${BRAND}`,
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.brandName).toBe(BRAND_DECODED)
    expect(body.data.profile).not.toBeNull()
    expect(body.data.profile.contactEmail).toBe('hi@acme.com')
    expect(body.data.stats.totalDeals).toBe(2)
    expect(body.data.recentDeals).toHaveLength(1)
  })

  it('returns 200 with null profile when no profile exists yet', async () => {
    mockPrisma.brandProfile.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/brands/${BRAND}`,
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.profile).toBeNull()
    expect(body.data.stats.totalDeals).toBe(2)
  })

  it('returns 404 when brand has no deals for user', async () => {
    mockPrisma.deal.count.mockResolvedValue(0)

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/brands/${BRAND}`,
      headers: auth,
    })

    expect(res.statusCode).toBe(404)
  })

  it('returns 401 without auth', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/brands/${BRAND}`,
    })
    expect(res.statusCode).toBe(401)
  })

  it('includes overdue payment count in stats', async () => {
    mockPrisma.payment.count.mockResolvedValue(3)
    mockPrisma.brandProfile.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/brands/${BRAND}`,
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().data.stats.overduePaymentsCount).toBe(3)
  })
})

describe('PUT /api/v1/brands/:brandName', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  beforeEach(async () => {
    vi.clearAllMocks()
    setupDefaultMocks()
    app = await buildServer()
  })

  it('upserts profile and returns 200', async () => {
    mockPrisma.brandProfile.upsert.mockResolvedValue(MOCK_PROFILE)

    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/brands/${BRAND}`,
      headers: auth,
      payload: { contactEmail: 'hi@acme.com', contactPhone: null, notes: 'Good client' },
    })

    expect(res.statusCode).toBe(200)
    expect(mockPrisma.brandProfile.upsert).toHaveBeenCalledOnce()
    expect(res.json().data.contactEmail).toBe('hi@acme.com')
  })

  it('accepts empty body (all nullable fields)', async () => {
    mockPrisma.brandProfile.upsert.mockResolvedValue({
      ...MOCK_PROFILE,
      contactEmail: null,
      contactPhone: null,
      notes: null,
    })

    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/brands/${BRAND}`,
      headers: auth,
      payload: {},
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 404 when brand has no deals for user', async () => {
    mockPrisma.deal.count.mockResolvedValue(0)

    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/brands/${BRAND}`,
      headers: auth,
      payload: { notes: 'test' },
    })

    expect(res.statusCode).toBe(404)
  })

  it('returns 401 without auth', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/brands/${BRAND}`,
      payload: { notes: 'test' },
    })
    expect(res.statusCode).toBe(401)
  })
})

describe('DELETE /api/v1/brands/:brandName', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  beforeEach(async () => {
    vi.clearAllMocks()
    setupDefaultMocks()
    app = await buildServer()
  })

  it('deletes profile and returns 204', async () => {
    mockPrisma.brandProfile.deleteMany.mockResolvedValue({ count: 1 })

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/brands/${BRAND}`,
      headers: auth,
    })

    expect(res.statusCode).toBe(204)
    expect(mockPrisma.brandProfile.deleteMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID, brandName: BRAND_DECODED },
    })
  })

  it('returns 204 even when no profile exists (idempotent)', async () => {
    mockPrisma.brandProfile.deleteMany.mockResolvedValue({ count: 0 })

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/brands/${BRAND}`,
      headers: auth,
    })

    expect(res.statusCode).toBe(204)
  })

  it('returns 401 without auth', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/brands/${BRAND}`,
    })
    expect(res.statusCode).toBe(401)
  })
})
