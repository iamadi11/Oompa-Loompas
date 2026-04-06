const DEFAULT_COOKIE_NAME = 'oompa_session'
const DEFAULT_SESSION_TTL_DAYS = 14

export function getSessionCookieName(): string {
  return process.env['SESSION_COOKIE_NAME']?.trim() || DEFAULT_COOKIE_NAME
}

export function getSessionSecret(): string {
  const s = process.env['SESSION_SECRET']?.trim()
  if (!s) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('SESSION_SECRET is required in production')
    }
    return 'dev-only-session-secret-min-32-chars!!'
  }
  if (s.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters')
  }
  return s
}

export function getSessionTtlMs(): number {
  const raw = process.env['SESSION_TTL_DAYS']
  const days = raw === undefined || raw === '' ? DEFAULT_SESSION_TTL_DAYS : Number(raw)
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    throw new Error('SESSION_TTL_DAYS must be a number between 1 and 365')
  }
  return days * 86_400_000
}
