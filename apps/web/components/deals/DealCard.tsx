'use client'

import { useRef, useCallback } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import gsap from 'gsap'
import type { Deal } from '@oompa/types'
import { formatCurrency, formatDate } from '@oompa/utils'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'
import { StatusBadge } from '@/components/ui/Badge'

interface DealCardProps {
  deal: Deal
}

export function DealCard({ deal }: DealCardProps) {
  const prefersReduced = usePrefersReducedMotion()
  const cardRef = useRef<HTMLAnchorElement>(null)

  const onMouseEnter = useCallback(() => {
    if (prefersReduced) return
    gsap.to(cardRef.current, {
      y: -6,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [prefersReduced])

  const onMouseLeave = useCallback(() => {
    if (prefersReduced) return
    gsap.to(cardRef.current, {
      y: 0,
      duration: 0.3,
      ease: 'power2.inOut',
    })
  }, [prefersReduced])

  const onMouseDown = useCallback(() => {
    if (prefersReduced) return
    gsap.to(cardRef.current, {
      scale: 0.97,
      duration: 0.1,
    })
  }, [prefersReduced])

  const onMouseUp = useCallback(() => {
    if (prefersReduced) return
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.1,
    })
  }, [prefersReduced])

  return (
    <Link
      ref={cardRef}
      href={`/deals/${deal.id}` as Route}
      className="block rounded-2xl border border-line/90 bg-surface-raised p-4 sm:p-5 shadow-card transition-shadow duration-200 hover:border-brand-700/60 hover:shadow-card-hover group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold text-stone-500 uppercase tracking-[0.12em] truncate">
            {deal.brandName}
          </p>
          <h3 className="mt-1 font-display text-base sm:text-lg font-semibold text-stone-900 group-hover:text-brand-400 transition-colors truncate leading-snug">
            {deal.title}
          </h3>
        </div>
        <StatusBadge status={deal.status} />
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <span className="text-lg sm:text-xl font-bold tabular-nums text-stone-900">
          {formatCurrency(deal.value, deal.currency)}
        </span>
        {deal.endDate && (
          <span className="text-xs font-medium text-stone-500 tabular-nums">
            Due {formatDate(deal.endDate, { day: 'numeric', month: 'short', timeZone: 'UTC' })}
          </span>
        )}
      </div>
    </Link>
  )
}
