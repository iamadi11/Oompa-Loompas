import Link from 'next/link'
import type { Deal } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { StatusBadge } from '../ui/Badge'

interface DealCardProps {
  deal: Deal
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <Link
      href={`/deals/${deal.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide truncate">
            {deal.brandName}
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
            {deal.title}
          </h3>
        </div>
        <StatusBadge status={deal.status} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">
          {formatCurrency(deal.value, deal.currency)}
        </span>
        {deal.endDate && (
          <span className="text-xs text-gray-500">
            Due {new Date(deal.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </Link>
  )
}
