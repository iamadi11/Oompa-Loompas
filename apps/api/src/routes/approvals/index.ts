import type { FastifyInstance } from 'fastify'
import { getApprovalView, submitApproval } from './handlers.js'

export async function approvalRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:token', getApprovalView)
  fastify.post('/:token', submitApproval)
}
