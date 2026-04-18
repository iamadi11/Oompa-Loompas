import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  session: { findUnique: ReturnType<typeof vi.fn> }
  deliverable: {
    findFirst: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

const DEAL_ID = '550e8400-e29b-41d4-a716-446655440000'
const DEL_ID = '770e8400-e29b-41d4-a716-446655440002'
const APPROVAL_TOKEN = 'a'.repeat(64)

const baseDeliverable = {
  id: DEL_ID,
  dealId: DEAL_ID,
  title: 'YouTube Integration',
  platform: 'YOUTUBE',
  type: 'INTEGRATION',
  dueDate: null,
  status: 'PENDING',
  completedAt: null,
  notes: null,
  approvalToken: null,
  brandApprovedAt: null,
  createdAt: new Date('2026-04-17T00:00:00.000Z'),
  updatedAt: new Date('2026-04-17T00:00:00.000Z'),
  deal: { title: 'Brand Deal', brandName: 'Nike' },
}

// ─── POST /api/v1/deals/:dealId/deliverables/:id/share-approval ───────────

describe('POST /api/v1/deals/:dealId/deliverables/:id/share-approval', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('generates a 64-char approval token and returns approvalUrl', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue({ ...baseDeliverable, approvalToken: null })
    mockPrisma.deliverable.update.mockImplementation(
      ({ data }: { data: { approvalToken: string } }) =>
        Promise.resolve({ ...baseDeliverable, approvalToken: data.approvalToken }),
    )

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${DEAL_ID}/deliverables/${DEL_ID}/share-approval`,
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { approvalToken: string; approvalUrl: string } }>()
    expect(body.data.approvalToken).toMatch(/^[0-9a-f]{64}$/)
    expect(body.data.approvalUrl).toContain('/a/')
    await fastify.close()
  })

  it('returns existing token if already set (idempotent)', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue({
      ...baseDeliverable,
      approvalToken: APPROVAL_TOKEN,
    })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${DEAL_ID}/deliverables/${DEL_ID}/share-approval`,
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { approvalToken: string } }>()
    expect(body.data.approvalToken).toBe(APPROVAL_TOKEN)
    expect(mockPrisma.deliverable.update).not.toHaveBeenCalled()
    await fastify.close()
  })

  it('returns 404 when deliverable not owned by user', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${DEAL_ID}/deliverables/${DEL_ID}/share-approval`,
      headers: auth,
    })

    expect(res.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 401 when not authenticated', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${DEAL_ID}/deliverables/${DEL_ID}/share-approval`,
    })
    expect(res.statusCode).toBe(401)
    await fastify.close()
  })
})

// ─── DELETE /api/v1/deals/:dealId/deliverables/:id/share-approval ─────────

describe('DELETE /api/v1/deals/:dealId/deliverables/:id/share-approval', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('clears approval token and brandApprovedAt, returns 200', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue({
      ...baseDeliverable,
      approvalToken: APPROVAL_TOKEN,
    })
    mockPrisma.deliverable.update.mockResolvedValue({
      ...baseDeliverable,
      approvalToken: null,
      brandApprovedAt: null,
    })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/deals/${DEAL_ID}/deliverables/${DEL_ID}/share-approval`,
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { approvalToken: null } }>()
    expect(body.data.approvalToken).toBeNull()
    await fastify.close()
  })

  it('returns 404 when deliverable not owned by user', async () => {
    mockPrisma.deliverable.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/deals/${DEAL_ID}/deliverables/${DEL_ID}/share-approval`,
      headers: auth,
    })

    expect(res.statusCode).toBe(404)
    await fastify.close()
  })
})

// ─── GET /api/v1/approvals/:token (PUBLIC) ────────────────────────────────

describe('GET /api/v1/approvals/:token', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with approval view when token exists', async () => {
    mockPrisma.deliverable.findUnique.mockResolvedValue({
      ...baseDeliverable,
      approvalToken: APPROVAL_TOKEN,
    })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/v1/approvals/${APPROVAL_TOKEN}`,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { title: string; dealTitle: string; brandApprovedAt: null } }>()
    expect(body.data.title).toBe('YouTube Integration')
    expect(body.data.dealTitle).toBe('Brand Deal')
    expect(body.data.brandApprovedAt).toBeNull()
    await fastify.close()
  })

  it('returns 404 when token is unknown', async () => {
    mockPrisma.deliverable.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/v1/approvals/unknown-token`,
    })

    expect(res.statusCode).toBe(404)
    await fastify.close()
  })

  it('does NOT require authentication', async () => {
    mockPrisma.deliverable.findUnique.mockResolvedValue({
      ...baseDeliverable,
      approvalToken: APPROVAL_TOKEN,
    })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/v1/approvals/${APPROVAL_TOKEN}`,
    })

    expect(res.statusCode).toBe(200)
    await fastify.close()
  })
})

// ─── POST /api/v1/approvals/:token (PUBLIC approve) ───────────────────────

describe('POST /api/v1/approvals/:token', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets brandApprovedAt and returns 200', async () => {
    const approvedAt = new Date('2026-04-17T12:00:00.000Z')
    mockPrisma.deliverable.findUnique
      .mockResolvedValueOnce({ ...baseDeliverable, approvalToken: APPROVAL_TOKEN })
      .mockResolvedValueOnce({
        ...baseDeliverable,
        approvalToken: APPROVAL_TOKEN,
        brandApprovedAt: approvedAt,
      })
    mockPrisma.deliverable.update.mockResolvedValue({
      ...baseDeliverable,
      approvalToken: APPROVAL_TOKEN,
      brandApprovedAt: approvedAt,
    })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/approvals/${APPROVAL_TOKEN}`,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { brandApprovedAt: string } }>()
    expect(body.data.brandApprovedAt).toBe('2026-04-17T12:00:00.000Z')
    await fastify.close()
  })

  it('is idempotent — second submit returns same approved state', async () => {
    const approvedAt = new Date('2026-04-17T12:00:00.000Z')
    mockPrisma.deliverable.findUnique.mockResolvedValue({
      ...baseDeliverable,
      approvalToken: APPROVAL_TOKEN,
      brandApprovedAt: approvedAt,
      deal: { title: 'Brand Deal', brandName: 'Nike' },
    })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/approvals/${APPROVAL_TOKEN}`,
    })

    expect(res.statusCode).toBe(200)
    expect(mockPrisma.deliverable.update).not.toHaveBeenCalled()
    await fastify.close()
  })

  it('returns 404 for unknown token', async () => {
    mockPrisma.deliverable.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/approvals/nonexistent`,
    })

    expect(res.statusCode).toBe(404)
    await fastify.close()
  })

  it('does NOT require authentication', async () => {
    const approvedAt = new Date()
    mockPrisma.deliverable.findUnique.mockResolvedValue({
      ...baseDeliverable,
      approvalToken: APPROVAL_TOKEN,
    })
    mockPrisma.deliverable.update.mockResolvedValue({
      ...baseDeliverable,
      approvalToken: APPROVAL_TOKEN,
      brandApprovedAt: approvedAt,
    })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/approvals/${APPROVAL_TOKEN}`,
    })

    expect(res.statusCode).toBe(200)
    await fastify.close()
  })
})
