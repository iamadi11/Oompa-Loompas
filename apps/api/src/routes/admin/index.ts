import type { FastifyInstance } from 'fastify'
import { getAdminPing } from './handlers.js'

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/admin/ping', getAdminPing)
}
