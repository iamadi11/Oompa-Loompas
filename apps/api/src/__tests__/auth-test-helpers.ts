import type { Mock } from 'vitest'
import type { Role } from '@oompa/types'
import { getSessionCookieName } from '../lib/auth-env.js'
import { hashSessionToken } from '../lib/session-token.js'

export const TEST_USER_ID = 'user-test-1'

/** Fixed raw token (64 hex chars) aligned with `hashSessionToken` in mocks. */
export const TEST_SESSION_RAW_TOKEN =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

export function testAuthCookieHeader(): { cookie: string } {
  const name = getSessionCookieName()
  return { cookie: `${name}=${TEST_SESSION_RAW_TOKEN}` }
}

export function expectedSessionTokenHash(): string {
  const secret = process.env['SESSION_SECRET'] ?? ''
  return hashSessionToken(TEST_SESSION_RAW_TOKEN, secret)
}

export function mockSessionFindUnique(
  findUnique: Mock,
  options: {
    userId: string
    email?: string
    roles?: Role[]
    expired?: boolean
  },
): void {
  const { userId, email = 'creator@test.dev', roles = ['MEMBER'], expired = false } = options
  const hash = expectedSessionTokenHash()
  findUnique.mockImplementation(
    async (args: { where: { tokenHash: string }; include?: unknown }) => {
      if (args.where.tokenHash !== hash) {
        return null
      }
      return {
        user: { id: userId, email, roles },
        expiresAt: expired ? new Date(0) : new Date(Date.now() + 86_400_000),
      }
    },
  )
}
