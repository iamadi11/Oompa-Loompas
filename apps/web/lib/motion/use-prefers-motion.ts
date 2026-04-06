'use client'

import { useReducedMotion } from 'motion/react'

/**
 * `useReducedMotion()` returns `null` until the client evaluates `prefers-reduced-motion`.
 * Using `null` like "reduced" in `initial={{ opacity: 0 }}` leaves content invisible if the first
 * paint never completes the animation — common on `/` after SSR/hydration.
 *
 * Only treat **confirmed** `false` as "full motion allowed" for entrance opacity/transform.
 */
export function useAllowEntranceMotion(): boolean {
  return useReducedMotion() === false
}

/** Confirmed reduced-motion preference (ignore unknown `null`). */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() === true
}
