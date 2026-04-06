/**
 * Base URL for server-side `fetch()` to the API (RSC, route handlers).
 * Prefer `API_URL` for server-only config; fall back to `NEXT_PUBLIC_API_URL` so one env var suffices in dev.
 */
export function getServerApiBaseUrl(): string {
  const serverOnly = process.env['API_URL']
  if (serverOnly !== undefined && serverOnly.length > 0) return serverOnly
  const publicUrl = process.env['NEXT_PUBLIC_API_URL']
  if (publicUrl !== undefined && publicUrl.length > 0) return publicUrl
  return 'http://localhost:3001'
}
