'use client'

import { useSyncExternalStore, useRef, useState, useEffect, startTransition } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

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

export function OfflineBanner() {
  const isOnline = useSyncExternalStore(subscribeToOnline, getOnlineSnapshot, getServerSnapshot)
  const offline = !isOnline
  const [mounted, setMounted] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (offline) {
      startTransition(() => setMounted(true))
    } else if (bannerRef.current) {
      // Animate out
      gsap.to(bannerRef.current, {
        opacity: 0,
        height: 0,
        duration: 0.15,
        onComplete: () => setMounted(false),
      })
    } else {
      startTransition(() => setMounted(false))
    }
  }, [offline])

  useGSAP(
    () => {
      if (!mounted || !bannerRef.current) return
      
      gsap.from(bannerRef.current, {
        opacity: 0,
        height: 0,
        duration: 0.15,
        ease: 'power2.out',
      })
    },
    { dependencies: [mounted], scope: bannerRef }
  )

  if (!mounted) return null

  return (
    <div
      ref={bannerRef}
      role="status"
      aria-live="polite"
      aria-label="You are offline"
      className="w-full bg-stone-200/10 border-b border-line px-4 py-2.5 flex items-center gap-2 overflow-hidden"
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
    </div>
  )
}
