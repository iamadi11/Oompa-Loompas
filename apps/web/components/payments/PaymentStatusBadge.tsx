import type { PaymentStatus } from '@oompa/types'

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-900 border border-amber-200/80',
  PARTIAL: 'bg-brand-100 text-brand-900 border border-brand-200/80',
  RECEIVED: 'bg-emerald-100 text-emerald-900 border border-emerald-200/80',
  OVERDUE: 'bg-red-100 text-red-800 border border-red-200/80',
  REFUNDED: 'bg-stone-200 text-stone-600 border border-stone-300/60',
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PARTIAL: 'Partial',
  RECEIVED: 'Received',
  OVERDUE: 'Overdue',
  REFUNDED: 'Refunded',
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  isOverdue?: boolean
}

export function PaymentStatusBadge({ status, isOverdue }: PaymentStatusBadgeProps) {
  const effectiveStatus: PaymentStatus = isOverdue && status === 'PENDING' ? 'OVERDUE' : status

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[effectiveStatus]}`}
    >
      {STATUS_LABELS[effectiveStatus]}
    </span>
  )
}
