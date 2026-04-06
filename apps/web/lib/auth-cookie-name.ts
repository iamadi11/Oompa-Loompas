/** Must match API `SESSION_COOKIE_NAME` default (`oompa_session`). */
export const AUTH_SESSION_COOKIE_NAME =
  process.env['NEXT_PUBLIC_SESSION_COOKIE_NAME'] ?? 'oompa_session'
