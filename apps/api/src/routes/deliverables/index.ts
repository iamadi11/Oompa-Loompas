import type { FastifyInstance } from 'fastify'
import {
  listDeliverables,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  generateDeliverableApprovalToken,
  revokeDeliverableApprovalToken,
} from './handlers.js'

/**
 * Deliverable routes nested under deals (for deal-scoped listing/creation)
 * and top-level (for direct deliverable updates/deletes).
 */
export async function deliverableRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/deals/:dealId/deliverables', listDeliverables)
  fastify.post('/deals/:dealId/deliverables', createDeliverable)
  fastify.patch('/deliverables/:id', updateDeliverable)
  fastify.delete('/deliverables/:id', deleteDeliverable)
  fastify.post('/deals/:dealId/deliverables/:id/share-approval', generateDeliverableApprovalToken)
  fastify.delete('/deals/:dealId/deliverables/:id/share-approval', revokeDeliverableApprovalToken)
}
