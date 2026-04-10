import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, getBrowserApiBase, paymentInvoiceHref, paymentInvoiceAbsoluteUrl } from '@/lib/api'

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  const ok = init.ok ?? true
  const status = init.status ?? (ok ? 200 : 400)
  if (status === 204) {
    return new Response(null, { status: 204 })
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const defaultFetchInit = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
}

describe('ApiClient', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001')
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('listDeals calls deals endpoint without query when filters empty', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    await api.listDeals()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    )
  })

  it('listDeals serializes filters into query string', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    await api.listDeals({ status: 'DRAFT', page: 2 })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/deals\?/),
      expect.any(Object),
    )
    const url = String(fetchMock.mock.calls[0]?.[0])
    expect(url).toContain('status=DRAFT')
    expect(url).toContain('page=2')
  })

  it('listDeals serializes needsAttention when true', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    await api.listDeals({ needsAttention: 'true' })
    const url = String(fetchMock.mock.calls[0]?.[0])
    expect(url).toContain('needsAttention=true')
  })

  it('getDeal requests by id', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: '1' } }))
    await api.getDeal('abc')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/abc',
      expect.objectContaining(defaultFetchInit),
    )
  })

  it('createDeal POSTs JSON body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: '1' } }))
    const payload = {
      title: 'T',
      value: 1,
      currency: 'INR' as const,
      brandName: 'B',
      status: 'DRAFT' as const,
    }
    await api.createDeal(payload)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })

  it('updateDeal PATCHes JSON body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: '1' } }))
    await api.updateDeal('x', { title: 'N' })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/x', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'N' }),
    })
  })

  it('deleteDeal uses DELETE and handles 204', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(undefined, { ok: true, status: 204 }))
    await api.deleteDeal('d1')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/d1', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('listPayments uses deal-scoped path', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    await api.listPayments('deal-9')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/deal-9/payments',
      expect.objectContaining(defaultFetchInit),
    )
  })

  it('createPayment POSTs to deal payments', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'p' } }))
    const body = {
      amount: 100,
      currency: 'INR' as const,
      status: 'PENDING' as const,
    }
    await api.createPayment('d', body)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/d/payments', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  })

  it('updatePayment PATCHes payment id route', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'p' } }))
    await api.updatePayment('pid', { status: 'RECEIVED' })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/payments/pid', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RECEIVED' }),
    })
  })

  it('deletePayment uses DELETE', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(undefined, { ok: true, status: 204 }))
    await api.deletePayment('pid')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/payments/pid', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('getDashboard requests summary', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: {} }))
    await api.getDashboard()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/dashboard',
      expect.objectContaining(defaultFetchInit),
    )
  })

  it('getAttention requests attention queue', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { actions: [] } }))
    await api.getAttention()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/attention',
      expect.objectContaining(defaultFetchInit),
    )
  })

  it('listDeliverables uses deal path', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    await api.listDeliverables('d2')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/d2/deliverables',
      expect.objectContaining(defaultFetchInit),
    )
  })

  it('createDeliverable POSTs body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'del' } }))
    const body = {
      title: 'Post',
      platform: 'INSTAGRAM' as const,
      type: 'POST' as const,
      dueDate: null,
    }
    await api.createDeliverable('d2', body)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/d2/deliverables', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  })

  it('updateDeliverable PATCHes by id', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'del' } }))
    await api.updateDeliverable('del1', { title: 'T2' })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deliverables/del1', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'T2' }),
    })
  })

  it('deleteDeliverable uses DELETE', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(undefined, { ok: true, status: 204 }))
    await api.deleteDeliverable('del1')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deliverables/del1', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('register POSTs credentials to /auth/register', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { id: 'u2', email: 'new@b.co', roles: ['MEMBER'] } }, { status: 201 }),
    )
    await api.register({ email: 'new@b.co', password: 'secret123' })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@b.co', password: 'secret123' }),
    })
  })

  it('shareProposal POSTs to deal share endpoint', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { shareToken: 'tok', shareUrl: 'http://x/p/tok' } }),
    )
    await api.shareProposal('d1')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/d1/share', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  })

  it('revokeShare DELETEs deal share', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { shareToken: null } }))
    await api.revokeShare('d1')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/d1/share', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('duplicateDeal POSTs to duplicate endpoint and returns new deal', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { id: 'new-id', title: 'Deal (Copy)', status: 'DRAFT' } }, { status: 201 }),
    )
    await api.duplicateDeal('d1')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/d1/duplicate', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  })

  it('downloadDealsPortfolioCsv GETs export without JSON headers and returns blob', async () => {
    const csv = 'deal_id,title\n'
    fetchMock.mockResolvedValueOnce(
      new Response(new Blob([csv], { type: 'text/csv' }), {
        status: 200,
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      }),
    )
    const blob = await api.downloadDealsPortfolioCsv()
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/export', {
      credentials: 'include',
    })
    expect(blob.type).toMatch(/^text\/csv/)
    expect(await blob.text()).toBe(csv)
  })

  it('downloadDealsPortfolioCsv throws with server JSON message when not ok', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Forbidden' }, { ok: false, status: 403 }))
    await expect(api.downloadDealsPortfolioCsv()).rejects.toThrow('Forbidden')
  })

  it('downloadDealsPortfolioCsv throws helpful message on non-JSON 5xx', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('Bad Gateway', { status: 502, statusText: 'Bad Gateway' }),
    )
    await expect(api.downloadDealsPortfolioCsv()).rejects.toThrow(/Could not reach the API/)
  })

  it('login POSTs credentials', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { id: 'u1', email: 'a@b.co', roles: ['ADMIN'] } }),
    )
    await api.login({ email: 'a@b.co', password: 'x' })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.co', password: 'x' }),
    })
  })

  it('logout POSTs', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(undefined, { ok: true, status: 204 }))
    await api.logout()
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  })

  it('getMe GETs session user', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { id: 'u1', email: 'a@b.co', roles: ['MEMBER'] } }),
    )
    await api.getMe()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/auth/me',
      expect.objectContaining(defaultFetchInit),
    )
  })

  it('throws with server message when response is not ok', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'nope' }, { ok: false, status: 400 }))
    await expect(api.getDeal('x')).rejects.toThrow('nope')
  })

  it('throws a helpful message when proxy returns non-JSON 5xx (API likely down)', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 502, statusText: 'Bad Gateway' }),
    )
    await expect(api.getDeal('x')).rejects.toThrow(/Could not reach the API/)
  })

  it('uses same-origin paths when NEXT_PUBLIC_API_URL is unset', async () => {
    vi.unstubAllEnvs()
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    await api.listDeals()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/deals',
      expect.objectContaining(defaultFetchInit),
    )
  })
})

