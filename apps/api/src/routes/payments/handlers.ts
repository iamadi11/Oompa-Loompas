import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import { Prisma } from '@oompa/db'
import {
  type CreatePayment,
  type UpdatePayment,
  CreatePaymentSchema,
  UpdatePaymentSchema,
} from '@oompa/types'
import { buildPaymentInvoiceHtml, validate } from '@oompa/utils'
import { findDealIdForUser } from '../../lib/deal-scope.js'
import { NotFoundError, UnauthorizedError, ValidationError, sendError } from '../../lib/errors.js'
import { serializePayment, toCreatePaymentData, toUpdatePaymentData } from './service.js'
import {
  readPaymentInvoiceDocumentLabel,
  readPaymentInvoiceIssuerEnv,
  readPaymentInvoicePlaceOfSupply,
} from '../../lib/payment-invoice-env.js'

export async function listPayments(
  request: FastifyRequest<{ Params: { dealId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { dealId } = request.params

  const owned = await findDealIdForUser(dealId, userId)
  if (!owned) {
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
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { dealId } = request.params

  const owned = await findDealIdForUser(dealId, userId)
  if (!owned) {
    return sendError(reply, new NotFoundError('Deal', dealId))
  }

  const parsed = validate(CreatePaymentSchema, request.body)
  if (!parsed.success) {
    return sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
  }

  const payment = await prisma.payment.create({
    data: toCreatePaymentData(dealId, parsed.data),
  })

  void reply.status(201).send({ data: serializePayment(payment) })
}

export async function updatePayment(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdatePayment }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params

  const existing = await prisma.payment.findFirst({
    where: { id, deal: { userId } },
  })
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
    data: toUpdatePaymentData(updates),
  })

  void reply.status(200).send({ data: serializePayment(payment) })
}

export async function deletePayment(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params

  const existing = await prisma.payment.findFirst({
    where: { id, deal: { userId } },
  })
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
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { dealId, paymentId } = request.params

  const nowIso = new Date().toISOString()

  const assigned = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const locked = await tx.$queryRaw<Array<{ ok: number }>>(
      Prisma.sql`
        SELECT 1 AS ok FROM payments p
        INNER JOIN deals d ON d.id = p.deal_id AND d.user_id = ${userId}
        WHERE p.id = ${paymentId} AND p.deal_id = ${dealId}
        FOR UPDATE
      `,
    )
    if (locked.length === 0) {
      return null
    }

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
