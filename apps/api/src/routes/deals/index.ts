import type { FastifyInstance } from 'fastify'
import { listDeals, getDeal, createDeal, updateDeal, deleteDeal } from './handlers.js'

export async function dealRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', listDeals)
  fastify.get('/:id', getDeal)
  fastify.post('/', createDeal)
  fastify.patch('/:id', updateDeal)
  fastify.delete('/:id', deleteDeal)
}
