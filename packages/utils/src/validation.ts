import { type ZodSchema, ZodError, type ZodIssue } from 'zod'

export interface ValidationResult<T> {
  success: true
  data: T
}

export interface ValidationFailure {
  success: false
  errors: Array<{ path: string; message: string }>
}

export type ValidationOutcome<T> = ValidationResult<T> | ValidationFailure

/**
 * Safely parses data against a Zod schema.
 * Returns a discriminated union — callers must check `success` before using `data`.
 *
 * Failure mode: schema mismatch returns structured errors (not thrown).
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): ValidationOutcome<T> {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.issues.map((issue: ZodIssue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  }
}

/**
 * Formats Zod errors into a flat map of field → message.
 * Useful for form error display.
 */
export function formatZodErrors(error: ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue: ZodIssue) => [issue.path.join('.'), issue.message]),
  )
}

/**
 * Type guard: narrows string to non-empty string.
 */
export function isNonEmpty(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Sanitizes a string for safe display — trims and collapses whitespace.
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}
