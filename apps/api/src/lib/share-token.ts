import { randomBytes } from 'node:crypto'

/**
 * Generates a cryptographically random 64-character lowercase hex token.
 * Used as a deal proposal share token — URL-safe and hard to guess.
 *
 * Inputs:  none
 * Outputs: 64-char hex string
 * Edge cases: none (crypto.randomBytes is blocking and never fails in Node)
 * Failure modes: N/A — uses Node built-in crypto
 */
export function generateShareToken(): string {
  return randomBytes(32).toString('hex')
}
