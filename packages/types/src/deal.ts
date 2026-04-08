import { z } from 'zod'
import { CurrencySchema, IdSchema } from './common.js'

export const DealStatusSchema = z.enum([
  'DRAFT',
  'NEGOTIATING',
  'ACTIVE',
  'DELIVERED',
  'PAID',
  'CANCELLED',
])
export type DealStatus = z.infer<typeof DealStatusSchema>

export const DEAL_STATUS_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  DRAFT: ['NEGOTIATING', 'CANCELLED'],
  NEGOTIATING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['PAID', 'ACTIVE'],
  PAID: [],
  CANCELLED: [],
}

export const DealSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(255),
  brandName: z.string().min(1).max(255),
  value: z.number().positive(),
  currency: CurrencySchema.default('INR'),
  status: DealStatusSchema.default('DRAFT'),
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
  notes: z.string().max(5000).nullable(),
  shareToken: z.string().length(64).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Deal = z.infer<typeof DealSchema>

/** Read-only view of a deal returned on the public proposal page (no userId, no shareToken). */
export const DealProposalViewSchema = z.object({
  title: z.string(),
  brandName: z.string(),
  value: z.number(),
  currency: CurrencySchema,
  status: DealStatusSchema,
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  deliverables: z.array(
    z.object({
      id: IdSchema,
      title: z.string(),
      platform: z.string(),
      type: z.string(),
      dueDate: z.string().datetime().nullable(),
      status: z.string(),
    }),
  ),
  payments: z.array(
    z.object({
      id: IdSchema,
      amount: z.number(),
      currency: CurrencySchema,
      status: z.string(),
      dueDate: z.string().datetime().nullable(),
    }),
  ),
})
export type DealProposalView = z.infer<typeof DealProposalViewSchema>

export const CreateDealSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  brandName: z.string().min(1, 'Brand name is required').max(255),
  value: z.number({ required_error: 'Deal value is required' }).positive('Value must be positive'),
  currency: CurrencySchema.default('INR'),
  status: DealStatusSchema.default('DRAFT'),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
})
export type CreateDeal = z.infer<typeof CreateDealSchema>

export const UpdateDealSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  brandName: z.string().min(1).max(255).optional(),
  value: z.number().positive().optional(),
  currency: CurrencySchema.optional(),
  status: DealStatusSchema.optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
})
export type UpdateDeal = z.infer<typeof UpdateDealSchema>

export const DealListFiltersSchema = z.object({
  status: DealStatusSchema.optional(),
  brandName: z.string().optional(),
  /** Query: `needsAttention=true` — deals with at least one overdue payment or overdue PENDING deliverable. */
  needsAttention: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'value', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type DealListFilters = z.infer<typeof DealListFiltersSchema>

export function isValidStatusTransition(from: DealStatus, to: DealStatus): boolean {
  return DEAL_STATUS_TRANSITIONS[from].includes(to)
}
