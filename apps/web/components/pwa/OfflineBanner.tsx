'use client'

import { useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

function subscribeToOnline(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine
}

function getServerSnapshot(): boolean {
  // Always report online during SSR — avoids mismatched hydration.
  return true
}

/**
 * Persistent offline banner shown in the workspace when `navigator.onLine` is false.
 * Disappears immediately on reconnect.
 * Uses `useSyncExternalStore` for correct SSR/CSR hydration and no cascading renders.
 */
export function OfflineBanner() {
  const isOnline = useSyncExternalStore(subscribeToOnline, getOnlineSnapshot, getServerSnapshot)
  const offline = !isOnline
  const reduced = usePrefersReducedMotion()

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label="You are offline"
          className="w-full bg-stone-200/10 border-b border-line px-4 py-2.5 flex items-center gap-2"
          initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#71717A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
          <p className="text-xs text-stone-500 leading-tight">
            No connection — deal and payment data requires a live connection
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
