import Fastify, { type FastifyRequest } from 'fastify'
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
import { approvalRoutes } from './routes/approvals/index.js'
import { brandRoutes } from './routes/brands/index.js'
import { pushRoutes } from './routes/push/index.js'
import { templateRoutes } from './routes/templates/index.js'
import { settingsRoutes } from './routes/settings/index.js'
import { reconcileRoutes } from './routes/reconcile/index.js'
import { saveAsTemplate } from './routes/templates/handlers.js'

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
  await fastify.register(approvalRoutes, { prefix: '/api/v1/approvals' })

  /** Invoices: Publicly accessible via shareToken, or privately via session. */
  await fastify.register(
    async function oompaInvoices(instance) {
      // We don't use the global auth hook here; the handler checks auth optionally.
      instance.get('/deals/:dealId/payments/:paymentId/invoice', async (req, reply) => {
        // Attempt auth if cookies are present, but don't fail yet if missing.
        // The handler will use req.authUser if available, or check the query token.
        const name = 'oompa_session' // Hardcoded for simplicity here or get from auth-env
        if (req.cookies[name]) {
          try {
            await fastify.authenticate(req, reply)
          } catch {
            // Error already sent by authenticate
          }
        }
        if (reply.sent) return
        const { getPaymentInvoice } = await import('./routes/payments/handlers.js')
        return getPaymentInvoice(
          req as FastifyRequest<{
            Params: { dealId: string; paymentId: string }
            Querystring: { token?: string }
          }>,
          reply,
        )
      })
    },
    { prefix: '/api/v1' },
  )

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
      await instance.register(templateRoutes, { prefix: '/templates' })
      await instance.register(settingsRoutes, { prefix: '/settings' })
      await instance.register(reconcileRoutes, { prefix: '/reconcile' })
      instance.post('/deals/:id/save-as-template', saveAsTemplate)
    },
    { prefix: '/api/v1' },
  )

  fastify.setErrorHandler((error, _request, reply) => {
    // If headers already sent (e.g. double reply), just log and abort.
    if (reply.sent) {
      fastify.log.error({ err: error }, 'Headers already sent, suppressing extra error')
      return
    }

    fastify.log.error(error)
    void reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    })
  })

  return fastify
}
