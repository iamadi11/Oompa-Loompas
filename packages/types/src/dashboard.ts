import { z } from 'zod'
import { CurrencySchema, IdSchema } from './common.js'
import { DealStatusSchema } from './deal.js'
import { PaymentSummarySchema } from './payment.js'

export const DashboardDealSchema = z.object({
  id: IdSchema,
  title: z.string(),
  brandName: z.string(),
  value: z.number(),
  currency: CurrencySchema,
  status: DealStatusSchema,
  createdAt: z.string().datetime(),
  paymentSummary: PaymentSummarySchema,
})
export type DashboardDeal = z.infer<typeof DashboardDealSchema>

/** Actionable items surfaced on the dashboard (overdue money or work). */
export const DashboardOverduePaymentActionSchema = z.object({
  kind: z.literal('overdue_payment'),
  dealId: IdSchema,
  dealTitle: z.string(),
  brandName: z.string(),
  paymentId: IdSchema,
  amount: z.number(),
  currency: CurrencySchema,
  dueDate: z.string().datetime().nullable(),
})
export type DashboardOverduePaymentAction = z.infer<typeof DashboardOverduePaymentActionSchema>

export const DashboardOverdueDeliverableActionSchema = z.object({
  kind: z.literal('overdue_deliverable'),
  dealId: IdSchema,
  dealTitle: z.string(),
  deliverableId: IdSchema,
  deliverableTitle: z.string(),
  dueDate: z.string().datetime().nullable(),
})
export type DashboardOverdueDeliverableAction = z.infer<
  typeof DashboardOverdueDeliverableActionSchema
>

export const DashboardPriorityActionSchema = z.discriminatedUnion('kind', [
  DashboardOverduePaymentActionSchema,
  DashboardOverdueDeliverableActionSchema,
])
export type DashboardPriorityAction = z.infer<typeof DashboardPriorityActionSchema>

export const DashboardSummarySchema = z.object({
  totalContractedValue: z.number(),
  totalReceivedValue: z.number(),
  totalOutstandingValue: z.number(),
  overduePaymentsCount: z.number(),
  overduePaymentsValue: z.number(),
  activeDealsCount: z.number(),
  totalDealsCount: z.number(),
  dominantCurrency: CurrencySchema,
  recentDeals: z.array(DashboardDealSchema),
  /** Full count before dashboard cap; use GET /attention for the complete queue. */
  priorityActionsTotalCount: z.number().int().nonnegative(),
  priorityActions: z.array(DashboardPriorityActionSchema),
})
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>

export const AttentionQueueSchema = z.object({
  actions: z.array(DashboardPriorityActionSchema),
})
export type AttentionQueue = z.infer<typeof AttentionQueueSchema>
