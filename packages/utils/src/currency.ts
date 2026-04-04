import type { Currency } from '@oompa/types'

const CURRENCY_LOCALES: Record<Currency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
}

/**
 * Formats a numeric amount as a locale-aware currency string.
 * Uses Intl.NumberFormat — deterministic given the same locale + options.
 *
 * Edge cases:
 * - Zero: returns "₹0" (or currency equivalent) — valid display
 * - Negative: returns negative formatted string (e.g. for refunds)
 * - Very large: uses standard grouping separators
 */
export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  const locale = CURRENCY_LOCALES[currency]
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Returns the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currency: Currency): string {
  return new Intl.NumberFormat('en', { style: 'currency', currency, minimumFractionDigits: 0 })
    .formatToParts(0)
    .find((p) => p.type === 'currency')?.value ?? currency
}

/**
 * Parses a currency string back to a number.
 * Strips known currency symbols and formatting characters.
 * Failure mode: returns NaN if unparseable — callers must handle.
 */
export function parseCurrencyString(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, '')
  return parseFloat(cleaned)
}
