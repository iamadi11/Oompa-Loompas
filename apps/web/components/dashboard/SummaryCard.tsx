'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

interface SummaryCardProps {
  label: string
  value: string
  accent?: 'default' | 'green' | 'red' | 'yellow' | undefined
  subtext?: string | undefined
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

export function SummaryCard({ label, value, accent = 'default', subtext }: SummaryCardProps) {
  const prefersReduced = usePrefersReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)

  const onMouseEnter = useCallback(() => {
    if (prefersReduced) return
    gsap.to(cardRef.current, {
      y: -4,
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

  return (
    <div
      ref={cardRef}
      className={`rounded-2xl border p-4 sm:p-5 summary-card ${ACCENT_STYLES[accent]}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ opacity: prefersReduced ? 1 : 0 }}
    >
      <p
        className={`text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${LABEL_ACCENT_STYLES[accent]}`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${VALUE_STYLES[accent]} ${accent === 'red' ? 'text-glow-red' : ''}`}
      >
        {value}
      </p>
      {subtext && <p className="mt-1.5 text-xs text-stone-500 leading-snug">{subtext}</p>}
    </div>
  )
}
