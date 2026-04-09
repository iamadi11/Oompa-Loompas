'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import type { DashboardPriorityAction } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { RelativeDueLabel } from '@/components/datetime/RelativeDueLabel'
import { CopyPaymentReminderButton } from '@/components/payments/CopyPaymentReminderButton'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

const MotionLi = motion.li

type Props = {
  actions: DashboardPriorityAction[]
  /** Optional class on the root list */
  className?: string
}

export function PriorityActionList({ actions, className }: Props) {
  const prefersReduced = usePrefersReducedMotion()

  return (
    <ul role="list" className={className ?? 'flex flex-col gap-2'}>
      {actions.map((action, i) => (
        <MotionLi
          key={actionKey(action)}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: prefersReduced ? 0 : i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {action.kind === 'overdue_payment' ? (
            <div className="flex flex-col gap-2 rounded-xl border border-amber-200/70 bg-surface-raised p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <Link
                href={`/deals/${action.dealId}`}
                className="flex min-w-0 flex-1 flex-col gap-0.5 text-left transition duration-200 motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-md"
              >
                <span className="text-sm font-semibold text-stone-900">
                  Chase payment · {action.dealTitle}
                </span>
                <span className="text-sm text-stone-600">
                  {formatCurrency(action.amount, action.currency)}
                  {action.dueDate !== null ? <RelativeDueLabel iso={action.dueDate} /> : null}
                </span>
              </Link>
              <div className="shrink-0 border-t border-amber-200/60 pt-2 sm:border-t-0 sm:pt-0 sm:pl-1">
                <CopyPaymentReminderButton
                  dealId={action.dealId}
                  paymentId={action.paymentId}
                  dealTitle={action.dealTitle}
                  brandName={action.brandName}
                  amount={action.amount}
                  currency={action.currency}
                  dueDate={action.dueDate}
                />
              </div>
            </div>
          ) : (
            <Link
              href={`/deals/${action.dealId}`}
              className="flex flex-col gap-0.5 rounded-xl border border-amber-200/70 bg-surface-raised px-3 py-3 text-left shadow-sm transition duration-200 motion-reduce:transition-none hover:border-amber-300 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span className="text-sm font-semibold text-stone-900">
                Ship deliverable · {action.dealTitle}
              </span>
              <span className="text-sm text-stone-600">
                {action.deliverableTitle}
                {action.dueDate !== null ? <RelativeDueLabel iso={action.dueDate} /> : null}
              </span>
            </Link>
          )}
        </MotionLi>
      ))}
    </ul>
  )
}

function actionKey(a: DashboardPriorityAction): string {
  return a.kind === 'overdue_payment' ? `p:${a.paymentId}` : `d:${a.deliverableId}`
}
