import type { FastifyInstance } from 'fastify'
import { getBrandProfile, upsertBrandProfile, deleteBrandProfile } from './handlers.js'

export async function brandRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:brandName', getBrandProfile)
  fastify.put('/:brandName', upsertBrandProfile)
  fastify.delete('/:brandName', deleteBrandProfile)
}
