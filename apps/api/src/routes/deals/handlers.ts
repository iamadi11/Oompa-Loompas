import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import { Prisma } from '@oompa/db'
import {
  type CreateDeal,
  type UpdateDeal,
  type DealListFilters,
  isValidStatusTransition,
} from '@oompa/types'
import { validate } from '@oompa/utils'
import {
  CreateDealSchema,
  UpdateDealSchema,
  DealListFiltersSchema,
} from './schema.js'
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  sendError,
} from '../../lib/errors.js'

function serializeDeal(deal: {
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
}) {
  return {
    id: deal.id,
    title: deal.title,
    brandName: deal.brandName,
    value: Number(deal.value),
    currency: deal.currency,
    status: deal.status,
    startDate: deal.startDate?.toISOString() ?? null,
    endDate: deal.endDate?.toISOString() ?? null,
    notes: deal.notes,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
  }
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

  const { status, brandName, sortBy, sortOrder, needsAttention } = parsed.data
  const page = parsed.data.page ?? 1
  const limit = parsed.data.limit ?? 20

  const now = new Date()
  const andFilters: Prisma.DealWhereInput[] = []

  if (status) andFilters.push({ status })
  if (brandName) {
    andFilters.push({ brandName: { contains: brandName, mode: 'insensitive' } })
  }
  if (needsAttention === 'true') {
    andFilters.push({
      OR: [
        {
          payments: {
            some: {
              dueDate: { not: null, lt: now },
              status: { notIn: ['RECEIVED', 'REFUNDED'] },
            },
          },
        },
        {
          deliverables: {
            some: {
              status: 'PENDING',
              dueDate: { not: null, lt: now },
            },
          },
        },
      ],
    })
  }

  const where: Prisma.DealWhereInput =
    andFilters.length === 0 ? { userId } : { userId, AND: andFilters }

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

  const { title, brandName, value, currency, status, startDate, endDate, notes } = parsed.data

  const deal = await prisma.deal.create({
    data: {
      userId,
      title,
      brandName,
      value: new Prisma.Decimal(value),
      currency: currency as 'INR' | 'USD' | 'EUR' | 'GBP',
      status: status as
        | 'DRAFT'
        | 'NEGOTIATING'
        | 'ACTIVE'
        | 'DELIVERED'
        | 'PAID'
        | 'CANCELLED',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      notes: notes ?? null,
    },
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
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.brandName !== undefined && { brandName: updates.brandName }),
      ...(updates.value !== undefined && { value: new Prisma.Decimal(updates.value) }),
      ...(updates.currency !== undefined && {
        currency: updates.currency,
      }),
      ...(updates.status !== undefined && {
        status: updates.status,
      }),
      ...(updates.startDate !== undefined && {
        startDate: updates.startDate ? new Date(updates.startDate) : null,
      }),
      ...(updates.endDate !== undefined && {
        endDate: updates.endDate ? new Date(updates.endDate) : null,
      }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
    },
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
