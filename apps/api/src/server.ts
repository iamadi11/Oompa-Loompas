import Fastify from 'fastify'
import compress from '@fastify/compress'
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
import { shareRoutes } from './routes/share/index.js'
import { brandRoutes } from './routes/brands/index.js'
import { pushRoutes } from './routes/push/index.js'

export async function buildServer() {
  getSessionSecret()

  const fastify = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
    },
  })

  await fastify.register(sensible)
  await fastify.register(compress)
  await fastify.register(cookie)
  await fastify.register(corsPlugin)
  await fastify.register(authPlugin)

  /** Legacy root probe (CORS tests, simple uptime). Prefer `GET /api/v1/health` for versioned monitoring. */
  fastify.get('/health', async (_request, reply) => {
    void reply.header('Cache-Control', 'public, max-age=5')
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  await fastify.register(healthV1Routes, { prefix: '/api/v1' })
  await fastify.register(createAuthRoutes(fastify), { prefix: '/api/v1/auth' })
  await fastify.register(shareRoutes, { prefix: '/api/v1/share' })

  /** Invoices: Publicly accessible via shareToken, or privately via session. */
  fastify.get('/api/v1/deals/:dealId/payments/:paymentId/invoice', async (req, reply) => {
    // Attempt authentication but DON'T fail if missing (handler checks token)
    try {
      await (fastify as any).authenticate(req, reply)
    } catch {
      // Ignore auth failure; handler will check for query token
    }
    const { getPaymentInvoice } = await import('./routes/payments/handlers.js')
    return getPaymentInvoice(req as any, reply)
  })

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
      await instance.register(brandRoutes, { prefix: '/brands' })
      await instance.register(pushRoutes, { prefix: '/push' })
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
