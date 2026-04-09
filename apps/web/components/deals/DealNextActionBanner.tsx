'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import type { DealStatus, Payment, Deliverable } from '@oompa/types'
import { computeDealNextAction } from '@oompa/types'
import { api } from '@/lib/api'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

interface Props {
  dealId: string
  dealStatus: DealStatus
  payments: Payment[]
  deliverables: Deliverable[]
}

/**
 * DealNextActionBanner — contextual one-click CTA to advance a deal to its next status.
 *
 * Purpose: answer "What should I do next?" on the deal detail page.
 * Inputs:  dealId, dealStatus, payments (serialized from server), deliverables (serialized from server)
 * Outputs: renders a call-to-action banner, or nothing if no advance is applicable.
 *          On confirm: PATCH /api/v1/deals/:id + router.refresh()
 * Edge cases: API 409 (invalid transition guarded server-side) → shows error message
 * Failure modes: network error → shows inline error; loading state prevents double-submit
 */
export function DealNextActionBanner({ dealId, dealStatus, payments, deliverables }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Mount gate: prevents server/client hydration mismatch on entrance animation
  const [mounted, setMounted] = useState(false)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  const action = computeDealNextAction(dealStatus, payments, deliverables)

  if (!action) return null

  async function handleAdvance() {
    if (!action || loading) return
    setLoading(true)
    setError(null)
    try {
      await api.updateDeal(dealId, { status: action.targetStatus })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deal status')
    } finally {
      setLoading(false)
    }
  }

  const isHighValue = action.targetStatus === 'PAID' || action.targetStatus === 'DELIVERED'

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={mounted && !prefersReduced ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border px-5 py-4 ${
        isHighValue
          ? 'border-emerald-200/90 bg-emerald-50/70'
          : 'border-brand-200/80 bg-brand-50/60'
      }`}
    >
      <div>
        <p
          className={`text-sm font-semibold ${
            isHighValue ? 'text-emerald-900' : 'text-brand-900'
          }`}
        >
          {action.description}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <motion.button
          type="button"
          onClick={() => void handleAdvance()}
          disabled={loading}
          {...(!prefersReduced
            ? {
                whileHover: { scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 20 } },
                whileTap: { scale: 0.97 },
              }
            : {})}
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isHighValue
              ? 'bg-emerald-800 text-white hover:bg-emerald-700 focus-visible:outline-emerald-700'
              : 'bg-stone-900 text-white hover:bg-stone-700 focus-visible:outline-stone-900'
          }`}
        >
          {loading ? 'Saving…' : action.label}
        </motion.button>
      </div>

      {error && (
        <p className="text-xs text-red-600 sm:col-span-full">{error}</p>
      )}
    </motion.div>
  )
}
