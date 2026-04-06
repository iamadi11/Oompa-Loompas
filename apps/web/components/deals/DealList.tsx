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
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4 rounded-2xl border border-dashed border-line-strong/70 bg-surface-raised/50">
        <div className="w-16 h-16 rounded-2xl bg-brand-100/80 border border-brand-200/60 flex items-center justify-center mb-5 shadow-sm">
          <svg
            className="w-8 h-8 text-brand-800"
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
        <h3 className="font-display text-lg font-semibold text-stone-900">{copy.title}</h3>
        <p className="mt-2 text-sm text-stone-600 max-w-md leading-relaxed">{copy.description}</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href={copy.primaryHref}
            className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-700 text-white text-sm font-semibold shadow-sm border border-brand-800/20 hover:bg-brand-800 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            {copy.primaryLabel}
          </Link>
          <Link
            href={copy.secondaryHref}
            className="text-sm font-semibold text-brand-800 hover:text-brand-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            {copy.secondaryLabel}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  )
}
