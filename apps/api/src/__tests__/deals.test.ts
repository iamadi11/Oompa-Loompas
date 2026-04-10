import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  session: { findUnique: ReturnType<typeof vi.fn> }
  deal: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
  }
}

const mockDeal = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Nike Reel Campaign',
  brandName: 'Nike',
  value: { toNumber: () => 80000, toString: () => '80000' },
  currency: 'INR',
  status: 'DRAFT',
  startDate: null,
  endDate: null,
  notes: null,
  shareToken: null,
  createdAt: new Date('2026-04-04T00:00:00.000Z'),
  updatedAt: new Date('2026-04-04T00:00:00.000Z'),
}

describe('GET /api/v1/deals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal])
    mockPrisma.deal.count.mockResolvedValue(1)
  })

  it('returns 200 with paginated deal list', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals',
      headers: auth,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toHaveLength(1)
    expect(body.meta.total).toBe(1)
    await fastify.close()
  })

  it('returns 200 with filtered results by status', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal])
    mockPrisma.deal.count.mockResolvedValue(1)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals?status=DRAFT',
      headers: auth,
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('returns 400 for invalid status filter', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals?status=INVALID_STATUS',
      headers: auth,
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 for invalid needsAttention filter', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals?needsAttention=yes',
      headers: auth,
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('applies needsAttention prisma filter when true', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([])
    mockPrisma.deal.count.mockResolvedValue(0)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals?needsAttention=true',
      headers: auth,
    })

    expect(response.statusCode).toBe(200)
    expect(mockPrisma.deal.findMany).toHaveBeenCalled()
    const callArg = mockPrisma.deal.findMany.mock.calls[0]?.[0] as {
      where: { userId?: string; AND?: unknown[] }
    }
    expect(callArg.where.userId).toBe(TEST_USER_ID)
    expect(callArg.where.AND).toHaveLength(1)
    expect(callArg.where.AND?.[0]).toMatchObject({
      OR: expect.arrayContaining([
        expect.objectContaining({ payments: expect.any(Object) }),
        expect.objectContaining({ deliverables: expect.any(Object) }),
      ]),
    })
    await fastify.close()
  })
})

describe('GET /api/v1/deals/export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('returns 200 CSV with BOM, disposition attachment, and scoped query', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal])

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals/export',
      headers: auth,
    })

    expect(response.statusCode).toBe(200)
    expect(String(response.headers['content-type'])).toContain('text/csv')
    expect(String(response.headers['content-disposition'])).toMatch(/^attachment;/)
    expect(response.body.startsWith('\uFEFF')).toBe(true)
    expect(response.body).toContain('deal_id')
    expect(response.body).toContain(mockDeal.id)
    expect(mockPrisma.deal.findMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    })
    await fastify.close()
  })

  it('returns 401 when not authenticated', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals/export',
    })

    expect(response.statusCode).toBe(401)
    await fastify.close()
  })
})

describe('GET /api/v1/deals/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('returns 200 with deal data for valid id', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(mockDeal)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${mockDeal.id}`,
      headers: auth,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data.id).toBe(mockDeal.id)
    expect(body.data.title).toBe('Nike Reel Campaign')
    await fastify.close()
  })

  it('returns 404 for unknown id', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals/550e8400-e29b-41d4-a716-000000000000',
      headers: auth,
    })

    expect(response.statusCode).toBe(404)
    const body = response.json()
    expect(body.error).toBe('Not Found')
    await fastify.close()
  })
})

describe('POST /api/v1/deals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
    mockPrisma.deal.create.mockResolvedValue(mockDeal)
  })

  it('creates a deal and returns 201', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals',
      headers: auth,
      payload: {
        title: 'Nike Reel Campaign',
        brandName: 'Nike',
        value: 80000,
        currency: 'INR',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.data.id).toBe(mockDeal.id)
    expect(mockPrisma.deal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: TEST_USER_ID }),
      }),
    )
    await fastify.close()
  })

  it('returns 400 when title is missing', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals',
      headers: auth,
      payload: { brandName: 'Nike', value: 80000 },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when value is negative', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals',
      headers: auth,
      payload: { title: 'Test', brandName: 'Nike', value: -100 },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when value is missing', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals',
      headers: auth,
      payload: { title: 'Test', brandName: 'Nike' },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when brandName is missing', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals',
      headers: auth,
      payload: { title: 'Test', value: 80000 },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })
})

