import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatDate, daysBetween, isOverdue, relativeTime, toISOString } from '../date.js'

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2026-04-04T00:00:00.000Z')
    expect(result).toMatch(/Apr|April/)
    expect(result).toMatch(/2026/)
  })

  it('formats a Date object', () => {
    const result = formatDate(new Date('2026-01-15T00:00:00.000Z'))
    expect(result).toMatch(/Jan|January/)
    expect(result).toMatch(/2026/)
  })

  it('returns "Invalid date" for an invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date')
  })

  it('accepts custom format options', () => {
    const result = formatDate('2026-04-04T00:00:00.000Z', { month: 'long', year: 'numeric' })
    expect(result).toMatch(/April/)
    expect(result).toMatch(/2026/)
  })
})

describe('daysBetween', () => {
  it('returns positive days when end is after start', () => {
    expect(daysBetween('2026-01-01T00:00:00.000Z', '2026-01-11T00:00:00.000Z')).toBe(10)
  })

  it('returns negative days when end is before start', () => {
    expect(daysBetween('2026-01-11T00:00:00.000Z', '2026-01-01T00:00:00.000Z')).toBe(-10)
  })

  it('returns 0 for same date', () => {
    expect(daysBetween('2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')).toBe(0)
  })

  it('works with Date objects', () => {
    const start = new Date('2026-03-01T00:00:00.000Z')
    const end = new Date('2026-04-01T00:00:00.000Z')
    expect(daysBetween(start, end)).toBe(31)
  })
})

describe('isOverdue', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for a past date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-04T12:00:00.000Z'))
    expect(isOverdue('2026-04-01T00:00:00.000Z')).toBe(true)
  })

  it('returns false for a future date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-04T12:00:00.000Z'))
    expect(isOverdue('2026-04-10T00:00:00.000Z')).toBe(false)
  })
})

describe('relativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns relative time for past dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-10T00:00:00.000Z'))
    const result = relativeTime('2026-04-07T00:00:00.000Z')
    expect(result).toMatch(/3 days ago|days/)
  })

  it('returns relative time for future dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-04T00:00:00.000Z'))
    const result = relativeTime('2026-04-09T00:00:00.000Z')
    expect(result).toMatch(/5 days|days/)
  })

  it('returns month-level relative time for 45-day difference', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-04T00:00:00.000Z'))
    const result = relativeTime('2026-02-18T00:00:00.000Z')
    expect(result).toMatch(/month/)
  })

  it('returns year-level relative time for 400-day difference', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-04T00:00:00.000Z'))
    const result = relativeTime('2025-02-28T00:00:00.000Z')
    expect(result).toMatch(/year/)
  })

  it('returns minute-level relative time for <30 min difference', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-04T12:00:00.000Z'))
    const result = relativeTime('2026-04-04T12:15:00.000Z')
    expect(result).toMatch(/minute|15/)
  })

  it('returns hour-level relative time for <1 day but >1 hour difference', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-04T00:00:00.000Z'))
    const result = relativeTime('2026-04-04T06:00:00.000Z')
    expect(result).toMatch(/hour|6/)
  })
})

describe('toISOString', () => {
  it('converts a date string to ISO format', () => {
    const result = toISOString('2026-04-04')
    expect(result).toMatch(/2026-04-04/)
  })

  it('converts a Date object', () => {
    const result = toISOString(new Date('2026-04-04T00:00:00.000Z'))
    expect(result).toBe('2026-04-04T00:00:00.000Z')
  })

  it('returns null for null input', () => {
    expect(toISOString(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(toISOString(undefined)).toBeNull()
  })

  it('returns null for invalid date string', () => {
    expect(toISOString('not-a-date')).toBeNull()
  })
})
