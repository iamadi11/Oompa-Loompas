import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '@oompa/db'
import { matchTransactionsToPayments, type PendingPaymentRow, type PaymentMatch } from '@oompa/utils'
import { sendError, ValidationError } from '../../lib/errors.js'

const BankTransactionSchema = z.object({
  date: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
})

const MatchRequestSchema = z.object({
  transactions: z.array(BankTransactionSchema),
})

const ApprovalSchema = z.object({
  paymentId: z.string().min(1),
  receivedAt: z.string().min(1),
})

const ApplyRequestSchema = z.object({
  approvals: z.array(ApprovalSchema),
})

function parseIsoDate(s: string): Date {
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date() : d
}

export const reconcileRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /api/v1/reconcile/match
  fastify.post('/match', async (request, reply) => {
    const userId = request.authUser!.id

    const parsed = MatchRequestSchema.safeParse(request.body)
    if (!parsed.success) {
      return sendError(reply, new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid body'))
    }

    const { transactions } = parsed.data

    if (transactions.length === 0) {
      return reply.send({ data: { matches: [], unmatched: [] } })
    }

    // Fetch all pending/partial payments for this user
    const rows = await prisma.payment.findMany({
      where: {
        deal: { userId },
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 200,
      include: { deal: { select: { id: true, title: true, brandName: true, userId: true } } },
    })

    const pendingPayments: PendingPaymentRow[] = rows.map((r) => ({
      id: r.id,
      dealId: r.deal.id,
      dealTitle: r.deal.title,
      brandName: r.deal.brandName,
      amount: r.amount.toNumber(),
      dueDate: r.dueDate,
    }))

    const bankTxs = transactions.map((t) => {
      const tx: { date: Date; amount: number; description?: string } = {
        date: parseIsoDate(t.date),
        amount: t.amount,
      }
      if (t.description !== undefined) tx.description = t.description
      return tx
    })

    const matches = matchTransactionsToPayments(bankTxs, pendingPayments)

    const matchedTxIndices = new Set(matches.map((m) => m.transactionIndex))
    const unmatched = transactions
      .map((_, i) => i)
      .filter((i) => !matchedTxIndices.has(i))

    return reply.send({
      data: {
        matches: matches.map((m: PaymentMatch) => ({
          ...m,
          transactionDate: m.transactionDate.toISOString().split('T')[0],
          suggestedReceivedAt: m.suggestedReceivedAt.toISOString().split('T')[0],
        })),
        unmatched,
      },
    })
  })

  // POST /api/v1/reconcile/apply
  fastify.post('/apply', async (request, reply) => {
    const userId = request.authUser!.id

    const parsed = ApplyRequestSchema.safeParse(request.body)
    if (!parsed.success) {
      return sendError(reply, new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid body'))
    }

    const { approvals } = parsed.data

    if (approvals.length === 0) {
      return reply.send({ data: { updated: 0 } })
    }

    const receivedAtMap = new Map(
      approvals.map((a) => [a.paymentId, parseIsoDate(a.receivedAt)]),
    )

    // Each approval may have a different receivedAt — run updates concurrently, one per payment.
    // userId scope in the where clause prevents cross-user writes.
    const results = await Promise.all(
      approvals.map((a) =>
        prisma.payment.updateMany({
          where: {
            id: a.paymentId,
            deal: { userId },
            status: { in: ['PENDING', 'PARTIAL'] },
          },
          data: {
            status: 'RECEIVED',
            receivedAt: receivedAtMap.get(a.paymentId) ?? new Date(),
          },
        }),
      ),
    )
    const updated = results.reduce((sum, r) => sum + r.count, 0)

    return reply.send({ data: { updated } })
  })
}
