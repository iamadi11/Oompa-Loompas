import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import {
  CreateDealTemplateSchema,
  UpdateDealTemplateSchema,
  SaveAsTemplateSchema,
  DEAL_TEMPLATE_MAX_PER_USER,
} from '@oompa/types'
import { validate } from '@oompa/utils'
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
  sendError,
} from '../../lib/errors.js'
import {
  serializeTemplate,
  derivePaymentLabel,
  computePaymentPercentage,
} from './service.js'

const TEMPLATE_INCLUDE = {
  deliverables: { orderBy: { sortOrder: 'asc' as const } },
  payments: { orderBy: { sortOrder: 'asc' as const } },
}

// ─── GET /api/v1/templates ────────────────────────────────────────────────────

export async function listTemplates(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) return sendError(reply, new UnauthorizedError())

  const templates = await prisma.dealTemplate.findMany({
    where: { userId },
    include: TEMPLATE_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })

  return reply.status(200).send({ data: templates.map(serializeTemplate) })
}

// ─── POST /api/v1/templates ───────────────────────────────────────────────────

export async function createTemplate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) return sendError(reply, new UnauthorizedError())

  const parsed = validate(CreateDealTemplateSchema, request.body)
  if (!parsed.success) {
    return sendError(
      reply,
      new ValidationError(parsed.errors.map((e) => e.message).join(', ')),
    )
  }

  const count = await prisma.dealTemplate.count({ where: { userId } })
  if (count >= DEAL_TEMPLATE_MAX_PER_USER) {
    return sendError(
      reply,
      new ConflictError(
        `Maximum of ${DEAL_TEMPLATE_MAX_PER_USER} templates per user reached. Delete an existing template to create a new one.`,
      ),
    )
  }

  const { name, defaultValue, currency, notes, deliverables = [], payments = [] } = parsed.data
  const template = await prisma.dealTemplate.create({
    data: {
      userId,
      name,
      defaultValue: defaultValue != null ? defaultValue : null,
      currency: currency ?? 'INR',
      notes: notes ?? null,
      deliverables: {
        create: deliverables.map((d, i) => ({
          title: d.title,
          platform: d.platform,
          type: d.type,
          notes: d.notes ?? null,
          sortOrder: i,
        })),
      },
      payments: {
        create: payments.map((p, i) => ({
          label: p.label,
          percentage: p.percentage,
          notes: p.notes ?? null,
          sortOrder: i,
        })),
      },
    },
    include: TEMPLATE_INCLUDE,
  })

  return reply.status(201).send({ data: serializeTemplate(template) })
}

// ─── GET /api/v1/templates/:id ────────────────────────────────────────────────

export async function getTemplate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) return sendError(reply, new UnauthorizedError())

  const { id } = request.params as { id: string }
  const template = await prisma.dealTemplate.findFirst({
    where: { id, userId },
    include: TEMPLATE_INCLUDE,
  })
  if (!template) return sendError(reply, new NotFoundError('Template', id))

  return reply.status(200).send({ data: serializeTemplate(template) })
}

// ─── PUT /api/v1/templates/:id ────────────────────────────────────────────────

export async function updateTemplate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) return sendError(reply, new UnauthorizedError())

  const parsed = validate(UpdateDealTemplateSchema, request.body)
  if (!parsed.success) {
    return sendError(
      reply,
      new ValidationError(parsed.errors.map((e) => e.message).join(', ')),
    )
  }

  const { id } = request.params as { id: string }
  const existing = await prisma.dealTemplate.findFirst({ where: { id, userId } })
  if (!existing) return sendError(reply, new NotFoundError('Template', id))

  const { name, defaultValue, currency, notes, deliverables = [], payments = [] } = parsed.data

  const updated = await prisma.$transaction(async (tx) => {
    await tx.dealTemplateDeliverable.deleteMany({ where: { templateId: id } })
    await tx.dealTemplatePayment.deleteMany({ where: { templateId: id } })
    return tx.dealTemplate.update({
      where: { id, userId },
      data: {
        name,
        defaultValue: defaultValue != null ? defaultValue : null,
        currency: currency ?? existing.currency,
        notes: notes ?? null,
        deliverables: {
          create: deliverables.map((d, i) => ({
            title: d.title,
            platform: d.platform,
            type: d.type,
            notes: d.notes ?? null,
            sortOrder: i,
          })),
        },
        payments: {
          create: payments.map((p, i) => ({
            label: p.label,
            percentage: p.percentage,
            notes: p.notes ?? null,
            sortOrder: i,
          })),
        },
      },
      include: TEMPLATE_INCLUDE,
    })
  })

  return reply.status(200).send({ data: serializeTemplate(updated) })
}

// ─── DELETE /api/v1/templates/:id ─────────────────────────────────────────────

export async function deleteTemplate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) return sendError(reply, new UnauthorizedError())

  const { id } = request.params as { id: string }
  const existing = await prisma.dealTemplate.findFirst({ where: { id, userId } })
  if (!existing) return sendError(reply, new NotFoundError('Template', id))

  await prisma.dealTemplate.delete({ where: { id } })
  return reply.status(204).send()
}

// ─── POST /api/v1/deals/:id/save-as-template ──────────────────────────────────

export async function saveAsTemplate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) return sendError(reply, new UnauthorizedError())

  const parsed = validate(SaveAsTemplateSchema, request.body)
  if (!parsed.success) {
    return sendError(
      reply,
      new ValidationError(parsed.errors.map((e) => e.message).join(', ')),
    )
  }

  const { id: dealId } = request.params as { id: string }
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, userId },
    include: {
      deliverables: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!deal) return sendError(reply, new NotFoundError('Deal', dealId))

  const count = await prisma.dealTemplate.count({ where: { userId } })
  if (count >= DEAL_TEMPLATE_MAX_PER_USER) {
    return sendError(
      reply,
      new ConflictError(
        `Maximum of ${DEAL_TEMPLATE_MAX_PER_USER} templates per user reached. Delete an existing template to create a new one.`,
      ),
    )
  }

  const dealValue = deal.value.toNumber()
  const template = await prisma.dealTemplate.create({
    data: {
      userId,
      name: parsed.data.name,
      defaultValue: deal.value,
      currency: deal.currency,
      notes: deal.notes,
      deliverables: {
        create: deal.deliverables.map((d, i) => ({
          title: d.title,
          platform: d.platform,
          type: d.type,
          notes: d.notes,
          sortOrder: i,
        })),
      },
      payments: {
        create: deal.payments.map((p, i) => ({
          label: derivePaymentLabel(p.notes, i),
          percentage: computePaymentPercentage(p.amount.toNumber(), dealValue),
          notes: null,
          sortOrder: i,
        })),
      },
    },
    include: TEMPLATE_INCLUDE,
  })

  return reply.status(201).send({ data: serializeTemplate(template) })
}
