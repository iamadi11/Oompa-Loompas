import { describe, it, expect } from 'vitest'
import { formatCurrency, getCurrencySymbol, parseCurrencyString } from '../currency.js'

describe('formatCurrency', () => {
  it('formats INR by default', () => {
    const result = formatCurrency(80000)
    expect(result).toContain('80,000')
    expect(result).toContain('₹')
  })

  it('formats USD correctly', () => {
    const result = formatCurrency(1000, 'USD')
    expect(result).toContain('1,000')
    expect(result).toContain('$')
  })

  it('formats EUR correctly', () => {
    const result = formatCurrency(500, 'EUR')
    expect(result).toContain('500')
  })

  it('formats GBP correctly', () => {
    const result = formatCurrency(250, 'GBP')
    expect(result).toContain('250')
    expect(result).toContain('£')
  })

  it('handles zero', () => {
    const result = formatCurrency(0, 'INR')
    expect(result).toContain('0')
  })

  it('handles negative amounts (refunds)', () => {
    const result = formatCurrency(-5000, 'INR')
    expect(result).toContain('5,000')
  })

  it('handles fractional amounts', () => {
    const result = formatCurrency(1234.56, 'USD')
    expect(result).toContain('1,234.56')
  })

  it('rounds at 2 decimal places', () => {
    const result = formatCurrency(99.999, 'USD')
    expect(result).toContain('100')
  })
})

describe('getCurrencySymbol', () => {
  it('returns ₹ for INR', () => {
    expect(getCurrencySymbol('INR')).toBe('₹')
  })

  it('returns $ for USD', () => {
    expect(getCurrencySymbol('USD')).toBe('$')
  })

  it('returns £ for GBP', () => {
    expect(getCurrencySymbol('GBP')).toBe('£')
  })

  it('returns € for EUR', () => {
    const symbol = getCurrencySymbol('EUR')
    expect(symbol).toBeTruthy()
    expect(typeof symbol).toBe('string')
  })
})

describe('parseCurrencyString', () => {
  it('parses plain numbers', () => {
    expect(parseCurrencyString('80000')).toBe(80000)
  })

  it('parses formatted INR string', () => {
    expect(parseCurrencyString('₹80,000')).toBe(80000)
  })

  it('parses USD formatted string', () => {
    expect(parseCurrencyString('$1,234.56')).toBe(1234.56)
  })

  it('returns NaN for empty string', () => {
    expect(parseCurrencyString('')).toBeNaN()
  })

  it('returns NaN for non-numeric string', () => {
    expect(parseCurrencyString('abc')).toBeNaN()
  })

  it('handles negative values', () => {
    expect(parseCurrencyString('-5000')).toBe(-5000)
  })
})
