'use client'

import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

interface SummaryCardProps {
  label: string
  value: string
  accent?: 'default' | 'green' | 'red' | 'yellow' | undefined
  subtext?: string | undefined
  motionIndex?: number
}

const ACCENT_STYLES = {
  default: 'bg-surface-raised border-line/90 shadow-card',
  green: 'bg-surface-raised border-emerald-700/40 shadow-card',
  red: 'bg-surface-raised border-brand-700/50 shadow-card',
  yellow: 'bg-surface-raised border-amber-700/40 shadow-card',
}

const VALUE_STYLES = {
  default: 'text-stone-900',
  green: 'text-emerald-400',
  red: 'text-brand-400',
  yellow: 'text-amber-300',
}

const LABEL_ACCENT_STYLES = {
  default: 'text-stone-500',
  green: 'text-emerald-600',
  red: 'text-brand-600',
  yellow: 'text-amber-500',
}

export function SummaryCard({
  label,
  value,
  accent = 'default',
  subtext,
  motionIndex = 0,
}: SummaryCardProps) {
  const prefersReduced = usePrefersReducedMotion()

  return (
    <motion.div
      className={`rounded-2xl border p-4 sm:p-5 ${ACCENT_STYLES[accent]}`}
      initial={prefersReduced ? false : { opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : {
              type: 'spring',
              stiffness: 360,
              damping: 28,
              delay: motionIndex * 0.07,
            }
      }
      {...(!prefersReduced
        ? {
            whileHover: {
              y: -4,
              transition: { type: 'spring', stiffness: 400, damping: 22 },
            },
          }
        : {})}
    >
      <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${LABEL_ACCENT_STYLES[accent]}`}>
        {label}
      </p>
      <p
        className={`mt-2 text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${VALUE_STYLES[accent]} ${accent === 'red' ? 'text-glow-red' : ''}`}
      >
        {value}
      </p>
      {subtext && <p className="mt-1.5 text-xs text-stone-500 leading-snug">{subtext}</p>}
    </motion.div>
  )
}
