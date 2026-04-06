import { cookies } from 'next/headers'
import { getServerApiBaseUrl } from '@/lib/get-server-api-base-url'

/**
 * Server-side fetch to the Fastify API with the incoming request cookies (session).
 */
export async function serverApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')
  const url = `${getServerApiBaseUrl()}${normalized}`
  return fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      ...init.headers,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  })
}
