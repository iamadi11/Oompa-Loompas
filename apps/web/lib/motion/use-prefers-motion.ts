'use client'

import { useState, useEffect } from 'react'

/**
 * Entrance animations are disabled here to prevent hydration mismatches.
 */
export function useAllowEntranceMotion(): boolean {
  return false
}

/** 
 * Returns true if the user prefers reduced motion.
 * Uses native media query and handles client-side updates.
 */
const MQ = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(MQ).matches
  })

  useEffect(() => {
    const query = window.matchMedia(MQ)
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return reduced
}
