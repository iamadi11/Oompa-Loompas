import Fastify from 'fastify'
import sensible from '@fastify/sensible'
import { corsPlugin } from './plugins/cors.js'
import { dealRoutes } from './routes/deals/index.js'

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
