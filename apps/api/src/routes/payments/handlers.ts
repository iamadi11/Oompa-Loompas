import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import { Prisma } from '@oompa/db'
import {
  type CreatePayment,
  type UpdatePayment,
  CreatePaymentSchema,
  UpdatePaymentSchema,
  computeIsOverdue,
} from '@oompa/types'
import { validate } from '@oompa/utils'
import { NotFoundError, ValidationError, sendError } from '../../lib/errors.js'

type DbPayment = {
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
}

function serializePayment(payment: DbPayment) {
  const dueDate = payment.dueDate
  const status = payment.status as
    | 'PENDING'
    | 'PARTIAL'
    | 'RECEIVED'
    | 'OVERDUE'
    | 'REFUNDED'

  return {
    id: payment.id,
    dealId: payment.dealId,
    amount: Number(payment.amount),
    currency: payment.currency,
    status,
    dueDate: dueDate?.toISOString() ?? null,
    receivedAt: payment.receivedAt?.toISOString() ?? null,
    notes: payment.notes,
    isOverdue: computeIsOverdue(dueDate, status),
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  }
}

export async function listPayments(
  request: FastifyRequest<{ Params: { dealId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { dealId } = request.params

  const deal = await prisma.deal.findUnique({ where: { id: dealId }, select: { id: true } })
  if (!deal) {
    return sendError(reply, new NotFoundError('Deal', dealId))
  }

  const payments = await prisma.payment.findMany({
    where: { dealId },
    orderBy: { createdAt: 'asc' },
  })

  void reply.status(200).send({ data: payments.map(serializePayment) })
}

export async function createPayment(
  request: FastifyRequest<{ Params: { dealId: string }; Body: CreatePayment }>,
  reply: FastifyReply,
): Promise<void> {
  const { dealId } = request.params

  const deal = await prisma.deal.findUnique({ where: { id: dealId }, select: { id: true } })
  if (!deal) {
    return sendError(reply, new NotFoundError('Deal', dealId))
  }

  const parsed = validate(CreatePaymentSchema, request.body)
  if (!parsed.success) {
    return sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
  }

  const { amount, currency, status, dueDate, notes } = parsed.data

  const payment = await prisma.payment.create({
    data: {
      dealId,
      amount: new Prisma.Decimal(amount),
      currency: (currency ?? 'INR'),
      status: (status ?? 'PENDING'),
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes ?? null,
    },
  })

  void reply.status(201).send({ data: serializePayment(payment) })
}

export async function updatePayment(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdatePayment }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params

  const existing = await prisma.payment.findUnique({ where: { id } })
  if (!existing) {
    return sendError(reply, new NotFoundError('Payment', id))
  }

  const parsed = validate(UpdatePaymentSchema, request.body)
  if (!parsed.success) {
    return sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
  }

  const updates = parsed.data

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      ...(updates.amount !== undefined && { amount: new Prisma.Decimal(updates.amount) }),
      ...(updates.currency !== undefined && {
        currency: updates.currency,
      }),
      ...(updates.status !== undefined && {
        status: updates.status,
      }),
      ...(updates.dueDate !== undefined && {
        dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
      }),
      ...(updates.receivedAt !== undefined && {
        receivedAt: updates.receivedAt ? new Date(updates.receivedAt) : null,
      }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
    },
  })

  void reply.status(200).send({ data: serializePayment(payment) })
}

export async function deletePayment(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params

  const existing = await prisma.payment.findUnique({ where: { id } })
  if (!existing) {
    return sendError(reply, new NotFoundError('Payment', id))
  }

  await prisma.payment.delete({ where: { id } })
  void reply.status(204).send()
}
