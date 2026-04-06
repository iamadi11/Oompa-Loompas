import { describe, it, expect } from 'vitest'
import { buildServer } from '../server.js'

/**
 * Regression: @fastify/cors must not be registered inside a bare async plugin
 * (Fastify encapsulation), or real GET/POST responses omit CORS headers while
 * OPTIONS preflight can still appear to work in DevTools.
 */
describe('CORS (non-preflight responses)', () => {
  it('adds Access-Control-Allow-Origin on GET /health when Origin is allowed', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://localhost:3000' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000')
    expect(res.headers['access-control-allow-credentials']).toBe('true')
    await fastify.close()
  })

  it('adds Access-Control-Allow-Origin on GET /api/v1/health when Origin is allowed', async () => {
    const fastify = await buildServer()
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'http://localhost:3000' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000')
    await fastify.close()
  })
})
