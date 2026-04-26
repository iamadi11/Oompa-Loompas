/**
 * Shared Prisma row shapes used across multiple route modules.
 * Prefer Prisma.GetPayload types if the project adds strict Prisma typing later.
 */

export type DbDeliverableRow = {
  id: string
  dealId: string
  title: string
  platform: string
  type: string
  dueDate: Date | null
  status: string
  completedAt: Date | null
  notes: string | null
  approvalToken: string | null
  brandApprovedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
