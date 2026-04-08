import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  session: { findUnique: ReturnType<typeof vi.fn> }
  deal: { findFirst: ReturnType<typeof vi.fn> }
  deliverable: {
    findMany: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
}

const DEAL_ID = '550e8400-e29b-41d4-a716-446655440000'
const DELIVERABLE_ID = '770e8400-e29b-41d4-a716-446655440002'

const mockDealStub = { id: DEAL_ID }

const mockDeliverable = {
  id: DELIVERABLE_ID,
  dealId: DEAL_ID,
  title: '3x Instagram Reels',
  platform: 'INSTAGRAM',
  type: 'REEL',
  dueDate: null,
  status: 'PENDING',
  completedAt: null,
  notes: null,
  createdAt: new Date('2026-04-04T00:00:00.000Z'),
  updatedAt: new Date('2026-04-04T00:00:00.000Z'),
}

describe('GET /api/v1/deals/:dealId/deliverables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
    mockPrisma.deal.findFirst.mockResolvedValue(mockDealStub)
    mockPrisma.deliverable.findMany.mockResolvedValue([mockDeliverable])
  })

  it('returns 200 with deliverable list for existing deal', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toHaveLength(1)
    await fastify.close()
  })

  it('returns 404 when deal does not exist', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      headers: auth,
      url: `/api/v1/deals/550e8400-e29b-41d4-a716-000000000000/deliverables`,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns isOverdue=false for PENDING deliverable with no dueDate', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
    })

    const body = response.json()
    expect(body.data[0]?.isOverdue).toBe(false)
    await fastify.close()
  })

  it('returns isOverdue=true for PENDING deliverable with past dueDate', async () => {
    mockPrisma.deliverable.findMany.mockResolvedValue([
      { ...mockDeliverable, dueDate: new Date('2020-01-01T00:00:00.000Z'), status: 'PENDING' },
    ])

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
    })

    const body = response.json()
    expect(body.data[0]?.isOverdue).toBe(true)
    await fastify.close()
  })

  it('returns isOverdue=false for COMPLETED deliverable even if past dueDate', async () => {
    mockPrisma.deliverable.findMany.mockResolvedValue([
      {
        ...mockDeliverable,
        dueDate: new Date('2020-01-01T00:00:00.000Z'),
        status: 'COMPLETED',
        completedAt: new Date('2026-03-30T00:00:00.000Z'),
      },
    ])

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
    })

    const body = response.json()
    expect(body.data[0]?.isOverdue).toBe(false)
    await fastify.close()
  })

  it('returns isOverdue=false for CANCELLED deliverable even if past dueDate', async () => {
    mockPrisma.deliverable.findMany.mockResolvedValue([
      {
        ...mockDeliverable,
        dueDate: new Date('2020-01-01T00:00:00.000Z'),
        status: 'CANCELLED',
      },
    ])

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
    })

    const body = response.json()
    expect(body.data[0]?.isOverdue).toBe(false)
    await fastify.close()
  })

  it('returns isOverdue=false for PENDING deliverable with future dueDate', async () => {
    mockPrisma.deliverable.findMany.mockResolvedValue([
      { ...mockDeliverable, dueDate: new Date('2030-01-01T00:00:00.000Z'), status: 'PENDING' },
    ])

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
    })

    const body = response.json()
    expect(body.data[0]?.isOverdue).toBe(false)
    await fastify.close()
  })
})

