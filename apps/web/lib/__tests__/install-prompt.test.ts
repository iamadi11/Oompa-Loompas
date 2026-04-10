import { describe, expect, it } from 'vitest'
import {
  isInstallPromptSuppressed,
  INSTALL_PROMPT_DISMISS_TTL_MS,
} from '@/lib/pwa/install-prompt'

describe('isInstallPromptSuppressed', () => {
  const now = 1_712_000_000_000 // fixed reference timestamp

  it('returns false when no stored value', () => {
    expect(isInstallPromptSuppressed(null, now)).toBe(false)
  })

  it('returns false for non-numeric stored value', () => {
    expect(isInstallPromptSuppressed('garbage', now)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isInstallPromptSuppressed('', now)).toBe(false)
  })

  it('returns true when dismissed 1 second ago (within TTL)', () => {
    const recent = String(now - 1_000)
    expect(isInstallPromptSuppressed(recent, now)).toBe(true)
  })

  it('returns true when dismissed exactly 1ms before TTL boundary', () => {
    const justBeforeTtl = String(now - INSTALL_PROMPT_DISMISS_TTL_MS + 1)
    expect(isInstallPromptSuppressed(justBeforeTtl, now)).toBe(true)
  })

  it('returns false when dismissed exactly at TTL boundary (expired)', () => {
    const atTtl = String(now - INSTALL_PROMPT_DISMISS_TTL_MS)
    expect(isInstallPromptSuppressed(atTtl, now)).toBe(false)
  })

  it('returns false when dismissed longer ago than TTL', () => {
    const old = String(now - INSTALL_PROMPT_DISMISS_TTL_MS - 1_000)
    expect(isInstallPromptSuppressed(old, now)).toBe(false)
  })
})