describe('getBrowserApiBase and paymentInvoiceHref', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('getBrowserApiBase trims trailing slash from env', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001/')
    expect(getBrowserApiBase()).toBe('http://localhost:3001')
  })

  it('paymentInvoiceHref prefixes path when base is set', () => {
    expect(paymentInvoiceHref('d1', 'p1')).toBe(
      'http://localhost:3001/api/v1/deals/d1/payments/p1/invoice',
    )
  })

  it('paymentInvoiceHref is relative when base is empty', () => {
    vi.unstubAllEnvs()
    expect(paymentInvoiceHref('d1', 'p1')).toBe('/api/v1/deals/d1/payments/p1/invoice')
  })

  it('getBrowserApiBase ignores NEXT_PUBLIC_API_URL in browser (same-origin session cookies)', () => {
    vi.stubGlobal('window', {})
    expect(getBrowserApiBase()).toBe('')
    expect(paymentInvoiceHref('d1', 'p1')).toBe('/api/v1/deals/d1/payments/p1/invoice')
    vi.unstubAllGlobals()
  })

  it('paymentInvoiceAbsoluteUrl returns relative path outside browser', () => {
    vi.unstubAllEnvs()
    expect(paymentInvoiceAbsoluteUrl('d1', 'p1')).toBe('/api/v1/deals/d1/payments/p1/invoice')
  })

  it('paymentInvoiceAbsoluteUrl returns absolute URL in browser', () => {
    vi.stubGlobal('window', { location: { origin: 'https://app.example.com' } })
    expect(paymentInvoiceAbsoluteUrl('d1', 'p1')).toBe(
      'https://app.example.com/api/v1/deals/d1/payments/p1/invoice',
    )
    vi.unstubAllGlobals()
  })
})
