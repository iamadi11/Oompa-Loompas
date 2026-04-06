import { describe, it, expect, beforeEach, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { buildServer } from '../server.js'
import { prisma } from '@oompa/db'
import {
  mockSessionFindUnique,
  testAuthCookieHeader,
  TEST_USER_ID,
} from './auth-test-helpers.js'

const auth = testAuthCookieHeader()

const mockPrisma = prisma as typeof prisma & {
  user: { findUnique: ReturnType<typeof vi.fn> }
  session: {
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    deleteMany: ReturnType<typeof vi.fn>
  }
}

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 and sets session cookie for valid credentials', async () => {
    const hash = await bcrypt.hash('correct-password', 4)
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER_ID,
      email: 'admin@test.dev',
      passwordHash: hash,
      roles: ['ADMIN', 'MEMBER'],
    })
    mockPrisma.session.create.mockResolvedValue({})

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'admin@test.dev', password: 'correct-password' },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data.email).toBe('admin@test.dev')
    expect(body.data.roles).toContain('ADMIN')
    const setCookie = response.headers['set-cookie']
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie ?? '')
    expect(cookieHeader).toMatch(/oompa_session=/)
    expect(mockPrisma.session.create).toHaveBeenCalled()
    await fastify.close()
  })

  it('omits Secure on session cookie when WEB_URL is http (even if NODE_ENV is production)', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('WEB_URL', 'http://localhost:3000')
    const hash = await bcrypt.hash('correct-password', 4)
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER_ID,
      email: 'admin@test.dev',
      passwordHash: hash,
      roles: ['ADMIN', 'MEMBER'],
    })
    mockPrisma.session.create.mockResolvedValue({})

    const fastify = await buildServer()
    try {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { email: 'admin@test.dev', password: 'correct-password' },
      })
      expect(response.statusCode).toBe(200)
      const setCookie = response.headers['set-cookie']
      const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie ?? '')
      expect(cookieHeader).toMatch(/oompa_session=/)
      expect(cookieHeader).not.toMatch(/;\s*Secure\b/i)
    } finally {
      await fastify.close()
      vi.unstubAllEnvs()
    }
  })

  it('sets Secure on session cookie when WEB_URL is https', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('WEB_URL', 'https://app.example.com')
    const hash = await bcrypt.hash('correct-password', 4)
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER_ID,
      email: 'admin@test.dev',
      passwordHash: hash,
      roles: ['ADMIN', 'MEMBER'],
    })
    mockPrisma.session.create.mockResolvedValue({})

    const fastify = await buildServer()
    try {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { email: 'admin@test.dev', password: 'correct-password' },
      })
      expect(response.statusCode).toBe(200)
      const setCookie = response.headers['set-cookie']
      const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie ?? '')
      expect(cookieHeader).toMatch(/;\s*Secure\b/i)
    } finally {
      await fastify.close()
      vi.unstubAllEnvs()
    }
  })

  it('returns 401 for unknown email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'nobody@test.dev', password: 'x' },
    })

    expect(response.statusCode).toBe(401)
    await fastify.close()
  })

  it('returns 401 for wrong password', async () => {
    const hash = await bcrypt.hash('secret', 4)
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER_ID,
      email: 'a@test.dev',
      passwordHash: hash,
      roles: ['MEMBER'],
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'a@test.dev', password: 'wrong' },
    })

    expect(response.statusCode).toBe(401)
    await fastify.close()
  })

  it('returns 400 for invalid login body', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'not-an-email', password: 'x' },
    })
    expect(response.statusCode).toBe(400)
    await fastify.close()
  })
})

describe('GET /api/v1/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 when session cookie is valid', async () => {
    mockSessionFindUnique(mockPrisma.session.findUnique, {
      userId: TEST_USER_ID,
      email: 'me@test.dev',
      roles: ['MEMBER'],
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: auth,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().data.id).toBe(TEST_USER_ID)
    await fastify.close()
  })

  it('returns 401 without cookie', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    })

    expect(response.statusCode).toBe(401)
    await fastify.close()
  })
})

describe('POST /api/v1/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 204 and clears session', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 1 })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: auth,
    })

    expect(response.statusCode).toBe(204)
    expect(mockPrisma.session.deleteMany).toHaveBeenCalled()
    await fastify.close()
  })

  it('accepts application/json with empty object (browser client)', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 1 })
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: { ...auth, 'content-type': 'application/json' },
      payload: {},
    })
    expect(response.statusCode).toBe(204)
    await fastify.close()
  })

  it('returns 204 when no session cookie (still clears client cookie)', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
    })
    expect(response.statusCode).toBe(204)
    expect(mockPrisma.session.deleteMany).not.toHaveBeenCalled()
    await fastify.close()
  })
})

describe('Protected routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 for GET /api/v1/deals without session', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/deals',
    })

    expect(response.statusCode).toBe(401)
    await fastify.close()
  })
})

describe('GET /api/v1/admin/ping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 403 for MEMBER', async () => {
    mockSessionFindUnique(mockPrisma.session.findUnique, {
      userId: TEST_USER_ID,
      roles: ['MEMBER'],
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/admin/ping',
      headers: auth,
    })

    expect(response.statusCode).toBe(403)
    await fastify.close()
  })

  it('returns 200 for ADMIN', async () => {
    mockSessionFindUnique(mockPrisma.session.findUnique, {
      userId: TEST_USER_ID,
      roles: ['ADMIN'],
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/admin/ping',
      headers: auth,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().data.ok).toBe(true)
    await fastify.close()
  })
})
