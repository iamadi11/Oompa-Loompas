'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  isInstallPromptSuppressed,
  INSTALL_PROMPT_STORAGE_KEY,
} from '@/lib/pwa/install-prompt'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

/** Subset of the non-standard BeforeInstallPromptEvent we rely on. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Delay after workspace mount before showing the prompt (ms). */
const SHOW_DELAY_MS = 30_000

/**
 * PWA install prompt card.
 *
 * Listens for `beforeinstallprompt` (Chrome/Edge/Samsung — iOS is a no-op).
 * Shows a bottom card after SHOW_DELAY_MS of active workspace use.
 * Suppresses itself for INSTALL_PROMPT_DISMISS_TTL_MS after the user dismisses.
 * Production-only: silently disabled in development.
 */
export function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    // Only show in production — service worker isn't active in dev.
    if (process.env.NODE_ENV !== 'production') return

    // Check if user already dismissed within the TTL.
    try {
      const stored = localStorage.getItem(INSTALL_PROMPT_STORAGE_KEY)
      if (isInstallPromptSuppressed(stored, Date.now())) return
    } catch {
      // localStorage unavailable — show anyway.
    }

    let timer: ReturnType<typeof setTimeout> | null = null

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      if (timer !== null) clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, String(Date.now()))
    } catch {
      // Swallow — prompt will show next visit, acceptable.
    }
  }

  const handleInstall = async () => {
    setVisible(false)
    if (!deferredPrompt.current) return
    try {
      await deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      if (outcome === 'dismissed') handleDismiss()
    } catch {
      // Browser may cancel the prompt — treat as no-op.
    }
    deferredPrompt.current = null
  }

  const variants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 12 },
      }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Add Oompa to your home screen"
          aria-live="polite"
          className="fixed bottom-[76px] md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="bg-surface-raised border border-line rounded-2xl shadow-card p-4 flex items-center gap-3">
            {/* App icon */}
            <div
              className="shrink-0 w-10 h-10 rounded-xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E12B2B"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>

            {/* Copy */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-900 leading-tight">
                Add to Home Screen
              </p>
              <p className="text-xs text-stone-500 mt-0.5 leading-tight">
                Check deals and payments in one tap
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss install prompt"
                className="p-1.5 text-stone-500 hover:text-stone-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 rounded-md"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                Install
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
