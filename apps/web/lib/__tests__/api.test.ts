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
  headers: {},
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
      expect.objectContaining({ credentials: 'include' }),
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

  it('listDealBrands GETs /api/v1/deals/brands', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            brandName: 'Nike',
            dealCount: 1,
            contractedTotals: [{ currency: 'INR', amount: 5000 }],
          },
        ],
      }),
    )
    const res = await api.listDealBrands()
    expect(res.data).toEqual([
      { brandName: 'Nike', dealCount: 1, contractedTotals: [{ currency: 'INR', amount: 5000 }] },
    ])
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/brands',
      expect.objectContaining(defaultFetchInit),
    )
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
      headers: {},
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
      headers: {},
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
      headers: {},
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
      headers: {},
    })
  })

  it('duplicateDeal POSTs to duplicate endpoint and returns new deal', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { data: { id: 'new-id', title: 'Deal (Copy)', status: 'DRAFT' } },
        { status: 201 },
      ),
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
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'Forbidden' }, { ok: false, status: 403 }),
    )
    await expect(api.downloadDealsPortfolioCsv()).rejects.toThrow('Forbidden')
  })

  it('downloadDealsPortfolioCsv throws helpful message on non-JSON 5xx', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('Bad Gateway', { status: 502, statusText: 'Bad Gateway' }),
    )
    await expect(api.downloadDealsPortfolioCsv()).rejects.toThrow(/Could not reach the API/)
  })

  it('downloadPaymentsPortfolioCsv GETs export/payments and returns blob', async () => {
    const csv = 'payment_id\n'
    fetchMock.mockResolvedValueOnce(
      new Response(new Blob([csv], { type: 'text/csv' }), {
        status: 200,
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      }),
    )
    const blob = await api.downloadPaymentsPortfolioCsv()
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/export/payments', {
      credentials: 'include',
    })
    expect(blob.type).toMatch(/^text\/csv/)
    expect(await blob.text()).toBe(csv)
  })

  it('downloadPaymentsPortfolioCsv throws with server JSON message when not ok', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'No' }, { ok: false, status: 403 }))
    await expect(api.downloadPaymentsPortfolioCsv()).rejects.toThrow('No')
  })

  it('downloadDeliverablesPortfolioCsv GETs export/deliverables and returns blob', async () => {
    const csv = 'deliverable_id\n'
    fetchMock.mockResolvedValueOnce(
      new Response(new Blob([csv], { type: 'text/csv' }), {
        status: 200,
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      }),
    )
    const blob = await api.downloadDeliverablesPortfolioCsv()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/export/deliverables',
      {
        credentials: 'include',
      },
    )
    expect(blob.type).toMatch(/^text\/csv/)
    expect(await blob.text()).toBe(csv)
  })

  it('downloadDeliverablesPortfolioCsv throws with server JSON message when not ok', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Nope' }, { ok: false, status: 403 }))
    await expect(api.downloadDeliverablesPortfolioCsv()).rejects.toThrow('Nope')
  })

  it('downloadAttentionQueueCsv GETs attention/export and returns blob', async () => {
    const csv = 'priority_kind\n'
    fetchMock.mockResolvedValueOnce(
      new Response(new Blob([csv], { type: 'text/csv' }), {
        status: 200,
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      }),
    )
    const blob = await api.downloadAttentionQueueCsv()
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/attention/export', {
      credentials: 'include',
    })
    expect(blob.type).toMatch(/^text\/csv/)
    expect(await blob.text()).toBe(csv)
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

