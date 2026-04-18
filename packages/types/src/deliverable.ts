import { z } from 'zod'
import { IdSchema } from './common.js'

export const DeliverableStatusSchema = z.enum(['PENDING', 'COMPLETED', 'CANCELLED'])
export type DeliverableStatus = z.infer<typeof DeliverableStatusSchema>

export const DeliverablePlatformSchema = z.enum([
  'INSTAGRAM',
  'YOUTUBE',
  'TWITTER',
  'LINKEDIN',
  'PODCAST',
  'BLOG',
  'OTHER',
])
export type DeliverablePlatform = z.infer<typeof DeliverablePlatformSchema>

export const DeliverableTypeSchema = z.enum([
  'POST',
  'REEL',
  'STORY',
  'VIDEO',
  'INTEGRATION',
  'MENTION',
  'ARTICLE',
  'OTHER',
])
export type DeliverableType = z.infer<typeof DeliverableTypeSchema>

export const DeliverableSchema = z.object({
  id: IdSchema,
  dealId: IdSchema,
  title: z.string().min(1).max(255),
  platform: DeliverablePlatformSchema,
  type: DeliverableTypeSchema,
  dueDate: z.string().datetime().nullable(),
  status: DeliverableStatusSchema,
  completedAt: z.string().datetime().nullable(),
  notes: z.string().max(2000).nullable(),
  isOverdue: z.boolean(),
  approvalToken: z.string().length(64).nullable(),
  brandApprovedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Deliverable = z.infer<typeof DeliverableSchema>

export const DeliverableApprovalViewSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(255),
  platform: DeliverablePlatformSchema,
  type: DeliverableTypeSchema,
  dueDate: z.string().datetime().nullable(),
  status: DeliverableStatusSchema,
  brandApprovedAt: z.string().datetime().nullable(),
  dealTitle: z.string().min(1).max(255),
  dealBrandName: z.string().min(1).max(255),
})
export type DeliverableApprovalView = z.infer<typeof DeliverableApprovalViewSchema>

export const CreateDeliverableSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  platform: DeliverablePlatformSchema,
  type: DeliverableTypeSchema,
  dueDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})
export type CreateDeliverable = z.infer<typeof CreateDeliverableSchema>

export const UpdateDeliverableSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  platform: DeliverablePlatformSchema.optional(),
  type: DeliverableTypeSchema.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  status: DeliverableStatusSchema.optional(),
  notes: z.string().max(2000).nullable().optional(),
})
export type UpdateDeliverable = z.infer<typeof UpdateDeliverableSchema>

/**
 * Computes whether a deliverable is overdue.
 * Overdue = has a due date in the past AND status is PENDING.
 */
export function computeIsDeliverableOverdue(
  dueDate: Date | null,
  status: DeliverableStatus,
): boolean {
  if (!dueDate) return false
  if (status === 'COMPLETED' || status === 'CANCELLED') return false
  return dueDate.getTime() < Date.now()
}
