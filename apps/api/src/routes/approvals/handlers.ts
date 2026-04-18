import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import { NotFoundError, sendError } from '../../lib/errors.js'

type DbDeliverable = {
  id: string
  title: string
  platform: string
  type: string
  dueDate: Date | null
  status: string
  brandApprovedAt: Date | null
  deal: { title: string; brandName: string }
}

function serializeApprovalView(d: DbDeliverable) {
  return {
    id: d.id,
    title: d.title,
    platform: d.platform,
    type: d.type,
    dueDate: d.dueDate?.toISOString() ?? null,
    status: d.status,
    brandApprovedAt: d.brandApprovedAt?.toISOString() ?? null,
    dealTitle: d.deal.title,
    dealBrandName: d.deal.brandName,
  }
}

/**
 * GET /api/v1/approvals/:token — PUBLIC, no auth required.
 *
 * Inputs:  token (URL param)
 * Outputs: DeliverableApprovalView
 * Edge cases: unknown/revoked token → 404
 */
export async function getApprovalView(
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { token } = request.params

  const deliverable = await prisma.deliverable.findUnique({
    where: { approvalToken: token },
    include: { deal: { select: { title: true, brandName: true } } },
  })

  if (!deliverable) {
    return sendError(reply, new NotFoundError('Approval', token))
  }

  return reply.status(200).send({ data: serializeApprovalView(deliverable as DbDeliverable) })
}

/**
 * POST /api/v1/approvals/:token — PUBLIC, no auth required.
 * Idempotent: sets brandApprovedAt if not already set.
 *
 * Outputs: updated DeliverableApprovalView
 */
export async function submitApproval(
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { token } = request.params

  const existing = await prisma.deliverable.findUnique({
    where: { approvalToken: token },
    include: { deal: { select: { title: true, brandName: true } } },
  })

  if (!existing) {
    return sendError(reply, new NotFoundError('Approval', token))
  }

  const deliverable =
    existing.brandApprovedAt != null
      ? existing
      : await prisma.deliverable.update({
          where: { approvalToken: token },
          data: { brandApprovedAt: new Date() },
          include: { deal: { select: { title: true, brandName: true } } },
        })

  return reply.status(200).send({ data: serializeApprovalView(deliverable as DbDeliverable) })
}
