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
})
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>
