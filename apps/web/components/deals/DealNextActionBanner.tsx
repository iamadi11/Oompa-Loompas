'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
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

export function DealNextActionBanner({ dealId, dealStatus, payments, deliverables }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  const action = computeDealNextAction(dealStatus, payments, deliverables)

  useGSAP(
    () => {
      if (!action || prefersReduced || !bannerRef.current) return

      gsap.from(bannerRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.4,
        ease: 'power2.out',
      })
    },
    { dependencies: [!!action, prefersReduced], scope: bannerRef },
  )

  const { contextSafe } = useGSAP({ scope: buttonRef })

  const onMouseEnter = contextSafe(() => {
    if (prefersReduced) return
    gsap.to(buttonRef.current, { scale: 1.03, duration: 0.3, ease: 'power2.out' })
  })

  const onMouseLeave = contextSafe(() => {
    if (prefersReduced) return
    gsap.to(buttonRef.current, { scale: 1, duration: 0.3, ease: 'power2.inOut' })
  })

  const onMouseDown = contextSafe(() => {
    if (prefersReduced) return
    gsap.to(buttonRef.current, { scale: 0.97, duration: 0.1 })
  })

  const onMouseUp = contextSafe(() => {
    if (prefersReduced) return
    gsap.to(buttonRef.current, { scale: 1.03, duration: 0.1 })
  })

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
    <div
      ref={bannerRef}
      role="status"
      aria-live="polite"
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border px-5 py-4 ${
        isHighValue
          ? 'border-emerald-200/90 bg-emerald-50/70'
          : 'border-brand-200/80 bg-brand-50/60'
      }`}
      style={{ opacity: prefersReduced ? 1 : 0 }}
    >
      <div>
        <p
          className={`text-sm font-semibold ${isHighValue ? 'text-emerald-900' : 'text-brand-900'}`}
        >
          {action.description}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => void handleAdvance()}
          disabled={loading}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isHighValue
              ? 'bg-emerald-800 text-white hover:bg-emerald-700 focus-visible:outline-emerald-700'
              : 'bg-stone-900 text-white hover:bg-stone-700 focus-visible:outline-stone-900'
          }`}
        >
          {loading ? 'Saving…' : action.label}
        </button>
      </div>

      {error && <p className="text-xs text-red-600 sm:col-span-full">{error}</p>}
    </div>
  )
}
