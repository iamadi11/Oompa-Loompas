import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
  },
}))

describe('push-env', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  describe('getVapidPublicKey', () => {
    it('returns env value when VAPID_PUBLIC_KEY is set', async () => {
      vi.stubEnv('VAPID_PUBLIC_KEY', 'test-vapid-public-key')
      const { getVapidPublicKey } = await import('../lib/push-env.js')
      expect(getVapidPublicKey()).toBe('test-vapid-public-key')
    })

    it('returns fallback in test environment when key not set', async () => {
      vi.stubEnv('NODE_ENV', 'test')
      vi.stubEnv('VAPID_PUBLIC_KEY', '')
      const { getVapidPublicKey } = await import('../lib/push-env.js')
      // In test env should return test fallback instead of throwing
      expect(() => getVapidPublicKey()).not.toThrow()
    })
  })

  describe('initWebPush', () => {
    it('calls setVapidDetails when both keys present', async () => {
      vi.stubEnv('VAPID_PUBLIC_KEY', 'pub-key')
      vi.stubEnv('VAPID_PRIVATE_KEY', 'priv-key')
      vi.stubEnv('VAPID_SUBJECT', 'mailto:admin@example.com')
      const webpush = await import('web-push')
      const { initWebPush } = await import('../lib/push-env.js')
      initWebPush()
      expect(webpush.default.setVapidDetails).toHaveBeenCalledWith(
        'mailto:admin@example.com',
        'pub-key',
        'priv-key',
      )
    })

    it('skips setVapidDetails in test env when keys missing', async () => {
      vi.stubEnv('NODE_ENV', 'test')
      vi.stubEnv('VAPID_PUBLIC_KEY', '')
      vi.stubEnv('VAPID_PRIVATE_KEY', '')
      const webpush = await import('web-push')
      const { initWebPush } = await import('../lib/push-env.js')
      initWebPush()
      expect(webpush.default.setVapidDetails).not.toHaveBeenCalled()
    })
  })
})
