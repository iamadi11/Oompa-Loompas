'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
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

export function InstallPrompt() {
  const [mounted, setMounted] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const reduced = usePrefersReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)

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
      timer = setTimeout(() => setMounted(true), SHOW_DELAY_MS)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      if (timer !== null) clearTimeout(timer)
    }
  }, [])

  useGSAP(
    () => {
      if (!mounted || !dialogRef.current) return

      gsap.from(dialogRef.current, {
        opacity: 0,
        y: reduced ? 0 : 12,
        duration: 0.4,
        ease: 'power2.out',
      })
    },
    { dependencies: [mounted, reduced], scope: dialogRef }
  )

  const handleDismiss = useCallback(() => {
    gsap.to(dialogRef.current, {
      opacity: 0,
      y: reduced ? 0 : 12,
      duration: 0.3,
      onComplete: () => setMounted(false),
    })
    try {
      localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, String(Date.now()))
    } catch {
      // Swallow — prompt will show next visit, acceptable.
    }
  }, [reduced])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    try {
      await deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      if (outcome === 'dismissed') {
        handleDismiss()
      } else {
        setMounted(false)
      }
    } catch {
      setMounted(false)
    }
    deferredPrompt.current = null
  }

  if (!mounted) return null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-label="Add Oompa to your home screen"
      aria-live="polite"
      className="fixed bottom-[76px] md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
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
        <div className="flex-1 min-w-0 text-left">
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
    </div>
  )
}
