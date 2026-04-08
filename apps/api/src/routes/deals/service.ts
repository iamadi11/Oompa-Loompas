import { Prisma } from '@oompa/db'
import type { UpdateDeal } from '@oompa/types'

export type DbDeal = {
  id: string
  title: string
  brandName: string
  value: Prisma.Decimal
  currency: string
  status: string
  startDate: Date | null
  endDate: Date | null
  notes: string | null
  shareToken: string | null
  createdAt: Date
  updatedAt: Date
}

export function serializeDeal(deal: DbDeal) {
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
    shareToken: deal.shareToken,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
  }
}

export function buildDealWhere(
  userId: string,
  filters: {
    status: 'DRAFT' | 'NEGOTIATING' | 'ACTIVE' | 'DELIVERED' | 'PAID' | 'CANCELLED' | undefined
    brandName: string | undefined
    needsAttention: 'true' | 'false' | undefined
  },
): Prisma.DealWhereInput {
  const { status, brandName, needsAttention } = filters
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

  return andFilters.length === 0 ? { userId } : { userId, AND: andFilters }
}

export function toCreateDealData(
  userId: string,
  payload: {
    title: string
    brandName: string
    value: number
    currency: 'INR' | 'USD' | 'EUR' | 'GBP' | undefined
    status: 'DRAFT' | 'NEGOTIATING' | 'ACTIVE' | 'DELIVERED' | 'PAID' | 'CANCELLED' | undefined
    startDate: string | null | undefined
    endDate: string | null | undefined
    notes: string | null | undefined
  },
): Prisma.DealUncheckedCreateInput {
  const { title, brandName, value, currency, status, startDate, endDate, notes } = payload
  return {
    userId,
    title,
    brandName,
    value: new Prisma.Decimal(value),
    currency: currency ?? 'INR',
    status: status ?? 'DRAFT',
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    notes: notes ?? null,
  }
}

export function toUpdateDealData(updates: UpdateDeal): Prisma.DealUpdateInput {
  return {
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.brandName !== undefined && { brandName: updates.brandName }),
    ...(updates.value !== undefined && { value: new Prisma.Decimal(updates.value) }),
    ...(updates.currency !== undefined && { currency: updates.currency }),
    ...(updates.status !== undefined && { status: updates.status }),
    ...(updates.startDate !== undefined && {
      startDate: updates.startDate ? new Date(updates.startDate) : null,
    }),
    ...(updates.endDate !== undefined && {
      endDate: updates.endDate ? new Date(updates.endDate) : null,
    }),
    ...(updates.notes !== undefined && { notes: updates.notes }),
  }
}