describe('Brand profile API client methods', () => {
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

  it('getBrandProfile GETs /api/v1/brands/:brandName with url-encoding', async () => {
    const view = {
      brandName: 'Nike & Co',
      profile: null,
      stats: {
        totalDeals: 2,
        overduePaymentsCount: 1,
        contractedTotals: [{ currency: 'INR', amount: 5000 }],
      },
      recentDeals: [],
    }
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: view }))
    const res = await api.getBrandProfile('Nike & Co')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/brands/Nike%20%26%20Co',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(res.data.brandName).toBe('Nike & Co')
    expect(res.data.stats.totalDeals).toBe(2)
    expect(res.data.profile).toBeNull()
  })

  it('upsertBrandProfile PUTs JSON body', async () => {
    const profile = {
      id: 'p1',
      userId: 'u1',
      brandName: 'Nike',
      contactEmail: 'a@b.com',
      contactPhone: null,
      notes: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: profile }))
    const payload = { contactEmail: 'a@b.com', contactPhone: null, notes: null }
    const res = await api.upsertBrandProfile('Nike', payload)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/brands/Nike',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(payload) }),
    )
    expect(res.data.contactEmail).toBe('a@b.com')
  })

  it('deleteBrandProfile DELETEs /api/v1/brands/:brandName', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, { status: 204 }))
    await api.deleteBrandProfile('Nike')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/brands/Nike',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('Push notification API client methods', () => {
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

  it('getPushPublicKey calls correct endpoint', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { publicKey: 'test-key' } }))
    const result = await api.getPushPublicKey()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/push/public-key',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(result.data.publicKey).toBe('test-key')
  })

  it('subscribePush calls subscribe endpoint with subscription payload', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, { status: 204 }))
    const sub = { endpoint: 'https://fcm.example.com/ep', keys: { p256dh: 'abc', auth: 'xyz' } }
    await api.subscribePush(sub)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/push/subscribe',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(sub),
      }),
    )
  })

  it('unsubscribePush calls unsubscribe endpoint with endpoint in body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, { status: 204 }))
    await api.unsubscribePush('https://fcm.example.com/ep')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/push/unsubscribe',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ endpoint: 'https://fcm.example.com/ep' }),
      }),
    )
  })

  it('listTemplates calls templates endpoint', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    const result = await api.listTemplates()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/templates',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(result.data).toEqual([])
  })

  it('getTemplate calls templates/:id endpoint', async () => {
    const tpl = { id: 'tpl-1', name: 'My Template' }
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: tpl }))
    const result = await api.getTemplate('tpl-1')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/templates/tpl-1',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(result.data.id).toBe('tpl-1')
  })

  it('createTemplate posts to templates endpoint', async () => {
    const tpl = { id: 'tpl-1', name: 'New Template' }
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: tpl }, { status: 201 }))
    const payload = { name: 'New Template', deliverables: [], payments: [] }
    await api.createTemplate(payload)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/templates',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
    )
  })

  it('updateTemplate puts to templates/:id endpoint', async () => {
    const tpl = { id: 'tpl-1', name: 'Updated' }
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: tpl }))
    const payload = { name: 'Updated', deliverables: [], payments: [] }
    await api.updateTemplate('tpl-1', payload)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/templates/tpl-1',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(payload) }),
    )
  })

  it('deleteTemplate sends DELETE to templates/:id', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, { status: 204 }))
    await api.deleteTemplate('tpl-1')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/templates/tpl-1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('saveAsTemplate posts to deals/:id/save-as-template', async () => {
    const tpl = { id: 'tpl-1', name: 'From Deal' }
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: tpl }, { status: 201 }))
    await api.saveAsTemplate('deal-1', 'From Deal')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/deal-1/save-as-template',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'From Deal' }) }),
    )
  })

  it('getNotificationSettings returns all three flags', async () => {
    const data = { emailDigestEnabled: true, followupEmailsEnabled: false, pushEnabled: true }
    fetchMock.mockResolvedValueOnce(jsonResponse({ data }))
    const result = await api.getNotificationSettings()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/settings/notifications',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(result.data).toEqual(data)
  })

  it('updateNotificationSettings patches emailDigestEnabled', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, { status: 204 }))
    await api.updateNotificationSettings({ emailDigestEnabled: false })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/settings/notifications',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ emailDigestEnabled: false }) }),
    )
  })

  it('updateNotificationSettings patches followupEmailsEnabled', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, { status: 204 }))
    await api.updateNotificationSettings({ followupEmailsEnabled: true })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/settings/notifications',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ followupEmailsEnabled: true }) }),
    )
  })

  it('reconcileMatch posts transactions and returns matches', async () => {
    const result = { matches: [], unmatched: [] }
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: result }))
    const txns = [{ date: '2026-04-01', amount: 1000 }]
    await api.reconcileMatch(txns)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/reconcile/match',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ transactions: txns }) }),
    )
  })

  it('reconcileApply posts approvals and returns updated count', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { updated: 2 } }))
    const approvals = [{ paymentId: 'p-1', receivedAt: '2026-04-01T00:00:00.000Z' }]
    await api.reconcileApply(approvals)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/reconcile/apply',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ approvals }) }),
    )
  })
})
