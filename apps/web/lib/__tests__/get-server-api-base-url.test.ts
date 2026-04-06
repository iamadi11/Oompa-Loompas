import { afterEach, describe, expect, it, vi } from 'vitest'
import { getServerApiBaseUrl } from '../get-server-api-base-url'

describe('getServerApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns default when no env is set', () => {
    vi.stubEnv('API_URL', undefined)
    vi.stubEnv('NEXT_PUBLIC_API_URL', undefined)
    expect(getServerApiBaseUrl()).toBe('http://localhost:3001')
  })

  it('prefers API_URL over NEXT_PUBLIC_API_URL', () => {
    vi.stubEnv('API_URL', 'http://api.internal:3001')
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001')
    expect(getServerApiBaseUrl()).toBe('http://api.internal:3001')
  })

  it('uses NEXT_PUBLIC_API_URL when API_URL is unset', () => {
    vi.stubEnv('API_URL', undefined)
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com')
    expect(getServerApiBaseUrl()).toBe('https://api.example.com')
  })
})
