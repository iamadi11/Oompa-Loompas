import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import { collectPriorityActionsFromDeals, type DbDealWithRelations } from '../../lib/priority-actions.js'

export async function getAttention(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const deals = await prisma.deal.findMany({
    include: { payments: true, deliverables: true },
    orderBy: { createdAt: 'desc' },
  }) as DbDealWithRelations[]

  const actions = collectPriorityActionsFromDeals(deals)

  void reply.status(200).send({
    data: { actions },
  })
}
