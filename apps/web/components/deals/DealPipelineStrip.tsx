import Link from 'next/link'
import type { DealStatus } from '@oompa/types'

/**
 * Horizontal strip showing per-status deal counts.
 * Each tab is a link that filters the deals list to that stage.
 *
 * Inputs:  counts per status, currently active status filter
 * Outputs: navigable status tabs with count badges
 * Edge cases: zero-count tabs shown with muted style; active tab highlighted
 * Failure modes: all counts zero → renders empty state tabs correctly
 */

const STATUS_ORDER: DealStatus[] = [
  'DRAFT',
  'NEGOTIATING',
  'ACTIVE',
  'DELIVERED',
  'PAID',
  'CANCELLED',
]

const STATUS_LABELS: Record<DealStatus, string> = {
  DRAFT: 'Draft',
  NEGOTIATING: 'Negotiating',
  ACTIVE: 'Active',
  DELIVERED: 'Delivered',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
}

/** Dot color per status */
const STATUS_DOT: Record<DealStatus, string> = {
  DRAFT: 'bg-stone-400',
  NEGOTIATING: 'bg-amber-500',
  ACTIVE: 'bg-brand-600',
  DELIVERED: 'bg-teal-500',
  PAID: 'bg-emerald-500',
  CANCELLED: 'bg-red-400',
}

type Props = {
  counts: Record<DealStatus, number>
  activeStatus: DealStatus | null
}

export function DealPipelineStrip({ counts, activeStatus }: Props) {
  const totalActive = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <nav
      aria-label="Filter deals by pipeline stage"
      className="flex flex-wrap gap-1.5 mb-5"
    >
      {/* All tab */}
      <Link
        href="/deals"
        className={pipelineTabClass(activeStatus === null)}
        aria-current={activeStatus === null ? 'page' : undefined}
      >
        <span>All</span>
        <span className={countBadgeClass(activeStatus === null)}>{totalActive}</span>
      </Link>

      {STATUS_ORDER.map((status) => {
        const count = counts[status]
        const isActive = activeStatus === status
        return (
          <Link
            key={status}
            href={`/deals?status=${status}`}
            className={pipelineTabClass(isActive, count === 0)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status]}`}
              aria-hidden="true"
            />
            <span>{STATUS_LABELS[status]}</span>
            <span className={countBadgeClass(isActive, count === 0)}>{count}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function pipelineTabClass(active: boolean, muted = false): string {
  const base =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'
  if (active) {
    return `${base} bg-stone-900 text-white shadow-sm`
  }
  if (muted) {
    return `${base} text-stone-400 border border-line/60 bg-surface-raised hover:border-stone-300 hover:text-stone-600`
  }
  return `${base} text-stone-700 border border-line/90 bg-surface-raised shadow-sm hover:border-brand-400/70 hover:text-brand-900`
}

function countBadgeClass(active: boolean, muted = false): string {
  const base = 'tabular-nums ml-0.5'
  if (active) return `${base} text-stone-300`
  if (muted) return `${base} text-stone-400`
  return `${base} text-stone-500`
}
