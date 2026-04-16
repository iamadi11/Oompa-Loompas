'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

gsap.registerPlugin(useGSAP)

export function WorkspacePageMotion({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (prefersReduced) return

      gsap.fromTo(
        container.current,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'all',
        },
      )
    },
    { scope: container, dependencies: [prefersReduced] },
  )

  return (
    <div ref={container} style={{ opacity: prefersReduced ? 1 : 0 }}>
      {children}
    </div>
  )
}
