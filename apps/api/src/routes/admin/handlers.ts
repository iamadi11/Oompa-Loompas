import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError, sendError } from '../../lib/errors.js'

/**
 * RBAC probe: ADMIN-only. Documents the permission pattern for integration tests.
 */
export function getAdminPing(request: FastifyRequest, reply: FastifyReply): void {
  const u = request.authUser
  if (!u?.roles.includes('ADMIN')) {
    sendError(reply, new ForbiddenError())
    return
  }
  void reply.status(200).send({
    data: { ok: true as const, scope: 'admin' as const },
  })
}
