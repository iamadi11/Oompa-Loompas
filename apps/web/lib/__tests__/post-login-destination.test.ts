/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { navigateAfterLogin, postLoginDestination } from '@/lib/post-login-destination'

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

describe('navigateAfterLogin', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('assigns the safe destination from redirectFrom', () => {
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      assign,
    } as Location)

    navigateAfterLogin('/attention')
    expect(assign).toHaveBeenCalledWith('/attention')
  })

  it('defaults to dashboard when from is unsafe', () => {
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      assign,
    } as Location)

    navigateAfterLogin('//evil.com')
    expect(assign).toHaveBeenCalledWith('/dashboard')
  })
})
