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

/**
 * Full document navigation after login so the HTTP-only session cookie is always sent on the next
 * request. Client `router.push` + `router.refresh` can race RSC fetches or refresh the wrong route.
 */
export function navigateAfterLogin(redirectFrom: string | null | undefined): void {
  const path = postLoginDestination(redirectFrom)
  window.location.assign(path)
}
