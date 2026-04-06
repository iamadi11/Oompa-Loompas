import { afterEach, describe, expect, it, vi } from 'vitest'

describe('AUTH_SESSION_COOKIE_NAME', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('defaults to oompa_session when env is unset', async () => {
    vi.unstubAllEnvs()
    const { AUTH_SESSION_COOKIE_NAME } = await import('../auth-cookie-name')
    expect(AUTH_SESSION_COOKIE_NAME).toBe('oompa_session')
  })

  it('uses NEXT_PUBLIC_SESSION_COOKIE_NAME when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SESSION_COOKIE_NAME', 'custom_session')
    const { AUTH_SESSION_COOKIE_NAME } = await import('../auth-cookie-name')
    expect(AUTH_SESSION_COOKIE_NAME).toBe('custom_session')
  })
})
