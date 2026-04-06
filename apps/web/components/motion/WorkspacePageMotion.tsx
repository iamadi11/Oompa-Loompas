'use client'

import { motion } from 'motion/react'
import { useAllowEntranceMotion } from '../../lib/motion/use-prefers-motion'

export function WorkspacePageMotion({ children }: { children: React.ReactNode }) {
  const allowEntrance = useAllowEntranceMotion()
  return (
    <motion.div
      initial={allowEntrance ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
