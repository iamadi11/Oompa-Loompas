import type { FastifyInstance } from 'fastify'
import { getProposal } from './handlers.js'

export async function shareRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:token', getProposal)
}
