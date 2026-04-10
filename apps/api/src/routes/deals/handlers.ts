import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import {
  type CreateDeal,
  type UpdateDeal,
  type DealListFilters,
  isValidStatusTransition,
} from '@oompa/types'
import {
  buildDealsPortfolioCsv,
  buildDeliverablesPortfolioCsv,
  buildPaymentsPortfolioCsv,
  dealsPortfolioExportFilename,
  deliverablesPortfolioExportFilename,
  paymentsPortfolioExportFilename,
  validate,
  type DeliverablePortfolioCsvRow,
  type PaymentPortfolioCsvRow,
} from '@oompa/utils'
import { CreateDealSchema, UpdateDealSchema, DealListFiltersSchema } from './schema.js'
import { buildDealWhere, serializeDeal, toCreateDealData, toUpdateDealData } from './service.js'
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  sendError,
} from '../../lib/errors.js'
import { generateShareToken } from '../../lib/share-token.js'

/** Hard cap so export stays bounded under pathological portfolios. */
const DEALS_EXPORT_MAX = 5000
const PAYMENTS_EXPORT_MAX = 10_000
const DELIVERABLES_EXPORT_MAX = 10_000

export async function exportDeliverablesCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const deliverables = await prisma.deliverable.findMany({
    where: { deal: { userId } },
    include: { deal: { select: { id: true, title: true, brandName: true } } },
    orderBy: [{ dealId: 'asc' }, { createdAt: 'asc' }],
    take: DELIVERABLES_EXPORT_MAX,
  })

  const csvRows: DeliverablePortfolioCsvRow[] = deliverables.map((d) => ({
    deliverableId: d.id,
    dealId: d.deal.id,
    dealTitle: d.deal.title,
    brandName: d.deal.brandName,
    title: d.title,
    platform: d.platform,
    type: d.type,
    status: d.status,
    dueDate: d.dueDate?.toISOString() ?? null,
    completedAt: d.completedAt?.toISOString() ?? null,
    notes: d.notes,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }))

  const body = `\uFEFF${buildDeliverablesPortfolioCsv(csvRows)}`
  const filename = deliverablesPortfolioExportFilename(new Date())

  void reply
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .status(200)
    .send(body)
}

export async function exportPaymentsCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const payments = await prisma.payment.findMany({
    where: { deal: { userId } },
    include: { deal: { select: { id: true, title: true, brandName: true } } },
    orderBy: [{ dealId: 'asc' }, { createdAt: 'asc' }],
    take: PAYMENTS_EXPORT_MAX,
  })

  const csvRows: PaymentPortfolioCsvRow[] = payments.map((p) => ({
    paymentId: p.id,
    dealId: p.deal.id,
    dealTitle: p.deal.title,
    brandName: p.deal.brandName,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    dueDate: p.dueDate?.toISOString() ?? null,
    receivedAt: p.receivedAt?.toISOString() ?? null,
    invoiceNumber: p.invoiceNumber,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  const body = `\uFEFF${buildPaymentsPortfolioCsv(csvRows)}`
  const filename = paymentsPortfolioExportFilename(new Date())

  void reply
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .status(200)
    .send(body)
}

export async function exportDealsCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const rows = await prisma.deal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: DEALS_EXPORT_MAX,
  })

  const serialized = rows.map(serializeDeal)
  const body = `\uFEFF${buildDealsPortfolioCsv(serialized)}`
  const filename = dealsPortfolioExportFilename(new Date())

  void reply
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .status(200)
    .send(body)
}

