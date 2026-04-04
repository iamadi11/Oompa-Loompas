import { z } from 'zod'
import { CurrencySchema, IdSchema } from './common.js'

export const PaymentStatusSchema = z.enum([
  'PENDING',
  'PARTIAL',
  'RECEIVED',
  'OVERDUE',
  'REFUNDED',
])
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>

export const PaymentSchema = z.object({
  id: IdSchema,
  dealId: IdSchema,
  amount: z.number().positive(),
  currency: CurrencySchema.default('INR'),
  status: PaymentStatusSchema.default('PENDING'),
  dueDate: z.string().datetime().nullable(),
  receivedAt: z.string().datetime().nullable(),
  notes: z.string().max(2000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Payment = z.infer<typeof PaymentSchema>
