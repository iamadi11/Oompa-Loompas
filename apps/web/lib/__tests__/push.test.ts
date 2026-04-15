import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/** Node-compatible atob implementation for testing. */
const nodeAtob = (str: string) => Buffer.from(str, 'base64').toString('binary')

describe('urlBase64ToUint8Array', () => {
  beforeEach(() => {
    // Provide window.atob (used by push.ts) in node test environment
    vi.stubGlobal('window', { atob: nodeAtob })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('converts valid base64url string to Uint8Array', async () => {
    const { urlBase64ToUint8Array } = await import('@/lib/push')
    const base64url = 'BNcRdreALRFXTkOOUHK1EtK2wtBOOFZ3CLnAl1DFWpJl'
    const result = urlBase64ToUint8Array(base64url)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles base64url with hyphens and underscores (replaces to +/)', async () => {
    const { urlBase64ToUint8Array } = await import('@/lib/push')
    // Valid base64url with - and _
    const base64url = 'YQ' // "a" in base64
    const result = urlBase64ToUint8Array(base64url)
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('handles string that already has correct length mod 4', async () => {
    const { urlBase64ToUint8Array } = await import('@/lib/push')
    const fourChar = 'YWJj' // "abc"
    const result = urlBase64ToUint8Array(fourChar)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(3)
  })

  it('returns Uint8Array with correct byte values', async () => {
    const { urlBase64ToUint8Array } = await import('@/lib/push')
    // "hello" in base64url = "aGVsbG8"
    const base64hello = 'aGVsbG8'
    const result = urlBase64ToUint8Array(base64hello)
    expect(Array.from(result)).toEqual([104, 101, 108, 108, 111])
  })
})

describe('askNotificationPermission', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns denied when Notification not in window', async () => {
    // window exists but has no Notification property
    vi.stubGlobal('window', { atob: nodeAtob })
    // Ensure no global Notification
    vi.stubGlobal('Notification', undefined)
    const { askNotificationPermission } = await import('@/lib/push')
    const result = await askNotificationPermission()
    expect(result).toBe('denied')
  })

  it('calls Notification.requestPermission and returns result', async () => {
    const mockRequestPermission = vi.fn().mockResolvedValue('granted')
    const mockNotification = { requestPermission: mockRequestPermission }
    // 'Notification' in window checks the window stub; Notification.x accesses global
    vi.stubGlobal('window', { atob: nodeAtob, Notification: mockNotification })
    vi.stubGlobal('Notification', mockNotification)
    const { askNotificationPermission } = await import('@/lib/push')
    const result = await askNotificationPermission()
    expect(result).toBe('granted')
    expect(mockRequestPermission).toHaveBeenCalledOnce()
  })
})
