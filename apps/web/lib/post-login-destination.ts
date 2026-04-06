import type { Route } from 'next'

/**
 * Safe in-app path after auth: only same-origin relative paths; otherwise dashboard.
 */
export function postLoginDestination(redirectFrom: string | null | undefined): Route {
  const from = redirectFrom?.trim() || null
  if (from && from.startsWith('/') && !from.startsWith('//')) {
    return from as Route
  }
  return '/dashboard'
}
