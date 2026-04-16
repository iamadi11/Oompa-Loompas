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

/** Contracted deal value summed for one brand within a single currency (no cross-currency mixing). */
export const DealBrandContractedTotalSchema = z.object({
  currency: CurrencySchema,
  amount: z.number(),
})
export type DealBrandContractedTotal = z.infer<typeof DealBrandContractedTotalSchema>

/** Distinct brand from the creator's portfolio: deal count plus totals per currency. */
export const DealBrandSummarySchema = z.object({
  brandName: z.string(),
  dealCount: z.number().int().nonnegative(),
  contractedTotals: z.array(DealBrandContractedTotalSchema),
})
export type DealBrandSummary = z.infer<typeof DealBrandSummarySchema>

export function isValidStatusTransition(from: DealStatus, to: DealStatus): boolean {
  return DEAL_STATUS_TRANSITIONS[from].includes(to)
}

/**
 * Computes the suggested next status for a deal based on its current state,
 * payment statuses, and deliverable statuses.
 *
 * Purpose: drive the "What should I do next?" banner on the deal detail page.
 * Inputs:
 *   status       — current DealStatus
 *   payments     — array of objects with a `status` string field
 *   deliverables — array of objects with a `status` string field
 * Outputs: DealNextAction (targetStatus + label + description) or null if no advance is suggested.
 * Edge cases:
 *   - Empty payments/deliverables arrays count as "all done" (vacuously true).
 *   - CANCELLED deliverables and REFUNDED payments are excluded from blocking conditions.
 * Failure modes: always returns a value — pure function, no I/O.
 */
export type DealNextAction = {
  targetStatus: DealStatus
  label: string
  description: string
}

export function computeDealNextAction(
  status: DealStatus,
  payments: ReadonlyArray<{ status: string }>,
  deliverables: ReadonlyArray<{ status: string }>,
): DealNextAction | null {
  switch (status) {
    case 'DRAFT':
      return {
        targetStatus: 'NEGOTIATING',
        label: 'Start negotiating',
        description: "This deal is in draft. Move it forward when you're ready to negotiate.",
      }

    case 'NEGOTIATING':
      return {
        targetStatus: 'ACTIVE',
        label: 'Mark as Active',
        description: 'Terms confirmed? Move this deal to Active to start tracking work.',
      }

    case 'ACTIVE': {
      // All non-CANCELLED deliverables must be COMPLETED.
      const activeDeliverables = deliverables.filter((d) => d.status !== 'CANCELLED')
      const allDone = activeDeliverables.every((d) => d.status === 'COMPLETED')
      if (allDone) {
        return {
          targetStatus: 'DELIVERED',
          label: 'Mark as Delivered',
          description:
            activeDeliverables.length > 0
              ? 'All deliverables are complete. Mark this deal as delivered.'
              : 'Ready to mark this deal as delivered?',
        }
      }
      return null
    }

    case 'DELIVERED': {
      // All non-REFUNDED payments must be RECEIVED.
      const activePayments = payments.filter((p) => p.status !== 'REFUNDED')
      const allReceived = activePayments.every((p) => p.status === 'RECEIVED')
      if (allReceived) {
        return {
          targetStatus: 'PAID',
          label: 'Close deal',
          description:
            activePayments.length > 0
              ? 'All payments received. Close this deal.'
              : 'Ready to close this deal?',
        }
      }
      return null
    }

    case 'PAID':
    case 'CANCELLED':
      return null
  }
}
