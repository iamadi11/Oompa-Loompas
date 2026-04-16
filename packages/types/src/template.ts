import { z } from 'zod'
import { CurrencySchema, IdSchema } from './common.js'
import { DeliverablePlatformSchema, DeliverableTypeSchema } from './deliverable.js'

// ─── Template deliverable ─────────────────────────────────────────────────────

export const TemplateDeliverableSchema = z.object({
  id: IdSchema,
  templateId: IdSchema,
  title: z.string().min(1).max(255),
  platform: DeliverablePlatformSchema,
  type: DeliverableTypeSchema,
  notes: z.string().max(2000).nullable(),
  sortOrder: z.number().int().nonnegative(),
})
export type TemplateDeliverable = z.infer<typeof TemplateDeliverableSchema>

export const CreateTemplateDeliverableSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  platform: DeliverablePlatformSchema,
  type: DeliverableTypeSchema,
  notes: z.string().max(2000).nullable().optional(),
})
export type CreateTemplateDeliverable = z.infer<typeof CreateTemplateDeliverableSchema>

// ─── Template payment ─────────────────────────────────────────────────────────

export const TemplatePaymentSchema = z.object({
  id: IdSchema,
  templateId: IdSchema,
  label: z.string().min(1).max(255),
  percentage: z.number().positive().max(100),
  notes: z.string().max(2000).nullable(),
  sortOrder: z.number().int().nonnegative(),
})
export type TemplatePayment = z.infer<typeof TemplatePaymentSchema>

export const CreateTemplatePaymentSchema = z.object({
  label: z.string().min(1, 'Label is required').max(255),
  percentage: z
    .number({ required_error: 'Percentage is required' })
    .positive('Percentage must be positive')
    .max(100, 'Percentage cannot exceed 100'),
  notes: z.string().max(2000).nullable().optional(),
})
export type CreateTemplatePayment = z.infer<typeof CreateTemplatePaymentSchema>

// ─── Template ─────────────────────────────────────────────────────────────────

export const DealTemplateSchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(255),
  defaultValue: z.number().positive().nullable(),
  currency: CurrencySchema,
  notes: z.string().max(5000).nullable(),
  deliverables: z.array(TemplateDeliverableSchema),
  payments: z.array(TemplatePaymentSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type DealTemplate = z.infer<typeof DealTemplateSchema>

export const CreateDealTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255),
  defaultValue: z.number().positive().nullable().optional(),
  currency: CurrencySchema.optional(),
  notes: z.string().max(5000).nullable().optional(),
  deliverables: z.array(CreateTemplateDeliverableSchema).max(10, 'Maximum 10 deliverables').default([]),
  payments: z.array(CreateTemplatePaymentSchema).max(10, 'Maximum 10 payment milestones').default([]),
})
export type CreateDealTemplate = z.infer<typeof CreateDealTemplateSchema>

export const UpdateDealTemplateSchema = CreateDealTemplateSchema
export type UpdateDealTemplate = z.infer<typeof UpdateDealTemplateSchema>

export const SaveAsTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255),
})
export type SaveAsTemplate = z.infer<typeof SaveAsTemplateSchema>

/** Maximum number of templates allowed per user. */
export const DEAL_TEMPLATE_MAX_PER_USER = 20
