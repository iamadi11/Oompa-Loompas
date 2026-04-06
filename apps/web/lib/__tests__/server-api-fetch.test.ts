import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/get-server-api-base-url', () => ({
  getServerApiBaseUrl: () => 'http://127.0.0.1:3001',
}))

describe('serverApiFetch', () => {
  const fetchMock = vi.fn()

  beforeEach(async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValue({
      getAll: () => [
        { name: 'oompa_session', value: 'abc' },
        { name: 'other', value: 'x' },
      ],
    } as never)
  })

  it('normalizes path, forwards cookies, and uses no-store', async () => {
    fetchMock.mockResolvedValue(new Response('{}'))
    const { serverApiFetch } = await import('@/lib/server-api-fetch')
    await serverApiFetch('api/v1/auth/me')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:3001/api/v1/auth/me',
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({
          Cookie: 'oompa_session=abc; other=x',
        }),
      }),
    )
  })

  it('omits Cookie header when jar is empty', async () => {
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValue({
      getAll: () => [],
    } as never)
    fetchMock.mockResolvedValue(new Response('{}'))
    vi.resetModules()
    const { serverApiFetch } = await import('@/lib/server-api-fetch')
    await serverApiFetch('/api/v1/dashboard')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:3001/api/v1/dashboard',
      expect.objectContaining({
        cache: 'no-store',
        headers: {},
      }),
    )
  })
})
