import Link from 'next/link'
import type { DashboardPriorityAction } from '@oompa/types'
import { formatCurrency, relativeTime } from '@oompa/utils'

type Props = {
  actions: DashboardPriorityAction[]
  /** Optional class on the root list */
  className?: string
}

export function PriorityActionList({ actions, className }: Props) {
  return (
    <ul role="list" className={className ?? 'flex flex-col gap-2'}>
      {actions.map((action) => (
        <li key={actionKey(action)}>
          <Link
            href={`/deals/${action.dealId}`}
            className="flex flex-col gap-0.5 rounded-xl border border-amber-200/70 bg-surface-raised px-3 py-3 text-left shadow-sm transition duration-200 motion-reduce:transition-none hover:border-amber-300 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            {action.kind === 'overdue_payment' ? (
              <>
                <span className="text-sm font-semibold text-stone-900">
                  Chase payment · {action.dealTitle}
                </span>
                <span className="text-sm text-stone-600">
                  {formatCurrency(action.amount, action.currency)}
                  {action.dueDate !== null ? (
                    <span className="text-stone-500"> · due {relativeTime(action.dueDate)}</span>
                  ) : null}
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold text-stone-900">
                  Ship deliverable · {action.dealTitle}
                </span>
                <span className="text-sm text-stone-600">
                  {action.deliverableTitle}
                  {action.dueDate !== null ? (
                    <span className="text-stone-500"> · due {relativeTime(action.dueDate)}</span>
                  ) : null}
                </span>
              </>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function actionKey(a: DashboardPriorityAction): string {
  return a.kind === 'overdue_payment' ? `p:${a.paymentId}` : `d:${a.deliverableId}`
}
