import type { FastifyInstance } from 'fastify'
import { getAttention } from './handlers.js'

export async function attentionRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/attention', getAttention)
}
