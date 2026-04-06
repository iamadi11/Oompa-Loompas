import Fastify from 'fastify'
import sensible from '@fastify/sensible'
import cookie from '@fastify/cookie'
import { corsPlugin } from './plugins/cors.js'
import { authPlugin } from './plugins/auth.js'
import { getSessionSecret } from './lib/auth-env.js'
import { dealRoutes } from './routes/deals/index.js'
import { paymentRoutes } from './routes/payments/index.js'
import { dashboardRoutes } from './routes/dashboard/index.js'
import { deliverableRoutes } from './routes/deliverables/index.js'
import { attentionRoutes } from './routes/attention/index.js'
import { healthV1Routes } from './routes/health/index.js'
import { createAuthRoutes } from './routes/auth/index.js'
import { adminRoutes } from './routes/admin/index.js'

export async function buildServer() {
  getSessionSecret()

  const fastify = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
    },
  })

  await fastify.register(sensible)
  await fastify.register(cookie)
  await fastify.register(corsPlugin)
  await fastify.register(authPlugin)

  /** Legacy root probe (CORS tests, simple uptime). Prefer `GET /api/v1/health` for versioned monitoring. */
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  await fastify.register(healthV1Routes, { prefix: '/api/v1' })
  await fastify.register(createAuthRoutes(fastify), { prefix: '/api/v1/auth' })

  /** Encapsulated scope so `authenticate` runs only under `/api/v1/*` (not global). */
  await fastify.register(
    async function oompaProtectedV1(instance) {
      instance.addHook('preHandler', fastify.authenticate.bind(fastify))
      await instance.register(dealRoutes, { prefix: '/deals' })
      await instance.register(paymentRoutes)
      await instance.register(dashboardRoutes)
      await instance.register(deliverableRoutes)
      await instance.register(attentionRoutes)
      await instance.register(adminRoutes)
    },
    { prefix: '/api/v1' },
  )

  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error)
    void reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    })
  })

  return fastify
}
