'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { DashboardDeal } from '@oompa/types'
import { RecentDealRow } from './RecentDealRow'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

export function RecentDealsList({ deals }: { deals: DashboardDeal[] }) {
  const container = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (prefersReduced || !container.current) return

      const rows = container.current.querySelectorAll('.recent-deal-row')
      gsap.fromTo(
        rows,
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.06,
          duration: 0.5,
          ease: 'power2.out',
          clearProps: 'all',
        },
      )
    },
    { dependencies: [deals, prefersReduced], scope: container },
  )

  return (
    <div ref={container} className="flex flex-col gap-2">
      {deals.map((deal) => (
        <div key={deal.id} className="recent-deal-row" style={{ opacity: prefersReduced ? 1 : 0 }}>
          <RecentDealRow deal={deal} />
        </div>
      ))}
    </div>
  )
}
