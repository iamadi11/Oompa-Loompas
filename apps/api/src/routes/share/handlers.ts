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
}

type DbPayment = {
  id: string
  amount: { toNumber: () => number }
  currency: string
  status: string
  dueDate: Date | null
}

/**
 * GET /api/v1/share/:token — PUBLIC, no auth required.
 *
 * Inputs:  token (URL param) — 64-char hex share token
 * Outputs: DealProposalView (title, brandName, value, deliverables, payments)
 * Edge cases: unknown token → 404
 * Failure modes: DB error propagates to global error handler
 */
export async function getProposal(
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { token } = request.params

  const deal = await prisma.deal.findUnique({
    where: { shareToken: token },
    include: { deliverables: true, payments: true },
  })

  if (!deal) {
    return sendError(reply, new NotFoundError('Proposal', token))
  }

  void reply.status(200).send({
    data: {
      title: deal.title,
      brandName: deal.brandName,
      value: Number(deal.value),
      currency: deal.currency,
      status: deal.status,
      startDate: deal.startDate?.toISOString() ?? null,
      endDate: deal.endDate?.toISOString() ?? null,
      notes: deal.notes,
      deliverables: (deal.deliverables as DbDeliverable[]).map((d) => ({
        id: d.id,
        title: d.title,
        platform: d.platform,
        type: d.type,
        dueDate: d.dueDate?.toISOString() ?? null,
        status: d.status,
      })),
      payments: (deal.payments as DbPayment[]).map((p) => ({
        id: p.id,
        amount: p.amount.toNumber(),
        currency: p.currency,
        status: p.status,
        dueDate: p.dueDate?.toISOString() ?? null,
      })),
    },
  })
}
