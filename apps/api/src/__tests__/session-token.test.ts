import { describe, it, expect } from 'vitest'
import { hashSessionToken } from '../lib/session-token.js'

describe('hashSessionToken', () => {
  it('is deterministic for the same secret and token', () => {
    const a = hashSessionToken('token-a', 'secret-one')
    const b = hashSessionToken('token-a', 'secret-one')
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })

  it('changes when secret changes', () => {
    const a = hashSessionToken('token-a', 'secret-one')
    const b = hashSessionToken('token-a', 'secret-two')
    expect(a).not.toBe(b)
  })
})
