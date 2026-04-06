import { describe, expect, it } from 'vitest'
import { buildServer } from '../server.js'

describe('GET /health', () => {
  it('returns 200 with ok status and timestamp', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toEqual(
      expect.objectContaining({
        status: 'ok',
        timestamp: expect.any(String),
      }),
    )
    const ts = (body as { timestamp: string }).timestamp
    expect(() => new Date(ts).toISOString()).not.toThrow()
    await fastify.close()
  })
})

describe('GET /api/v1/health', () => {
  it('returns 200 with data envelope for load balancers and versioned probes', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({ method: 'GET', url: '/api/v1/health' })
    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toEqual({
      data: {
        status: 'ok',
        service: '@oompa/api',
      },
      meta: {
        timestamp: expect.any(String),
      },
    })
    const meta = (body as { meta: { timestamp: string } }).meta
    expect(() => new Date(meta.timestamp).toISOString()).not.toThrow()
    await fastify.close()
  })
})
