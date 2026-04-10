import type { FastifyInstance } from 'fastify'
import { exportAttentionCsv, getAttention } from './handlers.js'

export async function attentionRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/attention/export', exportAttentionCsv)
  fastify.get('/attention', getAttention)
}
