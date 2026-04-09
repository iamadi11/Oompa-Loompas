import type { DealStatus } from '@oompa/types'

const STATUS_STYLES: Record<DealStatus, string> = {
  DRAFT: 'bg-stone-300/20 text-stone-600 border border-stone-400/30',
  NEGOTIATING: 'bg-amber-950/50 text-amber-300 border border-amber-700/40',
  ACTIVE: 'bg-brand-900/30 text-brand-400 border border-brand-700/40',
  DELIVERED: 'bg-teal-950/40 text-teal-300 border border-teal-700/30',
  PAID: 'bg-emerald-950/40 text-emerald-300 border border-emerald-700/30',
  CANCELLED: 'bg-red-950/30 text-red-400 border border-red-900/30',
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
