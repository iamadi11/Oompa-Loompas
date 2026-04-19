import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import { mockSessionFindUnique, testAuthCookieHeader, TEST_USER_ID } from './auth-test-helpers.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  user: {
    findUnique: ReturnType<typeof vi.fn>
    findUniqueOrThrow: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  session: { findUnique: ReturnType<typeof vi.fn> }
  pushSubscription: { findFirst: ReturnType<typeof vi.fn> }
}

describe('GET /api/v1/settings/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('returns emailDigestEnabled and pushEnabled', async () => {
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({ emailDigestEnabled: true })
    mockPrisma.pushSubscription.findFirst.mockResolvedValue(null)

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/v1/settings/notifications',
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { emailDigestEnabled: boolean; pushEnabled: boolean } }>()
    expect(body.data.emailDigestEnabled).toBe(true)
    expect(body.data.pushEnabled).toBe(false)
  })

  it('returns pushEnabled=true when subscription exists', async () => {
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({ emailDigestEnabled: false })
    mockPrisma.pushSubscription.findFirst.mockResolvedValue({ id: 'sub-1' })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/v1/settings/notifications',
      headers: auth,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ data: { emailDigestEnabled: boolean; pushEnabled: boolean } }>()
    expect(body.data.pushEnabled).toBe(true)
    expect(body.data.emailDigestEnabled).toBe(false)
  })

  it('returns 401 without auth', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/v1/settings/notifications',
    })
    expect(res.statusCode).toBe(401)
  })
})

describe('PATCH /api/v1/settings/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionFindUnique(mockPrisma.session.findUnique, { userId: TEST_USER_ID })
  })

  it('updates emailDigestEnabled to false and returns 204', async () => {
    mockPrisma.user.update.mockResolvedValue({ emailDigestEnabled: false })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/api/v1/settings/notifications',
      headers: auth,
      payload: { emailDigestEnabled: false },
    })

    expect(res.statusCode).toBe(204)
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: TEST_USER_ID },
        data: { emailDigestEnabled: false },
      }),
    )
  })

  it('updates emailDigestEnabled to true and returns 204', async () => {
    mockPrisma.user.update.mockResolvedValue({ emailDigestEnabled: true })

    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/api/v1/settings/notifications',
      headers: auth,
      payload: { emailDigestEnabled: true },
    })

    expect(res.statusCode).toBe(204)
  })

  it('ignores empty body without error', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/api/v1/settings/notifications',
      headers: auth,
      payload: {},
    })

    expect(res.statusCode).toBe(204)
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('returns 401 without auth', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/api/v1/settings/notifications',
      payload: { emailDigestEnabled: false },
    })
    expect(res.statusCode).toBe(401)
  })
})