describe('PATCH /api/v1/deals/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('updates a deal and returns 200', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(mockDeal)
    mockPrisma.deal.update.mockResolvedValue({ ...mockDeal, title: 'Updated Title' })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
      headers: auth,
      payload: { title: 'Updated Title' },
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('returns 404 when deal does not exist', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: '/api/v1/deals/550e8400-e29b-41d4-a716-000000000000',
      headers: auth,
      payload: { title: 'Updated' },
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 409 for invalid status transition', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue({ ...mockDeal, status: 'PAID' })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
      headers: auth,
      payload: { status: 'DRAFT' },
    })

    expect(response.statusCode).toBe(409)
    await fastify.close()
  })

  it('allows valid status transition DRAFT → NEGOTIATING', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue({ ...mockDeal, status: 'DRAFT' })
    mockPrisma.deal.update.mockResolvedValue({ ...mockDeal, status: 'NEGOTIATING' })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
      headers: auth,
      payload: { status: 'NEGOTIATING' },
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('clears startDate and endDate when set to null', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue({
      ...mockDeal,
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-06-01T00:00:00.000Z'),
    })
    mockPrisma.deal.update.mockResolvedValue({ ...mockDeal, startDate: null, endDate: null })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
      headers: auth,
      payload: { startDate: null, endDate: null },
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('sets startDate and endDate when provided as ISO strings', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(mockDeal)
    mockPrisma.deal.update.mockResolvedValue({
      ...mockDeal,
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-06-01T00:00:00.000Z'),
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
      headers: auth,
      payload: {
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-06-01T00:00:00.000Z',
      },
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })
})

describe('DELETE /api/v1/deals/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('deletes a deal and returns 204', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(mockDeal)
    mockPrisma.deal.delete.mockResolvedValue(mockDeal)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/deals/${mockDeal.id}`,
      headers: auth,
    })

    expect(response.statusCode).toBe(204)
    await fastify.close()
  })

  it('returns 404 when deal does not exist', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/api/v1/deals/550e8400-e29b-41d4-a716-000000000000',
      headers: auth,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })
})

describe('POST /api/v1/deals/:id/duplicate', () => {
  const mockDealWithRelations = {
    ...mockDeal,
    payments: [
      {
        id: 'pay-1',
        dealId: mockDeal.id,
        amount: { toNumber: () => 40000, toString: () => '40000' },
        currency: 'INR',
        status: 'PENDING',
        dueDate: null,
        receivedAt: null,
        notes: 'Advance',
        invoiceNumber: null,
        createdAt: new Date('2026-04-04T00:00:00.000Z'),
        updatedAt: new Date('2026-04-04T00:00:00.000Z'),
      },
    ],
    deliverables: [
      {
        id: 'del-1',
        dealId: mockDeal.id,
        title: 'Instagram Reel',
        platform: 'INSTAGRAM',
        type: 'REEL',
        dueDate: null,
        status: 'PENDING',
        completedAt: null,
        notes: null,
        createdAt: new Date('2026-04-04T00:00:00.000Z'),
        updatedAt: new Date('2026-04-04T00:00:00.000Z'),
      },
    ],
  }

  const mockNewDeal = {
    id: '550e8400-e29b-41d4-a716-000000000001',
    title: 'Nike Reel Campaign (Copy)',
    brandName: 'Nike',
    value: { toNumber: () => 80000, toString: () => '80000' },
    currency: 'INR',
    status: 'DRAFT',
    startDate: null,
    endDate: null,
    notes: null,
    shareToken: null,
    createdAt: new Date('2026-04-10T00:00:00.000Z'),
    updatedAt: new Date('2026-04-10T00:00:00.000Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('duplicates a deal and returns 201 with new deal data', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(mockDealWithRelations)
    mockPrisma.deal.create.mockResolvedValue(mockNewDeal)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${mockDeal.id}/duplicate`,
      headers: auth,
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.data.title).toBe('Nike Reel Campaign (Copy)')
    expect(body.data.status).toBe('DRAFT')
    expect(body.data.shareToken).toBeNull()
    await fastify.close()
  })

  it('creates duplicate with DRAFT status regardless of source status', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue({ ...mockDealWithRelations, status: 'PAID' })
    mockPrisma.deal.create.mockResolvedValue(mockNewDeal)

    const fastify = await buildServer()
    await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${mockDeal.id}/duplicate`,
      headers: auth,
    })

    expect(mockPrisma.deal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DRAFT' }),
      }),
    )
    await fastify.close()
  })

  it('clears startDate, endDate and does not inherit shareToken', async () => {
    const shareToken = 'a'.repeat(64)
    mockPrisma.deal.findFirst.mockResolvedValue({
      ...mockDealWithRelations,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-06-01'),
      shareToken,
    })
    mockPrisma.deal.create.mockResolvedValue(mockNewDeal)

    const fastify = await buildServer()
    await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${mockDeal.id}/duplicate`,
      headers: auth,
    })

    expect(mockPrisma.deal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ startDate: null, endDate: null }),
      }),
    )
    // shareToken must not appear in the create payload
    expect(mockPrisma.deal.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ shareToken: expect.anything() }),
      }),
    )
    await fastify.close()
  })

  it('works for deal with no payments or deliverables', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue({
      ...mockDealWithRelations,
      payments: [],
      deliverables: [],
    })
    mockPrisma.deal.create.mockResolvedValue(mockNewDeal)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${mockDeal.id}/duplicate`,
      headers: auth,
    })

    expect(response.statusCode).toBe(201)
    await fastify.close()
  })

  it('returns 404 when source deal not found', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals/550e8400-e29b-41d4-a716-000000000000/duplicate',
      headers: auth,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 401 when not authenticated', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${mockDeal.id}/duplicate`,
    })

    expect(response.statusCode).toBe(401)
    await fastify.close()
  })
})
