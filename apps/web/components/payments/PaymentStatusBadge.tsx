import type { PaymentStatus } from '@oompa/types'

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
  RECEIVED: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-500',
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[effectiveStatus]}`}
    >
      {STATUS_LABELS[effectiveStatus]}
    </span>
  )
}
