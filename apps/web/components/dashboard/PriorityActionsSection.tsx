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
      className="rounded-xl border border-amber-200 bg-amber-50/80 p-4"
    >
      <h2 id="priority-actions-heading" className="text-base font-semibold text-amber-950">
        What to do next
      </h2>
      <p id="priority-actions-desc" className="mt-1 text-sm text-amber-900/80">
        Overdue payments and deliverables — open the deal to follow up or update status.
      </p>
      <PriorityActionList actions={actions} className="mt-4 flex flex-col gap-2" />
      {showViewAll ? (
        <p className="mt-3 text-sm">
          <Link
            href="/attention"
            className="font-medium text-brand-600 hover:text-brand-700 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            View all {totalCount} items
          </Link>
        </p>
      ) : null}
    </section>
  )
}
