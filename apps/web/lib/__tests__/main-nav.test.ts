import { describe, expect, it } from 'vitest'
import { isMainNavCurrent } from '@/lib/main-nav'

describe('isMainNavCurrent', () => {
  it('marks overview on /dashboard', () => {
    expect(isMainNavCurrent('/dashboard', 'overview')).toBe(true)
    expect(isMainNavCurrent('/dashboard/stats', 'overview')).toBe(true)
    expect(isMainNavCurrent('/', 'overview')).toBe(false)
    expect(isMainNavCurrent('/deals', 'overview')).toBe(false)
    expect(isMainNavCurrent('/attention', 'overview')).toBe(false)
  })

  it('marks attention on /attention', () => {
    expect(isMainNavCurrent('/attention', 'attention')).toBe(true)
    expect(isMainNavCurrent('/deals', 'attention')).toBe(false)
    expect(isMainNavCurrent('/dashboard', 'attention')).toBe(false)
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
    expect(isMainNavCurrent('/dashboard/', 'overview')).toBe(true)
  })
})
