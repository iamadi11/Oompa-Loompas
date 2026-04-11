'use client'

import { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { DashboardPriorityAction } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { RelativeDueLabel } from '@/components/datetime/RelativeDueLabel'
import { SharePaymentReminderButton } from '@/components/payments/CopyPaymentReminderButton'
import { ShareDeliverableReminderButton } from '@/components/deliverables/ShareDeliverableReminderButton'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

type Props = {
  actions: DashboardPriorityAction[]
  className?: string
}

export function PriorityActionList({ actions, className }: Props) {
  const prefersReduced = usePrefersReducedMotion()
  const listRef = useRef<HTMLUListElement>(null)

  useGSAP(
    () => {
      if (prefersReduced || !listRef.current) return

      const items = listRef.current.querySelectorAll('li')
      gsap.fromTo(
        items,
        { opacity: 0, y: 16, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.06,
          duration: 0.5,
          ease: 'power2.out',
          clearProps: 'all',
        }
      )
    },
    { dependencies: [actions, prefersReduced], scope: listRef }
  )

  return (
    <ul ref={listRef} role="list" className={className ?? 'flex flex-col gap-2'}>
      {actions.map((action) => (
        <li
          key={actionKey(action)}
          style={{ opacity: prefersReduced ? 1 : 0 }} // Pre-mount invisible to avoid flash
        >
          {action.kind === 'overdue_payment' ? (
            <div className="flex flex-col gap-2 rounded-xl border border-amber-700/40 bg-surface-raised p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <Link
                href={`/deals/${action.dealId}`}
                className="flex min-w-0 flex-1 flex-col gap-0.5 text-left transition duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-md"
              >
                <span className="text-sm font-semibold text-stone-900">
                  Chase payment · {action.dealTitle}
                </span>
                <span className="text-sm text-stone-500">
                  {formatCurrency(action.amount, action.currency)}
                  {action.dueDate !== null ? <RelativeDueLabel iso={action.dueDate} /> : null}
                </span>
              </Link>
              <div className="shrink-0 border-t border-amber-700/30 pt-2 sm:border-t-0 sm:pt-0 sm:pl-1">
                <SharePaymentReminderButton
                  dealId={action.dealId}
                  paymentId={action.paymentId}
                  dealTitle={action.dealTitle}
                  brandName={action.brandName}
                  amount={action.amount}
                  currency={action.currency}
                  dueDate={action.dueDate}
                  shareToken={action.shareToken}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 rounded-xl border border-amber-700/40 bg-surface-raised p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <Link
                href={`/deals/${action.dealId}`}
                className="flex min-w-0 flex-1 flex-col gap-0.5 text-left transition duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-md"
              >
                <span className="text-sm font-semibold text-stone-900">
                  Ship deliverable · {action.dealTitle}
                </span>
                <span className="text-sm text-stone-500">
                  {action.deliverableTitle}
                  {action.dueDate !== null ? <RelativeDueLabel iso={action.dueDate} /> : null}
                </span>
              </Link>
              <div className="shrink-0 border-t border-amber-700/30 pt-2 sm:border-t-0 sm:pt-0 sm:pl-1">
                <ShareDeliverableReminderButton
                  dealTitle={action.dealTitle}
                  brandName={action.brandName}
                  deliverableTitle={action.deliverableTitle}
                  dueDate={action.dueDate}
                />
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

function actionKey(a: DashboardPriorityAction): string {
  return a.kind === 'overdue_payment' ? `p:${a.paymentId}` : `d:${a.deliverableId}`
}
