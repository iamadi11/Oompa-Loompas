import type { FastifyInstance } from 'fastify'

/**
 * Versioned health probe under `/api/v1/*` for load balancers and deploy checks
 * that only allow traffic to the API prefix.
 */
export async function healthV1Routes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async () => ({
    data: {
      status: 'ok' as const,
      service: '@oompa/api',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  }))
}
