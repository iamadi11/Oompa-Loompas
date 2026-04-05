import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import type { Prisma } from '@oompa/db'
import {
  type Currency,
  type DashboardPriorityAction,
  type DealStatus,
  type DeliverableStatus,
  type PaymentStatus,
  computeIsDeliverableOverdue,
  computeIsOverdue,
  computePaymentSummary,
} from '@oompa/types'

const MAX_PRIORITY_ACTIONS = 10

type DbDealWithRelations = {
  id: string
  title: string
  brandName: string
  value: Prisma.Decimal
  currency: string
  status: string
  startDate: Date | null
  endDate: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  payments: Array<{
    id: string
    dealId: string
    amount: Prisma.Decimal
    currency: string
    status: string
    dueDate: Date | null
    receivedAt: Date | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
  }>
  deliverables: Array<{
    id: string
    dealId: string
    title: string
    dueDate: Date | null
    status: string
    createdAt: Date
    updatedAt: Date
  }>
}

function comparePriorityActions(a: DashboardPriorityAction, b: DashboardPriorityAction): number {
  const timeA =
    a.dueDate !== null ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
  const timeB =
    b.dueDate !== null ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
  if (timeA !== timeB) return timeA - timeB
  const kindRank = (k: DashboardPriorityAction['kind']) => (k === 'overdue_payment' ? 0 : 1)
  const kr = kindRank(a.kind) - kindRank(b.kind)
  if (kr !== 0) return kr
  const idA = a.kind === 'overdue_payment' ? a.paymentId : a.deliverableId
  const idB = b.kind === 'overdue_payment' ? b.paymentId : b.deliverableId
  return idA.localeCompare(idB)
}

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

export async function getDashboard(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Single query: all deals with payments + deliverables, ordered by most recent first
  const deals = await prisma.deal.findMany({
    include: { payments: true, deliverables: true },
    orderBy: { createdAt: 'desc' },
  }) as DbDealWithRelations[]

  let totalContractedValue = 0
  let totalReceivedValue = 0
  let overduePaymentsCount = 0
  let overduePaymentsValue = 0
  let activeDealsCount = 0
  const priorityActions: DashboardPriorityAction[] = []

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
        priorityActions.push({
          kind: 'overdue_payment',
          dealId: deal.id,
          dealTitle: deal.title,
          paymentId: payment.id,
          amount,
          currency: payment.currency as Currency,
          dueDate: payment.dueDate?.toISOString() ?? null,
        })
      }
    }

    for (const d of deal.deliverables) {
      const dStatus = d.status as DeliverableStatus
      if (computeIsDeliverableOverdue(d.dueDate, dStatus)) {
        priorityActions.push({
          kind: 'overdue_deliverable',
          dealId: deal.id,
          dealTitle: deal.title,
          deliverableId: d.id,
          deliverableTitle: d.title,
          dueDate: d.dueDate?.toISOString() ?? null,
        })
      }
    }
  }

  priorityActions.sort(comparePriorityActions)
  const cappedPriorityActions = priorityActions.slice(0, MAX_PRIORITY_ACTIONS)

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

  void reply.status(200).send({
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
      priorityActions: cappedPriorityActions,
    },
  })
}
