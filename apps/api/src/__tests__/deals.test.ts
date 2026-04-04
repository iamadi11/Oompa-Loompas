import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'

const mockPrisma = prisma as typeof prisma & {
  deal: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
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
  createdAt: new Date('2026-04-04T00:00:00.000Z'),
  updatedAt: new Date('2026-04-04T00:00:00.000Z'),
}

describe('GET /api/v1/deals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.deal.findMany.mockResolvedValue([mockDeal])
    mockPrisma.deal.count.mockResolvedValue(1)
  })

  it('returns 200 with paginated deal list', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json() as { data: unknown[]; meta: { total: number } }
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
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('returns 400 for invalid status filter', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals?status=INVALID_STATUS',
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })
})

describe('GET /api/v1/deals/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with deal data for valid id', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(mockDeal)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${mockDeal.id}`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json() as { data: { id: string; title: string } }
    expect(body.data.id).toBe(mockDeal.id)
    expect(body.data.title).toBe('Nike Reel Campaign')
    await fastify.close()
  })

  it('returns 404 for unknown id', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals/550e8400-e29b-41d4-a716-000000000000',
    })

    expect(response.statusCode).toBe(404)
    const body = response.json() as { error: string }
    expect(body.error).toBe('Not Found')
    await fastify.close()
  })
})

describe('POST /api/v1/deals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.deal.create.mockResolvedValue(mockDeal)
  })

  it('creates a deal and returns 201', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals',
      payload: {
        title: 'Nike Reel Campaign',
        brandName: 'Nike',
        value: 80000,
        currency: 'INR',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json() as { data: { id: string } }
    expect(body.data.id).toBe(mockDeal.id)
    await fastify.close()
  })

  it('returns 400 when title is missing', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/deals',
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
      payload: { title: 'Test', value: 80000 },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })
})

describe('PATCH /api/v1/deals/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates a deal and returns 200', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(mockDeal)
    mockPrisma.deal.update.mockResolvedValue({ ...mockDeal, title: 'Updated Title' })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
      payload: { title: 'Updated Title' },
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('returns 404 when deal does not exist', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: '/api/v1/deals/550e8400-e29b-41d4-a716-000000000000',
      payload: { title: 'Updated' },
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 409 for invalid status transition', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue({ ...mockDeal, status: 'PAID' })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
      payload: { status: 'DRAFT' },
    })

    expect(response.statusCode).toBe(409)
    await fastify.close()
  })

  it('allows valid status transition DRAFT → NEGOTIATING', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue({ ...mockDeal, status: 'DRAFT' })
    mockPrisma.deal.update.mockResolvedValue({ ...mockDeal, status: 'NEGOTIATING' })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
      payload: { status: 'NEGOTIATING' },
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('clears startDate and endDate when set to null', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue({
      ...mockDeal,
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-06-01T00:00:00.000Z'),
    })
    mockPrisma.deal.update.mockResolvedValue({ ...mockDeal, startDate: null, endDate: null })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
      payload: { startDate: null, endDate: null },
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('sets startDate and endDate when provided as ISO strings', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(mockDeal)
    mockPrisma.deal.update.mockResolvedValue({
      ...mockDeal,
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-06-01T00:00:00.000Z'),
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/deals/${mockDeal.id}`,
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
  })

  it('deletes a deal and returns 204', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(mockDeal)
    mockPrisma.deal.delete.mockResolvedValue(mockDeal)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/deals/${mockDeal.id}`,
    })

    expect(response.statusCode).toBe(204)
    await fastify.close()
  })

  it('returns 404 when deal does not exist', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/api/v1/deals/550e8400-e29b-41d4-a716-000000000000',
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })
})

describe('GET /health', () => {
  it('returns 200 with ok status', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    const body = response.json() as { status: string }
    expect(body.status).toBe('ok')
    await fastify.close()
  })
})
