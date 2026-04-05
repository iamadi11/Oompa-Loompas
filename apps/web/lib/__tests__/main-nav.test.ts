import { describe, expect, it } from 'vitest'
import { isMainNavCurrent } from '../main-nav'

describe('isMainNavCurrent', () => {
  it('marks home only on root path', () => {
    expect(isMainNavCurrent('/', 'home')).toBe(true)
    expect(isMainNavCurrent('', 'home')).toBe(true)
    expect(isMainNavCurrent('/deals', 'home')).toBe(false)
    expect(isMainNavCurrent('/attention', 'home')).toBe(false)
  })

  it('marks attention on /attention', () => {
    expect(isMainNavCurrent('/attention', 'attention')).toBe(true)
    expect(isMainNavCurrent('/deals', 'attention')).toBe(false)
    expect(isMainNavCurrent('/', 'attention')).toBe(false)
  })

  it('marks deals on /deals and nested deal routes', () => {
    expect(isMainNavCurrent('/deals', 'deals')).toBe(true)
    expect(isMainNavCurrent('/deals/new', 'deals')).toBe(true)
    expect(isMainNavCurrent('/deals/abc-123', 'deals')).toBe(true)
    expect(isMainNavCurrent('/attention', 'deals')).toBe(false)
  })

  it('normalizes trailing slash on pathname', () => {
    expect(isMainNavCurrent('/deals/', 'deals')).toBe(true)
    expect(isMainNavCurrent('/attention/', 'attention')).toBe(true)
  })
})
