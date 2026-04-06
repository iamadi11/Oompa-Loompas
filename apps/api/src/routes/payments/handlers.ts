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
import { buildPaymentInvoiceHtml, validate } from '@oompa/utils'
import { NotFoundError, ValidationError, sendError } from '../../lib/errors.js'
import {
  readPaymentInvoiceDocumentLabel,
  readPaymentInvoiceIssuerEnv,
  readPaymentInvoicePlaceOfSupply,
} from '../../lib/payment-invoice-env.js'

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

/**
 * Printable HTML invoice for a single payment milestone (deal-scoped).
 * Returns 404 when the payment is missing or does not belong to the deal.
 */
export async function getPaymentInvoice(
  request: FastifyRequest<{ Params: { dealId: string; paymentId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { dealId, paymentId } = request.params

  const nowIso = new Date().toISOString()

  const assigned = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`SELECT 1 FROM payments WHERE id = ${paymentId} FOR UPDATE`)

    const row = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        deal: {
          select: {
            title: true,
            brandName: true,
            currency: true,
            notes: true,
          },
        },
      },
    })

    if (!row || row.dealId !== dealId) {
      return null
    }

    let invoiceNumber = row.invoiceNumber
    if (!invoiceNumber) {
      const counter = await tx.invoiceCounter.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', lastSeq: 1 },
        update: { lastSeq: { increment: 1 } },
      })
      invoiceNumber = `INV-${String(counter.lastSeq).padStart(8, '0')}`
      await tx.payment.update({
        where: { id: paymentId },
        data: { invoiceNumber },
      })
    }

    return { row, invoiceNumber }
  })

  if (!assigned) {
    return sendError(reply, new NotFoundError('Payment', paymentId))
  }

  const { row, invoiceNumber } = assigned

  const html = buildPaymentInvoiceHtml({
    generatedAtIso: nowIso,
    invoiceDateIso: nowIso,
    invoiceNumber,
    documentLabel: readPaymentInvoiceDocumentLabel(),
    issuer: readPaymentInvoiceIssuerEnv(),
    placeOfSupply: readPaymentInvoicePlaceOfSupply(),
    deal: {
      title: row.deal.title,
      brandName: row.deal.brandName,
      currency: row.deal.currency,
      notes: row.deal.notes,
    },
    payment: {
      id: row.id,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      dueDateIso: row.dueDate?.toISOString() ?? null,
      receivedAtIso: row.receivedAt?.toISOString() ?? null,
      notes: row.notes,
    },
  })

  void reply
    .header('Content-Type', 'text/html; charset=utf-8')
    .header('Cache-Control', 'no-store')
    .status(200)
    .send(html)
}
