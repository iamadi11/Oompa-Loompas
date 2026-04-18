import { Prisma } from '@oompa/db'
import type { CreatePayment, UpdatePayment } from '@oompa/types'
import { computeIsOverdue } from '@oompa/types'

export type DbPayment = {
  id: string
  dealId: string
  amount: Prisma.Decimal
  currency: string
  status: string
  dueDate: Date | null
  receivedAt: Date | null
  remindAt: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export function serializePayment(payment: DbPayment) {
  const dueDate = payment.dueDate
  const status = payment.status as 'PENDING' | 'PARTIAL' | 'RECEIVED' | 'OVERDUE' | 'REFUNDED'

  return {
    id: payment.id,
    dealId: payment.dealId,
    amount: Number(payment.amount),
    currency: payment.currency,
    status,
    dueDate: dueDate?.toISOString() ?? null,
    receivedAt: payment.receivedAt?.toISOString() ?? null,
    remindAt: payment.remindAt?.toISOString() ?? null,
    notes: payment.notes,
    isOverdue: computeIsOverdue(dueDate, status),
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  }
}

export function toCreatePaymentData(
  dealId: string,
  payload: CreatePayment,
): Prisma.PaymentCreateInput {
  const { amount, currency, status, dueDate, notes } = payload
  return {
    deal: { connect: { id: dealId } },
    amount: new Prisma.Decimal(amount),
    currency: currency ?? 'INR',
    status: status ?? 'PENDING',
    dueDate: dueDate ? new Date(dueDate) : null,
    notes: notes ?? null,
  }
}

export function toUpdatePaymentData(updates: UpdatePayment): Prisma.PaymentUpdateInput {
  return {
    ...(updates.amount !== undefined && { amount: new Prisma.Decimal(updates.amount) }),
    ...(updates.currency !== undefined && { currency: updates.currency }),
    ...(updates.status !== undefined && { status: updates.status }),
    ...(updates.dueDate !== undefined && {
      dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
    }),
    ...(updates.receivedAt !== undefined && {
      receivedAt: updates.receivedAt ? new Date(updates.receivedAt) : null,
    }),
    ...(updates.remindAt !== undefined && {
      remindAt: updates.remindAt ? new Date(updates.remindAt) : null,
    }),
    ...(updates.notes !== undefined && { notes: updates.notes }),
  }
}
