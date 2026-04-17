import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import type { DashboardPriorityAction } from '@oompa/types'
import {
  buildAttentionQueueCsv,
  attentionQueueExportFilename,
  type AttentionQueueCsvRow,
} from '@oompa/utils'
import { UnauthorizedError, sendError } from '../../lib/errors.js'
import {
  collectPriorityActionsFromDeals,
  type DbDealWithRelations,
} from '../../lib/priority-actions.js'

/** Same bound as other portfolio exports — pathological queues stay bounded. */
const ATTENTION_EXPORT_MAX = 5000

async function loadDealsForAttention(userId: string): Promise<DbDealWithRelations[]> {
  return prisma.deal.findMany({
    where: { userId },
    include: { payments: true, deliverables: true },
    orderBy: { createdAt: 'desc' },
  }) as Promise<DbDealWithRelations[]>
}

function priorityActionsToCsvRows(
  actions: DashboardPriorityAction[],
  dealBrandById: Map<string, string>,
): AttentionQueueCsvRow[] {
  return actions.map((a) => {
    if (a.kind === 'overdue_payment') {
      return {
        kind: a.kind,
        dealId: a.dealId,
        dealTitle: a.dealTitle,
        brandName: a.brandName,
        paymentId: a.paymentId,
        paymentAmount: a.amount,
        paymentCurrency: a.currency,
        deliverableId: '',
        deliverableTitle: '',
        dueDate: a.dueDate,
      }
    }
    return {
      kind: a.kind,
      dealId: a.dealId,
      dealTitle: a.dealTitle,
      brandName: dealBrandById.get(a.dealId) ?? '',
      paymentId: '',
      paymentAmount: null,
      paymentCurrency: null,
      deliverableId: a.deliverableId,
      deliverableTitle: a.deliverableTitle,
      dueDate: a.dueDate,
    }
  })
}

export async function getAttention(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    sendError(reply, new UnauthorizedError())
    return
  }

  const deals = await loadDealsForAttention(userId)
  const actions = collectPriorityActionsFromDeals(deals)

  return reply.status(200).send({
    data: { actions },
  })
}

export async function exportAttentionCsv(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    sendError(reply, new UnauthorizedError())
    return
  }

  const deals = await loadDealsForAttention(userId)
  const actions = collectPriorityActionsFromDeals(deals).slice(0, ATTENTION_EXPORT_MAX)
  const dealBrandById = new Map(deals.map((d) => [d.id, d.brandName]))
  const rows = priorityActionsToCsvRows(actions, dealBrandById)
  const body = `\uFEFF${buildAttentionQueueCsv(rows)}`
  const filename = attentionQueueExportFilename(new Date())

  return reply
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .status(200)
    .send(body)
}
