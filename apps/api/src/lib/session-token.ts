import { createHmac, randomBytes } from 'node:crypto'

/** Exported for tests to align cookie values with mocked `session.findUnique` queries. */
export function hashSessionToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex')
}

export function newSessionToken(): string {
  return randomBytes(32).toString('hex')
}
