import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import {
  type CreateDeliverable,
  type UpdateDeliverable,
  computeIsDeliverableOverdue,
} from '@oompa/types'
import { validate } from '@oompa/utils'
import { CreateDeliverableSchema, UpdateDeliverableSchema } from './schema.js'
import { findDealIdForUser } from '../../lib/deal-scope.js'
import { NotFoundError, UnauthorizedError, ValidationError, sendError } from '../../lib/errors.js'

type DbDeliverable = {
  id: string
  dealId: string
  title: string
  platform: string
  type: string
  dueDate: Date | null
  status: string
  completedAt: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

function serializeDeliverable(deliverable: DbDeliverable) {
  const dueDate = deliverable.dueDate
  const status = deliverable.status as 'PENDING' | 'COMPLETED' | 'CANCELLED'

  return {
    id: deliverable.id,
    dealId: deliverable.dealId,
    title: deliverable.title,
    platform: deliverable.platform,
    type: deliverable.type,
    dueDate: dueDate?.toISOString() ?? null,
    status,
    completedAt: deliverable.completedAt?.toISOString() ?? null,
    notes: deliverable.notes,
    isOverdue: computeIsDeliverableOverdue(dueDate, status),
    createdAt: deliverable.createdAt.toISOString(),
    updatedAt: deliverable.updatedAt.toISOString(),
  }
}

export async function listDeliverables(
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

  const deliverables = await prisma.deliverable.findMany({
    where: { dealId },
    orderBy: { createdAt: 'asc' },
  })

  void reply.status(200).send({ data: deliverables.map(serializeDeliverable) })
}

export async function createDeliverable(
  request: FastifyRequest<{ Params: { dealId: string }; Body: CreateDeliverable }>,
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

  const parsed = validate(CreateDeliverableSchema, request.body)
  if (!parsed.success) {
    return sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
  }

  const { title, platform, type, dueDate, notes } = parsed.data

  const deliverable = await prisma.deliverable.create({
    data: {
      dealId,
      title,
      platform: platform,
      type: type,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes ?? null,
    },
  })

  void reply.status(201).send({ data: serializeDeliverable(deliverable) })
}

export async function updateDeliverable(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateDeliverable }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params

  const existing = await prisma.deliverable.findFirst({
    where: { id, deal: { userId } },
  })
  if (!existing) {
    return sendError(reply, new NotFoundError('Deliverable', id))
  }

  const parsed = validate(UpdateDeliverableSchema, request.body)
  if (!parsed.success) {
    return sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
  }

  const updates = parsed.data

  // Auto-manage completedAt based on status transitions
  let completedAt: Date | null | undefined = undefined
  if (updates.status === 'COMPLETED') {
    completedAt = new Date()
  } else if (updates.status === 'PENDING' || updates.status === 'CANCELLED') {
    completedAt = null
  }

  const deliverable = await prisma.deliverable.update({
    where: { id },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.platform !== undefined && {
        platform: updates.platform,
      }),
      ...(updates.type !== undefined && {
        type: updates.type,
      }),
      ...(updates.dueDate !== undefined && {
        dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
      }),
      ...(updates.status !== undefined && {
        status: updates.status,
      }),
      ...(completedAt !== undefined && { completedAt }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
    },
  })

  void reply.status(200).send({ data: serializeDeliverable(deliverable) })
}

export async function deleteDeliverable(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const { id } = request.params

  const existing = await prisma.deliverable.findFirst({
    where: { id, deal: { userId } },
  })
  if (!existing) {
    return sendError(reply, new NotFoundError('Deliverable', id))
  }

  await prisma.deliverable.delete({ where: { id } })
  void reply.status(204).send()
}
