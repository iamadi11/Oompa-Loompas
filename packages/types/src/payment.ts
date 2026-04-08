import { z } from 'zod'
import { CurrencySchema, IdSchema } from './common.js'

export const PaymentStatusSchema = z.enum(['PENDING', 'PARTIAL', 'RECEIVED', 'OVERDUE', 'REFUNDED'])
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
  isOverdue: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Payment = z.infer<typeof PaymentSchema>

export const CreatePaymentSchema = z.object({
  amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
  currency: CurrencySchema.optional(),
  status: PaymentStatusSchema.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})
export type CreatePayment = z.infer<typeof CreatePaymentSchema>

export const UpdatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  currency: CurrencySchema.optional(),
  status: PaymentStatusSchema.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  receivedAt: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})
export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>

export const PaymentSummarySchema = z.object({
  totalContracted: z.number(),
  totalReceived: z.number(),
  totalOutstanding: z.number(),
  hasOverdue: z.boolean(),
  paymentCount: z.number(),
})
export type PaymentSummary = z.infer<typeof PaymentSummarySchema>

/**
 * Computes whether a payment is overdue.
 * Overdue = has a due date in the past AND status is still PENDING or PARTIAL.
 */
export function computeIsOverdue(dueDate: Date | null, status: PaymentStatus): boolean {
  if (!dueDate) return false
  if (status === 'RECEIVED' || status === 'REFUNDED') return false
  return dueDate.getTime() < Date.now()
}

/**
 * Computes a payment summary for a deal given its payments.
 * All amounts assumed to be in the same currency (deal's currency).
 */
export function computePaymentSummary(
  dealValue: number,
  payments: Array<{ amount: number; status: PaymentStatus; dueDate: Date | null }>,
): PaymentSummary {
  const totalReceived = payments
    .filter((p) => p.status === 'RECEIVED' || p.status === 'PARTIAL')
    .reduce((sum, p) => sum + p.amount, 0)

  const hasOverdue = payments.some((p) => computeIsOverdue(p.dueDate, p.status))

  return {
    totalContracted: dealValue,
    totalReceived,
    totalOutstanding: dealValue - totalReceived,
    hasOverdue,
    paymentCount: payments.length,
  }
}
