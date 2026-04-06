import Link from 'next/link'
import type { DashboardDeal } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { StatusBadge } from '../ui/Badge'

interface RecentDealRowProps {
  deal: DashboardDeal
}

export function RecentDealRow({ deal }: RecentDealRowProps) {
  const { paymentSummary } = deal
  const receivedPct =
    paymentSummary.totalContracted > 0
      ? Math.round((paymentSummary.totalReceived / paymentSummary.totalContracted) * 100)
      : 0

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 px-4 py-3.5 rounded-xl border border-line/80 bg-surface-raised shadow-sm hover:border-line-strong hover:shadow-card transition-all duration-200 motion-reduce:transition-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-sm text-stone-900 truncate group-hover:text-brand-800 transition-colors">
            {deal.title}
          </span>
          <StatusBadge status={deal.status} />
          {paymentSummary.hasOverdue && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200/80">
              Overdue
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-stone-500">{deal.brandName}</p>
      </div>

      <div className="text-left sm:text-right shrink-0 flex sm:flex-col justify-between sm:justify-end gap-1 sm:gap-0.5 border-t border-line/60 sm:border-0 pt-2 sm:pt-0">
        <p className="text-sm font-bold tabular-nums text-stone-900">
          {formatCurrency(deal.value, deal.currency)}
        </p>
        <p className="text-xs text-stone-500 tabular-nums">
          {receivedPct}% received
        </p>
      </div>
    </Link>
  )
}
