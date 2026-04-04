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
      className="flex items-center gap-4 px-4 py-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 transition-colors group"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-gray-900 truncate group-hover:text-brand-600 transition-colors">
            {deal.title}
          </span>
          <StatusBadge status={deal.status} />
          {paymentSummary.hasOverdue && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              Overdue
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400">{deal.brandName}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(deal.value, deal.currency)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {receivedPct}% received
        </p>
      </div>
    </Link>
  )
}