export async function listDeals(
  request: FastifyRequest<{ Querystring: DealListFilters }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const parsed = validate(DealListFiltersSchema, request.query)
  if (!parsed.success) {
    return sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
  }

  const { sortBy, sortOrder } = parsed.data
  const page = parsed.data.page ?? 1
  const limit = parsed.data.limit ?? 20

  const where = buildDealWhere(userId, {
    status: parsed.data.status,
    brandName: parsed.data.brandName,
    needsAttention: parsed.data.needsAttention,
  })

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      orderBy: { [sortBy as string]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.deal.count({ where }),
  ])

  void reply.status(200).send({
    data: deals.map(serializeDeal),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function listDealBrands(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const rows = await prisma.deal.groupBy({
    by: ['brandName', 'currency'],
    where: { userId },
    _count: { id: true },
    _sum: { value: true },
    orderBy: [{ brandName: 'asc' }, { currency: 'asc' }],
  })

  const byBrand = new Map<
    string,
    { brandName: string; dealCount: number; segments: Map<string, number> }
  >()

  for (const r of rows) {
    let entry = byBrand.get(r.brandName)
    if (!entry) {
      entry = { brandName: r.brandName, dealCount: 0, segments: new Map() }
      byBrand.set(r.brandName, entry)
    }
    entry.dealCount += r._count.id
    const amt = Number(r._sum.value ?? 0)
    const cur = r.currency
    entry.segments.set(cur, (entry.segments.get(cur) ?? 0) + amt)
  }

  const data = [...byBrand.values()].map((e) => ({
    brandName: e.brandName,
    dealCount: e.dealCount,
    contractedTotals: [...e.segments.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([currency, amount]) => ({ currency, amount })),
  }))

  void reply.status(200).send({ data })
}

export async function getDeal(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params
  const deal = await prisma.deal.findFirst({ where: { id, userId } })
  if (!deal) {
    return sendError(reply, new NotFoundError('Deal', id))
  }
  void reply.status(200).send({ data: serializeDeal(deal) })
}

export async function createDeal(
  request: FastifyRequest<{ Body: CreateDeal }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const parsed = validate(CreateDealSchema, request.body)
  if (!parsed.success) {
    return sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
  }

  const deal = await prisma.deal.create({
    data: toCreateDealData(userId, {
      title: parsed.data.title,
      brandName: parsed.data.brandName,
      value: parsed.data.value,
      currency: parsed.data.currency,
      status: parsed.data.status,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      notes: parsed.data.notes,
    }),
  })

  void reply.status(201).send({ data: serializeDeal(deal) })
}

export async function updateDeal(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateDeal }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params

  const parsed = validate(UpdateDealSchema, request.body)
  if (!parsed.success) {
    return sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
  }

  const existing = await prisma.deal.findFirst({ where: { id, userId } })
  if (!existing) {
    return sendError(reply, new NotFoundError('Deal', id))
  }

  const updates = parsed.data

  if (
    updates.status &&
    updates.status !== existing.status &&
    !isValidStatusTransition(
      existing.status as Parameters<typeof isValidStatusTransition>[0],
      updates.status,
    )
  ) {
    return sendError(
      reply,
      new ConflictError(
        `Cannot transition deal status from '${existing.status}' to '${updates.status}'`,
      ),
    )
  }

  const deal = await prisma.deal.update({
    where: { id },
    data: toUpdateDealData(updates),
  })

  void reply.status(200).send({ data: serializeDeal(deal) })
}

export async function deleteDeal(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params

  const existing = await prisma.deal.findFirst({ where: { id, userId } })
  if (!existing) {
    return sendError(reply, new NotFoundError('Deal', id))
  }

  await prisma.deal.delete({ where: { id } })
  void reply.status(204).send()
}

export async function shareProposal(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params
  const existing = await prisma.deal.findUnique({ where: { id, userId } })
  if (!existing) {
    return sendError(reply, new NotFoundError('Deal', id))
  }

  const shareToken = generateShareToken()
  const updated = await prisma.deal.update({
    where: { id },
    data: { shareToken },
  })

  const shareUrl = `${process.env['WEB_URL'] ?? 'http://localhost:3000'}/p/${updated.shareToken ?? ''}`
  void reply.status(200).send({ data: { shareToken: updated.shareToken, shareUrl } })
}

export async function duplicateDeal(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params

  const existing = await prisma.deal.findFirst({
    where: { id, userId },
    include: { payments: true, deliverables: true },
  })
  if (!existing) {
    return sendError(reply, new NotFoundError('Deal', id))
  }

  const newDeal = await prisma.deal.create({
    data: {
      userId,
      title: `${existing.title} (Copy)`,
      brandName: existing.brandName,
      value: existing.value,
      currency: existing.currency,
      status: 'DRAFT',
      startDate: null,
      endDate: null,
      notes: existing.notes,
      ...(existing.payments.length > 0 && {
        payments: {
          createMany: {
            data: existing.payments.map((p) => ({
              amount: p.amount,
              currency: p.currency,
              status: 'PENDING' as const,
              dueDate: null,
              receivedAt: null,
              notes: p.notes,
            })),
          },
        },
      }),
      ...(existing.deliverables.length > 0 && {
        deliverables: {
          createMany: {
            data: existing.deliverables.map((d) => ({
              title: d.title,
              platform: d.platform,
              type: d.type,
              status: 'PENDING' as const,
              dueDate: null,
              completedAt: null,
              notes: d.notes,
            })),
          },
        },
      }),
    },
  })

  void reply.status(201).send({ data: serializeDeal(newDeal) })
}

export async function revokeShare(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params
  const existing = await prisma.deal.findUnique({ where: { id, userId } })
  if (!existing) {
    return sendError(reply, new NotFoundError('Deal', id))
  }

  await prisma.deal.update({ where: { id }, data: { shareToken: null } })
  void reply.status(200).send({ data: { shareToken: null } })
}
