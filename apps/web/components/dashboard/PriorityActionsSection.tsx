import Link from 'next/link'
import type { DashboardPriorityAction } from '@oompa/types'
import { PriorityActionList } from './PriorityActionList'

type Props = {
  actions: DashboardPriorityAction[]
  /** Total overdue items before dashboard cap (same ordering as GET /attention). */
  totalCount: number
}

export function PriorityActionsSection({ actions, totalCount }: Props) {
  if (actions.length === 0) return null

  const showViewAll = totalCount > actions.length

  return (
    <section
      aria-labelledby="priority-actions-heading"
      aria-describedby="priority-actions-desc"
      className="rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50/95 via-surface-raised to-amber-50/40 p-4 sm:p-5 shadow-card"
    >
      <h2
        id="priority-actions-heading"
        className="font-display text-lg font-semibold text-amber-950"
      >
        What to do next
      </h2>
      <p
        id="priority-actions-desc"
        className="mt-1.5 text-sm text-amber-950/80 leading-relaxed max-w-2xl"
      >
        Overdue payments and deliverables — open the deal to follow up or update status.
      </p>
      <PriorityActionList actions={actions} className="mt-4 flex flex-col gap-2" />
      {showViewAll ? (
        <p className="mt-4 text-sm">
          <Link
            href="/attention"
            className="font-semibold text-brand-800 hover:text-brand-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            View all {totalCount} items
          </Link>
        </p>
      ) : null}
    </section>
  )
}
