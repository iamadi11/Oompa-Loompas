import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import {
  type Currency,
  type DealStatus,
  type PaymentStatus,
  computeIsOverdue,
  computePaymentSummary,
} from '@oompa/types'
import {
  collectPriorityActionsFromDeals,
  MAX_DASHBOARD_PRIORITY_ACTIONS,
  type DbDealWithRelations,
} from '../../lib/priority-actions.js'
import { UnauthorizedError, sendError } from '../../lib/errors.js'

/**
 * Computes the dominant (most frequent) currency across all deals.
 * Falls back to 'INR' when no deals exist.
 */
function computeDominantCurrency(deals: DbDealWithRelations[]): Currency {
  if (deals.length === 0) return 'INR'
  const counts: Record<string, number> = {}
  for (const deal of deals) {
    counts[deal.currency] = (counts[deal.currency] ?? 0) + 1
  }
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return (dominant?.[0] ?? 'INR') as Currency
}

export async function getDashboard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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

  let totalContractedValue = 0
  let totalReceivedValue = 0
  let overduePaymentsCount = 0
  let overduePaymentsValue = 0
  let activeDealsCount = 0

  for (const deal of deals) {
    totalContractedValue += Number(deal.value)
    if (deal.status === 'ACTIVE') activeDealsCount++

    for (const payment of deal.payments) {
      const status = payment.status as PaymentStatus
      const amount = Number(payment.amount)

      if (status === 'RECEIVED' || status === 'PARTIAL') {
        totalReceivedValue += amount
      }

      if (computeIsOverdue(payment.dueDate, status)) {
        overduePaymentsCount++
        overduePaymentsValue += amount
      }
    }
  }

  const allPriorityActions = collectPriorityActionsFromDeals(deals)
  const priorityActionsTotalCount = allPriorityActions.length
  const cappedPriorityActions = allPriorityActions.slice(0, MAX_DASHBOARD_PRIORITY_ACTIONS)

  const recentDeals = deals.slice(0, 5).map((deal) => {
    const dealValue = Number(deal.value)
    const payments = deal.payments.map((p) => ({
      amount: Number(p.amount),
      status: p.status as PaymentStatus,
      dueDate: p.dueDate,
    }))

    return {
      id: deal.id,
      title: deal.title,
      brandName: deal.brandName,
      value: dealValue,
      currency: deal.currency as Currency,
      status: deal.status as DealStatus,
      createdAt: deal.createdAt.toISOString(),
      paymentSummary: computePaymentSummary(dealValue, payments),
    }
  })

  return reply.status(200).send({
    data: {
      totalContractedValue,
      totalReceivedValue,
      totalOutstandingValue: totalContractedValue - totalReceivedValue,
      overduePaymentsCount,
      overduePaymentsValue,
      activeDealsCount,
      totalDealsCount: deals.length,
      dominantCurrency: computeDominantCurrency(deals),
      recentDeals,
      priorityActionsTotalCount,
      priorityActions: cappedPriorityActions,
    },
  })
}
