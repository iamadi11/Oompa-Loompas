'use client'

import { motion } from 'motion/react'

export function WorkspacePageMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
