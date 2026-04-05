import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'

function jsonResponse(
  body: unknown,
  init: { ok?: boolean; status?: number } = {},
): Response {
  const ok = init.ok ?? true
  const status = init.status ?? (ok ? 200 : 400)
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response
}

function rejectJsonResponse(
  init: { ok?: boolean; status?: number } = {},
): Response {
  const ok = init.ok ?? false
  const status = init.status ?? 500
  return {
    ok,
    status,
    json: () => Promise.reject(new Error('not json')),
  } as Response
}

describe('ApiClient', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('listDeals calls deals endpoint without query when filters empty', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    await api.listDeals()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals',
      expect.objectContaining({
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

  it('getDeal requests by id', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: '1' } }))
    await api.getDeal('abc')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/abc',
      expect.any(Object),
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })

  it('updateDeal PATCHes JSON body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: '1' } }))
    await api.updateDeal('x', { title: 'N' })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/x', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'N' }),
    })
  })

  it('deleteDeal uses DELETE and handles 204', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(undefined, { ok: true, status: 204 }) as Response,
    )
    await api.deleteDeal('d1')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deals/d1', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('listPayments uses deal-scoped path', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    await api.listPayments('deal-9')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/deal-9/payments',
      expect.any(Object),
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
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/d/payments',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
  })

  it('updatePayment PATCHes payment id route', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'p' } }))
    await api.updatePayment('pid', { status: 'RECEIVED' })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/payments/pid', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RECEIVED' }),
    })
  })

  it('deletePayment uses DELETE', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(undefined, { ok: true, status: 204 }) as Response)
    await api.deletePayment('pid')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/payments/pid', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('getDashboard requests summary', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: {} }))
    await api.getDashboard()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/dashboard',
      expect.any(Object),
    )
  })

  it('listDeliverables uses deal path', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }))
    await api.listDeliverables('d2')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/d2/deliverables',
      expect.any(Object),
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
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/deals/d2/deliverables',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
  })

  it('updateDeliverable PATCHes by id', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'del' } }))
    await api.updateDeliverable('del1', { title: 'T2' })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deliverables/del1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'T2' }),
    })
  })

  it('deleteDeliverable uses DELETE', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(undefined, { ok: true, status: 204 }) as Response)
    await api.deleteDeliverable('del1')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/v1/deliverables/del1', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('throws with server message when response is not ok', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'nope' }, { ok: false, status: 400 }))
    await expect(api.getDeal('x')).rejects.toThrow('nope')
  })

  it('throws Unknown error when error body is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(rejectJsonResponse({ ok: false, status: 502 }))
    await expect(api.getDeal('x')).rejects.toThrow('Unknown error')
  })
})
