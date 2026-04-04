import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { validate, formatZodErrors, isNonEmpty, sanitizeString } from '../validation.js'

const TestSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
})

describe('validate', () => {
  it('returns success with parsed data for valid input', () => {
    const result = validate(TestSchema, { name: 'Alice', age: 30 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: 'Alice', age: 30 })
    }
  })

  it('returns failure with errors for invalid input', () => {
    const result = validate(TestSchema, { name: '', age: -1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0)
    }
  })

  it('returns failure for missing required fields', () => {
    const result = validate(TestSchema, {})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.errors.map((e) => e.path)
      expect(paths).toContain('name')
      expect(paths).toContain('age')
    }
  })

  it('returns failure for completely wrong type', () => {
    const result = validate(TestSchema, 'not an object')
    expect(result.success).toBe(false)
  })

  it('includes field path and message in errors', () => {
    const result = validate(TestSchema, { name: '', age: 30 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const nameError = result.errors.find((e) => e.path === 'name')
      expect(nameError).toBeDefined()
      expect(nameError?.message).toBeTruthy()
    }
  })
})

describe('formatZodErrors', () => {
  it('formats a ZodError into a flat map', () => {
    const result = TestSchema.safeParse({ name: '', age: -1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const formatted = formatZodErrors(result.error)
      expect(typeof formatted).toBe('object')
      expect(formatted['name']).toBeTruthy()
    }
  })
})

describe('isNonEmpty', () => {
  it('returns true for non-empty string', () => {
    expect(isNonEmpty('hello')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isNonEmpty('')).toBe(false)
  })

  it('returns false for whitespace-only string', () => {
    expect(isNonEmpty('   ')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isNonEmpty(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isNonEmpty(undefined)).toBe(false)
  })
})

describe('sanitizeString', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('collapses multiple spaces', () => {
    expect(sanitizeString('hello   world')).toBe('hello world')
  })

  it('handles already clean string', () => {
    expect(sanitizeString('hello world')).toBe('hello world')
  })

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('')
  })
})
