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
      className="block rounded-2xl border border-line/90 bg-surface-raised p-4 sm:p-5 shadow-card transition-all duration-200 motion-reduce:transition-none hover:border-brand-300/80 hover:shadow-card-hover group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold text-stone-500 uppercase tracking-[0.12em] truncate">
            {deal.brandName}
          </p>
          <h3 className="mt-1 font-display text-base sm:text-lg font-semibold text-stone-900 group-hover:text-brand-800 transition-colors truncate leading-snug">
            {deal.title}
          </h3>
        </div>
        <StatusBadge status={deal.status} />
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <span className="text-lg sm:text-xl font-bold tabular-nums text-stone-900">
          {formatCurrency(deal.value, deal.currency)}
        </span>
        {deal.endDate && (
          <span className="text-xs font-medium text-stone-500 tabular-nums">
            Due {new Date(deal.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </Link>
  )
}
