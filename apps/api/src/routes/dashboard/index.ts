import type { FastifyInstance } from 'fastify'
import { getDashboard } from './handlers.js'

export async function dashboardRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/dashboard', getDashboard)
}
