'use client'

import { useReducedMotion } from 'motion/react'

/**
 * Entrance animations that start from `opacity: 0` / off-screen transforms are **disabled** here on purpose.
 *
 * `useReducedMotion()` can be `null` during SSR while the first client render may synchronously resolve
 * to `false`, so `initial={{ opacity: 0 }}` no longer matches the server-rendered markup and Next.js
 * surfaces a hydration error overlay. Hover / tap motion still uses `usePrefersReducedMotion()` where
 * applied.
 *
 * Re-enable entrance only with a pattern that keeps server HTML and the first client render identical
 * (e.g. mount-gated `initial` or `useSyncExternalStore` with a stable `getServerSnapshot`).
 */
export function useAllowEntranceMotion(): boolean {
  return false
}

/** Confirmed reduced-motion preference (ignore unknown `null`). */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() === true
}
