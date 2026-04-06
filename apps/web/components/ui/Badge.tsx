import type { DealStatus } from '@oompa/types'

const STATUS_STYLES: Record<DealStatus, string> = {
  DRAFT: 'bg-stone-200/90 text-stone-700 border border-stone-300/60',
  NEGOTIATING: 'bg-amber-100 text-amber-900 border border-amber-200/80',
  ACTIVE: 'bg-brand-100 text-brand-900 border border-brand-200/90',
  DELIVERED: 'bg-teal-100 text-teal-900 border border-teal-200/80',
  PAID: 'bg-emerald-100 text-emerald-900 border border-emerald-200/80',
  CANCELLED: 'bg-red-100 text-red-800 border border-red-200/80',
}

const STATUS_LABELS: Record<DealStatus, string> = {
  DRAFT: 'Draft',
  NEGOTIATING: 'Negotiating',
  ACTIVE: 'Active',
  DELIVERED: 'Delivered',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
}

interface StatusBadgeProps {
  status: DealStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
