import type { Prisma } from '@oompa/db'

export type DbTemplateDeliverable = {
  id: string
  templateId: string
  title: string
  platform: string
  type: string
  notes: string | null
  sortOrder: number
}

export type DbTemplatePayment = {
  id: string
  templateId: string
  label: string
  percentage: Prisma.Decimal
  notes: string | null
  sortOrder: number
}

export type DbTemplate = {
  id: string
  name: string
  defaultValue: Prisma.Decimal | null
  currency: string
  notes: string | null
  deliverables: DbTemplateDeliverable[]
  payments: DbTemplatePayment[]
  createdAt: Date
  updatedAt: Date
}

export function serializeTemplate(t: DbTemplate) {
  return {
    id: t.id,
    name: t.name,
    defaultValue: t.defaultValue !== null ? t.defaultValue.toNumber() : null,
    currency: t.currency,
    notes: t.notes,
    deliverables: t.deliverables.map((d) => ({
      id: d.id,
      templateId: d.templateId,
      title: d.title,
      platform: d.platform,
      type: d.type,
      notes: d.notes,
      sortOrder: d.sortOrder,
    })),
    payments: t.payments.map((p) => ({
      id: p.id,
      templateId: p.templateId,
      label: p.label,
      percentage: Number(p.percentage),
      notes: p.notes,
      sortOrder: p.sortOrder,
    })),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

/**
 * Derives payment label from the source payment notes, falling back to "Payment N".
 */
export function derivePaymentLabel(notes: string | null, index: number): string {
  const trimmed = notes?.trim()
  if (trimmed && trimmed.length > 0) {
    return trimmed.slice(0, 255)
  }
  return `Payment ${index + 1}`
}

/**
 * Computes payment percentage from amount and deal value.
 * Returns 0.01 minimum to avoid zero-percentage edge case.
 */
export function computePaymentPercentage(amount: number, dealValue: number): number {
  if (dealValue === 0) return 100
  const pct = Math.round((amount / dealValue) * 100 * 100) / 100
  return Math.max(0.01, Math.min(100, pct))
}
