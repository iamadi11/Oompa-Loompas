import { describe, expect, it } from 'vitest'
import { postLoginDestination } from '@/lib/post-login-destination'

describe('postLoginDestination', () => {
  it('returns dashboard when from is empty', () => {
    expect(postLoginDestination(null)).toBe('/dashboard')
    expect(postLoginDestination(undefined)).toBe('/dashboard')
    expect(postLoginDestination('')).toBe('/dashboard')
    expect(postLoginDestination('   ')).toBe('/dashboard')
  })

  it('returns safe same-origin paths only', () => {
    expect(postLoginDestination('/deals')).toBe('/deals')
    expect(postLoginDestination(' /attention ')).toBe('/attention')
  })

  it('rejects protocol-relative and non-path values', () => {
    expect(postLoginDestination('//evil.com')).toBe('/dashboard')
    expect(postLoginDestination('https://evil.com')).toBe('/dashboard')
  })
})
