import type { FastifyInstance } from 'fastify'
import {
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from './handlers.js'

/**
 * Payment routes nested under deals (for deal-scoped listing/creation)
 * and top-level (for direct payment updates/deletes).
 */
export async function paymentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/deals/:dealId/payments', listPayments)
  fastify.post('/deals/:dealId/payments', createPayment)
  fastify.patch('/payments/:id', updatePayment)
  fastify.delete('/payments/:id', deletePayment)
}
