'use client'

import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

export function WorkspacePageMotion({ children }: { children: React.ReactNode }) {
  const prefersReduced = usePrefersReducedMotion()

  if (prefersReduced) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      {children}
    </motion.div>
  )
}
