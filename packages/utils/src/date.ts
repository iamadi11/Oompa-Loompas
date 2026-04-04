/**
 * Date utilities — deterministic, locale-aware, no external dependencies.
 * All functions operate on ISO 8601 strings or Date objects.
 */

/**
 * Formats an ISO date string for display.
 * Edge case: invalid dates return 'Invalid date' — callers must validate inputs.
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
  locale = 'en-IN',
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Invalid date'
  return new Intl.DateTimeFormat(locale, options).format(d)
}

/**
 * Returns the number of days between two dates.
 * Positive = end is after start. Negative = end is before start.
 */
export function daysBetween(start: string | Date, end: string | Date): number {
  const s = typeof start === 'string' ? new Date(start) : start
  const e = typeof end === 'string' ? new Date(end) : end
  const ms = e.getTime() - s.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

/**
 * Returns true if the given date is in the past.
 * Edge case: exactly now returns false (not overdue yet).
 */
export function isOverdue(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getTime() < Date.now()
}

/**
 * Returns a human-readable relative time string (e.g. "3 days ago", "in 5 days").
 * Uses Intl.RelativeTimeFormat — deterministic output.
 */
export function relativeTime(date: string | Date, locale = 'en-IN'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = d.getTime() - Date.now()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(days) < 1) {
    const hours = Math.round(diff / (1000 * 60 * 60))
    if (Math.abs(hours) < 1) {
      const minutes = Math.round(diff / (1000 * 60))
      return rtf.format(minutes, 'minute')
    }
    return rtf.format(hours, 'hour')
  }
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), 'month')
  return rtf.format(Math.round(days / 365), 'year')
}

/**
 * Converts a date to an ISO string suitable for storage.
 * Edge case: returns null for null/undefined input.
 */
export function toISOString(date: string | Date | null | undefined): string | null {
  if (date == null) return null
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}