describe('POST /api/v1/deals/:dealId/deliverables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
    mockPrisma.deal.findFirst.mockResolvedValue(mockDealStub)
    mockPrisma.deliverable.create.mockResolvedValue(mockDeliverable)
  })

  it('creates deliverable with required fields and returns 201', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
      payload: {
        title: '3x Instagram Reels',
        platform: 'INSTAGRAM',
        type: 'REEL',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.data.id).toBe(DELIVERABLE_ID)
    expect(body.data.title).toBe('3x Instagram Reels')
    await fastify.close()
  })

  it('creates deliverable with all optional fields', async () => {
    mockPrisma.deliverable.create.mockResolvedValue({
      ...mockDeliverable,
      dueDate: new Date('2026-05-01T00:00:00.000Z'),
      notes: 'Week 1 campaign content',
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
      payload: {
        title: '3x Instagram Reels',
        platform: 'INSTAGRAM',
        type: 'REEL',
        dueDate: '2026-05-01T00:00:00.000Z',
        notes: 'Week 1 campaign content',
      },
    })

    expect(response.statusCode).toBe(201)
    await fastify.close()
  })

  it('returns 404 when deal does not exist', async () => {
    mockPrisma.deal.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      headers: auth,
      url: `/api/v1/deals/550e8400-e29b-41d4-a716-000000000000/deliverables`,
      payload: {
        title: '3x Instagram Reels',
        platform: 'INSTAGRAM',
        type: 'REEL',
      },
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 400 when title is missing', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
      payload: { platform: 'INSTAGRAM', type: 'REEL' },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when title is empty string', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
      payload: { title: '', platform: 'INSTAGRAM', type: 'REEL' },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when platform is missing', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
      payload: { title: '3x Reels', type: 'REEL' },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when type is missing', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
      payload: { title: '3x Reels', platform: 'INSTAGRAM' },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when platform is invalid enum value', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
      payload: { title: '3x Reels', platform: 'TIKTOK', type: 'REEL' },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when type is invalid enum value', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      headers: auth,
      url: `/api/v1/deals/${DEAL_ID}/deliverables`,
      payload: { title: '3x Reels', platform: 'INSTAGRAM', type: 'TWEET' },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })
})

describe('PATCH /api/v1/deliverables/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('updates deliverable title and returns 200', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue(mockDeliverable)
    mockPrisma.deliverable.update.mockResolvedValue({
      ...mockDeliverable,
      title: 'Updated title',
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      headers: auth,
      url: `/api/v1/deliverables/${DELIVERABLE_ID}`,
      payload: { title: 'Updated title' },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data.title).toBe('Updated title')
    await fastify.close()
  })

  it('marks deliverable COMPLETED and sets completedAt', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue(mockDeliverable)
    mockPrisma.deliverable.update.mockResolvedValue({
      ...mockDeliverable,
      status: 'COMPLETED',
      completedAt: new Date('2026-04-04T12:00:00.000Z'),
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      headers: auth,
      url: `/api/v1/deliverables/${DELIVERABLE_ID}`,
      payload: { status: 'COMPLETED' },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data.status).toBe('COMPLETED')
    expect(body.data.completedAt).not.toBeNull()
    await fastify.close()
  })

  it('reverts COMPLETED deliverable to PENDING and clears completedAt', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue({
      ...mockDeliverable,
      status: 'COMPLETED',
      completedAt: new Date('2026-04-03T00:00:00.000Z'),
    })
    mockPrisma.deliverable.update.mockResolvedValue({
      ...mockDeliverable,
      status: 'PENDING',
      completedAt: null,
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      headers: auth,
      url: `/api/v1/deliverables/${DELIVERABLE_ID}`,
      payload: { status: 'PENDING' },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data.status).toBe('PENDING')
    expect(body.data.completedAt).toBeNull()
    await fastify.close()
  })

  it('returns 404 when deliverable does not exist', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      headers: auth,
      url: `/api/v1/deliverables/770e8400-e29b-41d4-a716-000000000000`,
      payload: { status: 'COMPLETED' },
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 400 for invalid status enum', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue(mockDeliverable)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      headers: auth,
      url: `/api/v1/deliverables/${DELIVERABLE_ID}`,
      payload: { status: 'DONE' },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('clears dueDate when set to null', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue({
      ...mockDeliverable,
      dueDate: new Date('2026-05-01T00:00:00.000Z'),
    })
    mockPrisma.deliverable.update.mockResolvedValue({
      ...mockDeliverable,
      dueDate: null,
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      headers: auth,
      url: `/api/v1/deliverables/${DELIVERABLE_ID}`,
      payload: { dueDate: null },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data.dueDate).toBeNull()
    await fastify.close()
  })
})

describe('DELETE /api/v1/deliverables/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('deletes deliverable and returns 204', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue(mockDeliverable)
    mockPrisma.deliverable.delete.mockResolvedValue(mockDeliverable)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      headers: auth,
      url: `/api/v1/deliverables/${DELIVERABLE_ID}`,
    })

    expect(response.statusCode).toBe(204)
    await fastify.close()
  })

  it('returns 404 when deliverable does not exist', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      headers: auth,
      url: `/api/v1/deliverables/770e8400-e29b-41d4-a716-000000000000`,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })
})
