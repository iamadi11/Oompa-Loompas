import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@oompa/db'
import { validate } from '@oompa/utils'
import { UpsertBrandProfileSchema } from './schema.js'
import { serializeBrandProfile, toUpsertBrandProfileData } from './service.js'
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  sendError,
} from '../../lib/errors.js'

export async function getBrandProfile(
  request: FastifyRequest<{ Params: { brandName: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const brandName = decodeURIComponent(request.params.brandName)

  // Verify brand exists in this user's deals
  const dealCount = await prisma.deal.count({
    where: { userId, brandName: { equals: brandName, mode: 'insensitive' } },
  })
  if (dealCount === 0) {
    return sendError(reply, new NotFoundError('Brand', brandName))
  }

  // Load profile (may not exist yet)
  const profile = await prisma.brandProfile.findUnique({
    where: { userId_brandName: { userId, brandName } },
  })

  // Compute stats from deals
  const [dealRows, overdueCount] = await Promise.all([
    prisma.deal.groupBy({
      by: ['currency'],
      where: { userId, brandName: { equals: brandName, mode: 'insensitive' } },
      _count: { id: true },
      _sum: { value: true },
    }),
    prisma.payment.count({
      where: {
        deal: { userId, brandName: { equals: brandName, mode: 'insensitive' } },
        dueDate: { lt: new Date() },
        status: { notIn: ['RECEIVED', 'REFUNDED'] },
      },
    }),
  ])

  const totalDeals = dealRows.reduce((sum, r) => sum + r._count.id, 0)
  const contractedTotals = dealRows
    .map((r) => ({ currency: r.currency, amount: Number(r._sum.value ?? 0) }))
    .sort((a, b) => a.currency.localeCompare(b.currency))

  // Recent deals (last 5)
  const recentDeals = await prisma.deal.findMany({
    where: { userId, brandName: { equals: brandName, mode: 'insensitive' } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      value: true,
      currency: true,
      status: true,
      createdAt: true,
    },
  })

  void reply.status(200).send({
    data: {
      brandName,
      profile: profile ? serializeBrandProfile(profile) : null,
      stats: {
        totalDeals,
        overduePaymentsCount: overdueCount,
        contractedTotals,
      },
      recentDeals: recentDeals.map((d) => ({
        id: d.id,
        title: d.title,
        value: Number(d.value),
        currency: d.currency,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
      })),
    },
  })
}

export async function upsertBrandProfile(
  request: FastifyRequest<{ Params: { brandName: string }; Body: unknown }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const brandName = decodeURIComponent(request.params.brandName)

  // Verify brand exists in this user's deals
  const dealCount = await prisma.deal.count({
    where: { userId, brandName: { equals: brandName, mode: 'insensitive' } },
  })
  if (dealCount === 0) {
    return sendError(reply, new NotFoundError('Brand', brandName))
  }

  const parsed = validate(UpsertBrandProfileSchema, request.body)
  if (!parsed.success) {
    return sendError(reply, new ValidationError(parsed.errors.map((e) => e.message).join(', ')))
  }

  const data = toUpsertBrandProfileData(userId, brandName, parsed.data)

  const profile = await prisma.brandProfile.upsert({
    where: { userId_brandName: { userId, brandName } },
    create: { id: crypto.randomUUID(), ...data },
    update: {
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      notes: data.notes,
    },
  })

  void reply.status(200).send({ data: serializeBrandProfile(profile) })
}

export async function deleteBrandProfile(
  request: FastifyRequest<{ Params: { brandName: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const userId = request.authUser?.id
  if (!userId) {
    return sendError(reply, new UnauthorizedError())
  }

  const brandName = decodeURIComponent(request.params.brandName)

  // Idempotent delete — no error if not found
  await prisma.brandProfile.deleteMany({
    where: { userId, brandName },
  })

  void reply.status(204).send()
}
