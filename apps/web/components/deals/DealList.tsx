import Link from 'next/link'
import type { Deal } from '@oompa/types'
import { getDealListEmptyContent, type DealListEmptyVariant } from '../../lib/deal-list-empty'
import { DealCard } from './DealCard'

interface DealListProps {
  deals: Deal[]
  /** When `needsAttention`, empty list means no overdue work — not “no deals”. */
  emptyVariant?: DealListEmptyVariant
}

export function DealList({ deals, emptyVariant = 'all' }: DealListProps) {
  if (deals.length === 0) {
    const copy = getDealListEmptyContent(emptyVariant)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="w-7 h-7 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900">{copy.title}</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-md">{copy.description}</p>
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={copy.primaryHref}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {copy.primaryLabel}
          </Link>
          <Link
            href={copy.secondaryHref}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {copy.secondaryLabel}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  )
}
