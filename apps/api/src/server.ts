import Fastify from 'fastify'
import sensible from '@fastify/sensible'
import { corsPlugin } from './plugins/cors.js'
import { dealRoutes } from './routes/deals/index.js'
import { paymentRoutes } from './routes/payments/index.js'
import { dashboardRoutes } from './routes/dashboard/index.js'
import { deliverableRoutes } from './routes/deliverables/index.js'
import { attentionRoutes } from './routes/attention/index.js'

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
    },
  })

  await fastify.register(sensible)
  await fastify.register(corsPlugin)

  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  await fastify.register(dealRoutes, { prefix: '/api/v1/deals' })
  await fastify.register(paymentRoutes, { prefix: '/api/v1' })
  await fastify.register(dashboardRoutes, { prefix: '/api/v1' })
  await fastify.register(deliverableRoutes, { prefix: '/api/v1' })
  await fastify.register(attentionRoutes, { prefix: '/api/v1' })

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
