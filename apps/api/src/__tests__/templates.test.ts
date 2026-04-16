import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  session: { findUnique: ReturnType<typeof vi.fn> }
  dealTemplate: {
    findMany: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
  }
  deal: {
    findFirst: ReturnType<typeof vi.fn>
  }
  dealTemplateDeliverable: {
    deleteMany: ReturnType<typeof vi.fn>
  }
  dealTemplatePayment: {
    deleteMany: ReturnType<typeof vi.fn>
  }
}

const mockTemplate = {
  id: 'tpl-1',
  userId: TEST_USER_ID,
  name: 'YouTube Integration Standard',
  defaultValue: { toNumber: () => 50000 },
  currency: 'INR',
  notes: null,
  deliverables: [
    {
      id: 'dtd-1',
      templateId: 'tpl-1',
      title: 'YouTube Integration Video',
      platform: 'YOUTUBE',
      type: 'INTEGRATION',
      notes: null,
      sortOrder: 0,
    },
  ],
  payments: [
    {
      id: 'dtp-1',
      templateId: 'tpl-1',
      label: 'Advance',
      percentage: { toNumber: () => 50 },
      notes: null,
      sortOrder: 0,
    },
    {
      id: 'dtp-2',
      templateId: 'tpl-1',
      label: 'On delivery',
      percentage: { toNumber: () => 50 },
      notes: null,
      sortOrder: 1,
    },
  ],
  createdAt: new Date('2026-04-16T00:00:00.000Z'),
  updatedAt: new Date('2026-04-16T00:00:00.000Z'),
}

