'use client'

import { Toaster } from 'sonner'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

export function AppToaster() {
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      className="font-sans"
      toastOptions={{
        duration: prefersReducedMotion ? 8000 : 4000,
        classNames: {
          toast: 'rounded-xl border border-line/90 shadow-md motion-reduce:transition-none',
        },
      }}
    />
  )
}
