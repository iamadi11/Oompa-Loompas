'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

export function SummaryGrid({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (prefersReduced || !container.current) return

      const cards = container.current.querySelectorAll('.summary-card')
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.07,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'all',
        }
      )
    },
    { dependencies: [prefersReduced], scope: container }
  )

  return (
    <div ref={container} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {children}
    </div>
  )
}
