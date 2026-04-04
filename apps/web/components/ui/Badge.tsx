import type { DealStatus } from '@oompa/types'

const STATUS_STYLES: Record<DealStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  NEGOTIATING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-purple-100 text-purple-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
