'use client'

import { useRef, useCallback } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import gsap from 'gsap'
import type { DashboardDeal } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'
import { StatusBadge } from '@/components/ui/Badge'

interface RecentDealRowProps {
  deal: DashboardDeal
}

export function RecentDealRow({ deal }: RecentDealRowProps) {
  const { paymentSummary } = deal
  const prefersReduced = usePrefersReducedMotion()
  const rowRef = useRef<HTMLAnchorElement>(null)

  const receivedPct =
    paymentSummary.totalContracted > 0
      ? Math.round((paymentSummary.totalReceived / paymentSummary.totalContracted) * 100)
      : 0

  const onMouseEnter = useCallback(() => {
    if (prefersReduced) return
    gsap.to(rowRef.current, {
      paddingLeft: '1.25rem', // Slight indent equivalent to x: 5
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [prefersReduced])

  const onMouseLeave = useCallback(() => {
    if (prefersReduced) return
    gsap.to(rowRef.current, {
      paddingLeft: '1rem',
      duration: 0.3,
      ease: 'power2.inOut',
    })
  }, [prefersReduced])

  return (
    <Link
      ref={rowRef}
      href={`/deals/${deal.id}` as Route}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 px-4 py-3.5 rounded-xl border border-line/80 bg-surface-raised shadow-sm hover:border-brand-700/50 hover:shadow-card transition-shadow duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-sm text-stone-900 truncate group-hover:text-brand-400 transition-colors">
            {deal.title}
          </span>
          <StatusBadge status={deal.status} />
          {paymentSummary.hasOverdue && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-950/40 text-red-400 border border-red-800/40">
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
        <p className="text-xs text-stone-500 tabular-nums">{receivedPct}% received</p>
      </div>
    </Link>
  )
}