describe('Deal Templates API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  // ─── GET /api/v1/templates ─────────────────────────────────────────────────

  describe('GET /api/v1/templates', () => {
    it('returns 200 with empty list when user has no templates', async () => {
      mockPrisma.dealTemplate.findMany.mockResolvedValue([])

      const fastify = await buildServer()
      const resp = await fastify.inject({ method: 'GET', url: '/api/v1/templates', headers: auth })

      expect(resp.statusCode).toBe(200)
      expect(resp.json().data).toEqual([])
      await fastify.close()
    })

    it('returns 200 with list of templates including nested items', async () => {
      mockPrisma.dealTemplate.findMany.mockResolvedValue([mockTemplate])

      const fastify = await buildServer()
      const resp = await fastify.inject({ method: 'GET', url: '/api/v1/templates', headers: auth })

      expect(resp.statusCode).toBe(200)
      const body = resp.json()
      expect(body.data).toHaveLength(1)
      expect(body.data[0].name).toBe('YouTube Integration Standard')
      expect(body.data[0].defaultValue).toBe(50000)
      expect(body.data[0].deliverables).toHaveLength(1)
      expect(body.data[0].payments).toHaveLength(2)
      await fastify.close()
    })

    it('returns 401 when unauthenticated', async () => {
      const fastify = await buildServer()
      const resp = await fastify.inject({ method: 'GET', url: '/api/v1/templates' })

      expect(resp.statusCode).toBe(401)
      await fastify.close()
    })
  })

  // ─── POST /api/v1/templates ────────────────────────────────────────────────

  describe('POST /api/v1/templates', () => {
    it('returns 201 with created template', async () => {
      mockPrisma.dealTemplate.count.mockResolvedValue(0)
      mockPrisma.dealTemplate.create.mockResolvedValue(mockTemplate)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/templates',
        headers: auth,
        payload: {
          name: 'YouTube Integration Standard',
          defaultValue: 50000,
          currency: 'INR',
          deliverables: [
            { title: 'YouTube Integration Video', platform: 'YOUTUBE', type: 'INTEGRATION' },
          ],
          payments: [
            { label: 'Advance', percentage: 50 },
            { label: 'On delivery', percentage: 50 },
          ],
        },
      })

      expect(resp.statusCode).toBe(201)
      expect(resp.json().data.name).toBe('YouTube Integration Standard')
      await fastify.close()
    })

    it('returns 400 when name is missing', async () => {
      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/templates',
        headers: auth,
        payload: { deliverables: [], payments: [] },
      })

      expect(resp.statusCode).toBe(400)
      await fastify.close()
    })

    it('returns 400 when deliverables exceed 10', async () => {
      mockPrisma.dealTemplate.count.mockResolvedValue(0)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/templates',
        headers: auth,
        payload: {
          name: 'Too many deliverables',
          deliverables: Array.from({ length: 11 }, (_, i) => ({
            title: `Deliverable ${i + 1}`,
            platform: 'YOUTUBE',
            type: 'VIDEO',
          })),
          payments: [],
        },
      })

      expect(resp.statusCode).toBe(400)
      await fastify.close()
    })

    it('returns 400 when payment percentage is 0 or negative', async () => {
      mockPrisma.dealTemplate.count.mockResolvedValue(0)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/templates',
        headers: auth,
        payload: {
          name: 'Bad payment',
          deliverables: [],
          payments: [{ label: 'Bad', percentage: 0 }],
        },
      })

      expect(resp.statusCode).toBe(400)
      await fastify.close()
    })

    it('returns 409 when user already has 20 templates', async () => {
      mockPrisma.dealTemplate.count.mockResolvedValue(20)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/templates',
        headers: auth,
        payload: { name: 'One more', deliverables: [], payments: [] },
      })

      expect(resp.statusCode).toBe(409)
      await fastify.close()
    })

    it('returns 401 when unauthenticated', async () => {
      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/templates',
        payload: { name: 'Template', deliverables: [], payments: [] },
      })

      expect(resp.statusCode).toBe(401)
      await fastify.close()
    })
  })

  // ─── GET /api/v1/templates/:id ────────────────────────────────────────────

  describe('GET /api/v1/templates/:id', () => {
    it('returns 200 with template detail', async () => {
      mockPrisma.dealTemplate.findFirst.mockResolvedValue(mockTemplate)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'GET',
        url: '/api/v1/templates/tpl-1',
        headers: auth,
      })

      expect(resp.statusCode).toBe(200)
      expect(resp.json().data.id).toBe('tpl-1')
      await fastify.close()
    })

    it('returns 404 when template not found', async () => {
      mockPrisma.dealTemplate.findFirst.mockResolvedValue(null)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'GET',
        url: '/api/v1/templates/nonexistent',
        headers: auth,
      })

      expect(resp.statusCode).toBe(404)
      await fastify.close()
    })

    it('returns 404 when template belongs to different user (scoped query)', async () => {
      mockPrisma.dealTemplate.findFirst.mockResolvedValue(null)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'GET',
        url: '/api/v1/templates/tpl-other-user',
        headers: auth,
      })

      expect(resp.statusCode).toBe(404)
      await fastify.close()
    })
  })

  // ─── PUT /api/v1/templates/:id ────────────────────────────────────────────

  describe('PUT /api/v1/templates/:id', () => {
    it('returns 200 with updated template', async () => {
      mockPrisma.dealTemplate.findFirst.mockResolvedValue(mockTemplate)
      mockPrisma.dealTemplateDeliverable.deleteMany.mockResolvedValue({ count: 1 })
      mockPrisma.dealTemplatePayment.deleteMany.mockResolvedValue({ count: 2 })
      const updated = { ...mockTemplate, name: 'Updated Name' }
      mockPrisma.dealTemplate.update.mockResolvedValue(updated)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'PUT',
        url: '/api/v1/templates/tpl-1',
        headers: auth,
        payload: {
          name: 'Updated Name',
          deliverables: [
            { title: 'New Deliverable', platform: 'INSTAGRAM', type: 'REEL' },
          ],
          payments: [{ label: 'Full payment', percentage: 100 }],
        },
      })

      expect(resp.statusCode).toBe(200)
      expect(resp.json().data.name).toBe('Updated Name')
      await fastify.close()
    })

    it('returns 404 when template not found', async () => {
      mockPrisma.dealTemplate.findFirst.mockResolvedValue(null)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'PUT',
        url: '/api/v1/templates/nonexistent',
        headers: auth,
        payload: { name: 'X', deliverables: [], payments: [] },
      })

      expect(resp.statusCode).toBe(404)
      await fastify.close()
    })

    it('returns 400 when name is empty', async () => {
      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'PUT',
        url: '/api/v1/templates/tpl-1',
        headers: auth,
        payload: { name: '', deliverables: [], payments: [] },
      })

      expect(resp.statusCode).toBe(400)
      await fastify.close()
    })
  })

  // ─── DELETE /api/v1/templates/:id ─────────────────────────────────────────

  describe('DELETE /api/v1/templates/:id', () => {
    it('returns 204 on success', async () => {
      mockPrisma.dealTemplate.findFirst.mockResolvedValue(mockTemplate)
      mockPrisma.dealTemplate.delete.mockResolvedValue(mockTemplate)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'DELETE',
        url: '/api/v1/templates/tpl-1',
        headers: auth,
      })

      expect(resp.statusCode).toBe(204)
      await fastify.close()
    })

    it('returns 404 when template not found', async () => {
      mockPrisma.dealTemplate.findFirst.mockResolvedValue(null)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'DELETE',
        url: '/api/v1/templates/nonexistent',
        headers: auth,
      })

      expect(resp.statusCode).toBe(404)
      await fastify.close()
    })
  })

  // ─── POST /api/v1/deals/:id/save-as-template ──────────────────────────────

  describe('POST /api/v1/deals/:id/save-as-template', () => {
    const mockDealWithItems = {
      id: 'deal-1',
      userId: TEST_USER_ID,
      title: 'Nike Reel Campaign',
      brandName: 'Nike',
      value: { toNumber: () => 80000 },
      currency: 'INR',
      notes: 'Some notes',
      deliverables: [
        {
          id: 'del-1',
          title: 'Instagram Reel',
          platform: 'INSTAGRAM',
          type: 'REEL',
          notes: null,
        },
      ],
      payments: [
        { id: 'pay-1', amount: { toNumber: () => 40000 }, notes: 'Advance payment' },
        { id: 'pay-2', amount: { toNumber: () => 40000 }, notes: null },
      ],
    }

    it('returns 201 with new template derived from deal', async () => {
      mockPrisma.deal.findFirst.mockResolvedValue(mockDealWithItems)
      mockPrisma.dealTemplate.count.mockResolvedValue(0)
      mockPrisma.dealTemplate.create.mockResolvedValue({
        ...mockTemplate,
        name: 'Nike Template',
        defaultValue: { toNumber: () => 80000 },
        deliverables: [
          {
            id: 'dtd-new',
            templateId: 'tpl-1',
            title: 'Instagram Reel',
            platform: 'INSTAGRAM',
            type: 'REEL',
            notes: null,
            sortOrder: 0,
          },
        ],
        payments: [
          {
            id: 'dtp-new-1',
            templateId: 'tpl-1',
            label: 'Advance payment',
            percentage: { toNumber: () => 50 },
            notes: null,
            sortOrder: 0,
          },
          {
            id: 'dtp-new-2',
            templateId: 'tpl-1',
            label: 'Payment 2',
            percentage: { toNumber: () => 50 },
            notes: null,
            sortOrder: 1,
          },
        ],
      })

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/deals/deal-1/save-as-template',
        headers: auth,
        payload: { name: 'Nike Template' },
      })

      expect(resp.statusCode).toBe(201)
      const body = resp.json()
      expect(body.data.name).toBe('Nike Template')
      expect(body.data.defaultValue).toBe(80000)
      expect(body.data.deliverables).toHaveLength(1)
      expect(body.data.payments).toHaveLength(2)
      await fastify.close()
    })

    it('uses payment notes as label, falls back to "Payment N"', async () => {
      mockPrisma.deal.findFirst.mockResolvedValue(mockDealWithItems)
      mockPrisma.dealTemplate.count.mockResolvedValue(0)

      const created = {
        ...mockTemplate,
        deliverables: [],
        payments: [
          {
            id: 'dtp-1',
            templateId: 'tpl-1',
            label: 'Advance payment',
            percentage: { toNumber: () => 50 },
            notes: null,
            sortOrder: 0,
          },
          {
            id: 'dtp-2',
            templateId: 'tpl-1',
            label: 'Payment 2',
            percentage: { toNumber: () => 50 },
            notes: null,
            sortOrder: 1,
          },
        ],
      }
      mockPrisma.dealTemplate.create.mockResolvedValue(created)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/deals/deal-1/save-as-template',
        headers: auth,
        payload: { name: 'My Template' },
      })

      // Verify create was called with correct payment labels
      expect(mockPrisma.dealTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            payments: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ label: 'Advance payment' }),
                expect.objectContaining({ label: 'Payment 2' }),
              ]),
            }),
          }),
        }),
      )
      expect(resp.statusCode).toBe(201)
      await fastify.close()
    })

    it('returns 404 when deal not found', async () => {
      mockPrisma.deal.findFirst.mockResolvedValue(null)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/deals/nonexistent/save-as-template',
        headers: auth,
        payload: { name: 'Template' },
      })

      expect(resp.statusCode).toBe(404)
      await fastify.close()
    })

    it('returns 400 when name is missing', async () => {
      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/deals/deal-1/save-as-template',
        headers: auth,
        payload: {},
      })

      expect(resp.statusCode).toBe(400)
      await fastify.close()
    })

    it('returns 409 when user already has 20 templates', async () => {
      mockPrisma.deal.findFirst.mockResolvedValue(mockDealWithItems)
      mockPrisma.dealTemplate.count.mockResolvedValue(20)

      const fastify = await buildServer()
      const resp = await fastify.inject({
        method: 'POST',
        url: '/api/v1/deals/deal-1/save-as-template',
        headers: auth,
        payload: { name: 'One more template' },
      })

      expect(resp.statusCode).toBe(409)
      await fastify.close()
    })
  })
})
