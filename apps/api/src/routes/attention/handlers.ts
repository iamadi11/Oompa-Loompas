import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import { UnauthorizedError, sendError } from '../../lib/errors.js'
import { collectPriorityActionsFromDeals, type DbDealWithRelations } from '../../lib/priority-actions.js'

export async function getAttention(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    sendError(reply, new UnauthorizedError())
    return
  }

  const deals = (await prisma.deal.findMany({
    where: { userId },
    include: { payments: true, deliverables: true },
    orderBy: { createdAt: 'desc' },
  })) as DbDealWithRelations[]

  const actions = collectPriorityActionsFromDeals(deals)

  void reply.status(200).send({
    data: { actions },
  })
}
