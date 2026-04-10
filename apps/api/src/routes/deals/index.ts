import type { FastifyInstance } from 'fastify'
import {
  listDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  duplicateDeal,
  shareProposal,
  revokeShare,
} from './handlers.js'

export async function dealRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', listDeals)
  fastify.get('/:id', getDeal)
  fastify.post('/', createDeal)
  fastify.patch('/:id', updateDeal)
  fastify.delete('/:id', deleteDeal)
  fastify.post('/:id/duplicate', duplicateDeal)
  fastify.post('/:id/share', shareProposal)
  fastify.delete('/:id/share', revokeShare)
}
