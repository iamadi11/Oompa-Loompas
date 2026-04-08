import type { Prisma } from '@oompa/db'
import {
  type Currency,
  type DashboardPriorityAction,
  type DeliverableStatus,
  type PaymentStatus,
  computeIsDeliverableOverdue,
  computeIsOverdue,
} from '@oompa/types'

/** Max items returned on the home dashboard; full list lives under GET /attention. */
export const MAX_DASHBOARD_PRIORITY_ACTIONS = 10

export type DbDealWithRelations = {
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

export function comparePriorityActions(
  a: DashboardPriorityAction,
  b: DashboardPriorityAction,
): number {
  const timeA = a.dueDate !== null ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
  const timeB = b.dueDate !== null ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
  if (timeA !== timeB) return timeA - timeB
  const kindRank = (k: DashboardPriorityAction['kind']) => (k === 'overdue_payment' ? 0 : 1)
  const kr = kindRank(a.kind) - kindRank(b.kind)
  if (kr !== 0) return kr
  const idA = a.kind === 'overdue_payment' ? a.paymentId : a.deliverableId
  const idB = b.kind === 'overdue_payment' ? b.paymentId : b.deliverableId
  return idA.localeCompare(idB)
}

/**
 * All overdue payments (PENDING/PARTIAL + past due) and overdue PENDING deliverables, sorted for display.
 */
export function collectPriorityActionsFromDeals(
  deals: DbDealWithRelations[],
): DashboardPriorityAction[] {
  const priorityActions: DashboardPriorityAction[] = []

  for (const deal of deals) {
    for (const payment of deal.payments) {
      const status = payment.status as PaymentStatus
      const amount = Number(payment.amount)
      if (computeIsOverdue(payment.dueDate, status)) {
        priorityActions.push({
          kind: 'overdue_payment',
          dealId: deal.id,
          dealTitle: deal.title,
          brandName: deal.brandName,
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
  return priorityActions
}
