'use client'

import { motion } from 'motion/react'
import { useAllowEntranceMotion, usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

interface SummaryCardProps {
  label: string
  value: string
  accent?: 'default' | 'green' | 'red' | 'yellow' | undefined
  subtext?: string | undefined
  motionIndex?: number
}

const ACCENT_STYLES = {
  default: 'bg-surface-raised border-line/90 shadow-card',
  green: 'bg-surface-raised border-emerald-200/80 shadow-card',
  red: 'bg-red-50/90 border-red-200/90 shadow-card',
  yellow: 'bg-amber-50/80 border-amber-200/80 shadow-card',
}

const VALUE_STYLES = {
  default: 'text-stone-900',
  green: 'text-emerald-800',
  red: 'text-red-800',
  yellow: 'text-amber-900',
}

export function SummaryCard({
  label,
  value,
  accent = 'default',
  subtext,
  motionIndex = 0,
}: SummaryCardProps) {
  const allowEntrance = useAllowEntranceMotion()
  const prefersReduced = usePrefersReducedMotion()

  return (
    <motion.div
      className={`rounded-2xl border p-4 sm:p-5 ${ACCENT_STYLES[accent]}`}
      initial={allowEntrance ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay: allowEntrance ? motionIndex * 0.08 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...(!prefersReduced ? { whileHover: { y: -2, transition: { duration: 0.2 } } } : {})}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className={`mt-2 text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${VALUE_STYLES[accent]}`}>
        {value}
      </p>
      {subtext && (
        <p className="mt-1.5 text-xs text-stone-500 leading-snug">{subtext}</p>
      )}
    </motion.div>
  )
}
