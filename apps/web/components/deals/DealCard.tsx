'use client'

import type { Route } from 'next'
import Link from 'next/link'
import type { Deal } from '@oompa/types'
import { formatCurrency, formatDate } from '@oompa/utils'
import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'
import { StatusBadge } from '@/components/ui/Badge'

const MotionLink = motion.create(Link)

interface DealCardProps {
  deal: Deal
  /** Stagger index for list entrance (dashboard / deals list). */
  motionIndex?: number
}

export function DealCard({ deal, motionIndex: _motionIndex = 0 }: DealCardProps) {
  const prefersReduced = usePrefersReducedMotion()

  return (
    <MotionLink
      href={`/deals/${deal.id}` as Route}
      className="block rounded-2xl border border-line/90 bg-surface-raised p-4 sm:p-5 shadow-card transition-all duration-200 motion-reduce:transition-none hover:border-brand-400/70 hover:shadow-card-hover group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...(!prefersReduced
        ? {
            whileHover: { y: -4, transition: { type: 'spring' as const, stiffness: 380, damping: 24 } },
            whileTap: { scale: 0.99 },
          }
        : {})}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold text-stone-500 uppercase tracking-[0.12em] truncate">
            {deal.brandName}
          </p>
          <h3 className="mt-1 font-display text-base sm:text-lg font-semibold text-stone-900 group-hover:text-brand-800 transition-colors truncate leading-snug">
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
    </MotionLink>
  )
}
