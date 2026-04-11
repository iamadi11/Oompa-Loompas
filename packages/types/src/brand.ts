import { z } from 'zod'
import { CurrencySchema } from './common.js'

export const BrandProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  brandName: z.string(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type BrandProfile = z.infer<typeof BrandProfileSchema>

export const UpsertBrandProfileSchema = z.object({
  contactEmail: z.string().email().max(500).nullable().optional(),
  contactPhone: z.string().max(50).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
})
export type UpsertBrandProfile = z.infer<typeof UpsertBrandProfileSchema>

export const BrandProfileStatsSchema = z.object({
  totalDeals: z.number().int().nonnegative(),
  overduePaymentsCount: z.number().int().nonnegative(),
  contractedTotals: z.array(
    z.object({
      currency: CurrencySchema,
      amount: z.number(),
    }),
  ),
})
export type BrandProfileStats = z.infer<typeof BrandProfileStatsSchema>
