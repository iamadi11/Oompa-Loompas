import type {
  Deal,
  DealBrandSummary,
  CreateDeal,
  UpdateDeal,
  DealListFilters,
  Payment,
  CreatePayment,
  UpdatePayment,
  Deliverable,
  CreateDeliverable,
  UpdateDeliverable,
  DashboardSummary,
  AttentionQueue,
  ApiResponse,
  LoginBody,
  RegisterBody,
  MeResponse,
  BrandProfile,
  UpsertBrandProfile,
  Currency,
  DealStatus,
  DealTemplate,
  CreateDealTemplate,
  UpdateDealTemplate,
  DeliverableApprovalView,
} from '@oompa/types'

export interface BrandRecentDeal {
  id: string
  title: string
  value: number
  currency: Currency
  status: DealStatus
  createdAt: string
}

export interface BrandProfileStats {
  totalDeals: number
  overduePaymentsCount: number
  contractedTotals: { currency: Currency; amount: number }[]
}

export interface BrandProfileView {
  brandName: string
  profile: BrandProfile | null
  stats: BrandProfileStats
  recentDeals: BrandRecentDeal[]
}

/**
 * Base URL for browser `fetch` and invoice links.
 *
 * In a real browser we always return `''` so calls use same-origin `/api/v1/*` (Next rewrites to `API_URL`).
 * That way `credentials: 'include'` sends the session cookie issued for the **web** host — not a direct
 * `http://127.0.0.1:3001` origin, which would not receive that cookie on `:3000`.
 *
 * `NEXT_PUBLIC_API_URL` applies only outside a browser `window` (e.g. Vitest, some tooling).
 */
export function getBrowserApiBase(): string {
  if ((globalThis as { window?: unknown }).window !== undefined) {
    return ''
  }
  const raw = process.env['NEXT_PUBLIC_API_URL']
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.replace(/\/$/, '')
  }
  return ''
}

export function paymentInvoiceHref(
  dealId: string,
  paymentId: string,
  shareToken?: string | null,
): string {
  const base = getBrowserApiBase()
  const path = `/api/v1/deals/${dealId}/payments/${paymentId}/invoice`
  const query = shareToken ? `?token=${shareToken}` : ''
  return base ? `${base}${path}${query}` : `${path}${query}`
}

/** Same-origin absolute URL for sharing or pasting (browser only). */
export function paymentInvoiceAbsoluteUrl(
  dealId: string,
  paymentId: string,
  shareToken?: string | null,
): string {
  const href = paymentInvoiceHref(dealId, paymentId, shareToken)
  if (typeof window === 'undefined') return href
  return new URL(href, window.location.origin).href
}

class ApiClient {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const base = getBrowserApiBase()
    const headers: Record<string, string> = { ...options.headers as Record<string, string> }
    if (options.body != null) headers['Content-Type'] = 'application/json'
    const res = await fetch(`${base}${path}`, {
      credentials: 'include',
      headers,
      ...options,
    })

    if (!res.ok) {
      const raw = await res.text()
      let message: string
      try {
        const parsed = JSON.parse(raw) as { message?: string; error?: string }
        message = parsed.message ?? parsed.error ?? `HTTP ${res.status}`
      } catch {
        const snippet = raw.trim().slice(0, 200)
        const likelyUnreachable =
          [502, 503, 504].includes(res.status) ||
          (res.status >= 500 &&
            /\b(internal server error|bad gateway|service unavailable|gateway timeout)\b/i.test(
              snippet,
            ))
        message = likelyUnreachable
          ? 'Could not reach the API. If you are developing locally, start the API (pnpm --filter @oompa/api dev) and ensure Next.js can reach it (see API_URL in next.config).'
          : `Request failed (${res.status})`
      }
      throw new Error(message)
    }

    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
  }

  /** Same-origin GET; CSV or other non-JSON body. Reuses JSON API error parsing for failures. */
  private async fetchBinary(path: string): Promise<Blob> {
    const base = getBrowserApiBase()
    const res = await fetch(`${base}${path}`, {
      credentials: 'include',
    })

    if (!res.ok) {
      const raw = await res.text()
      let message: string
      try {
        const parsed = JSON.parse(raw) as { message?: string; error?: string }
        message = parsed.message ?? parsed.error ?? `HTTP ${res.status}`
      } catch {
        const snippet = raw.trim().slice(0, 200)
        const likelyUnreachable =
          [502, 503, 504].includes(res.status) ||
          (res.status >= 500 &&
            /\b(internal server error|bad gateway|service unavailable|gateway timeout)\b/i.test(
              snippet,
            ))
        message = likelyUnreachable
          ? 'Could not reach the API. If you are developing locally, start the API (pnpm --filter @oompa/api dev) and ensure Next.js can reach it (see API_URL in next.config).'
          : `Request failed (${res.status})`
      }
      throw new Error(message)
    }

    return res.blob()
  }

  async listDeals(filters: Partial<DealListFilters> = {}): Promise<ApiResponse<Deal[]>> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v))
    })
    const qs = params.toString()
    return this.request<ApiResponse<Deal[]>>(`/api/v1/deals${qs ? `?${qs}` : ''}`)
  }

  async listDealBrands(): Promise<ApiResponse<DealBrandSummary[]>> {
    return this.request<ApiResponse<DealBrandSummary[]>>('/api/v1/deals/brands')
  }

  async getDeal(id: string): Promise<ApiResponse<Deal>> {
    return this.request<ApiResponse<Deal>>(`/api/v1/deals/${id}`)
  }

  async createDeal(data: CreateDeal): Promise<ApiResponse<Deal>> {
    return this.request<ApiResponse<Deal>>('/api/v1/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDeal(id: string, data: UpdateDeal): Promise<ApiResponse<Deal>> {
    return this.request<ApiResponse<Deal>>(`/api/v1/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteDeal(id: string): Promise<void> {
    return this.request<void>(`/api/v1/deals/${id}`, { method: 'DELETE' })
  }

  async listPayments(dealId: string): Promise<ApiResponse<Payment[]>> {
    return this.request<ApiResponse<Payment[]>>(`/api/v1/deals/${dealId}/payments`)
  }

  async createPayment(dealId: string, data: CreatePayment): Promise<ApiResponse<Payment>> {
    return this.request<ApiResponse<Payment>>(`/api/v1/deals/${dealId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePayment(id: string, data: UpdatePayment): Promise<ApiResponse<Payment>> {
    return this.request<ApiResponse<Payment>>(`/api/v1/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deletePayment(id: string): Promise<void> {
    return this.request<void>(`/api/v1/payments/${id}`, { method: 'DELETE' })
  }

  async getDashboard(): Promise<ApiResponse<DashboardSummary>> {
    return this.request<ApiResponse<DashboardSummary>>('/api/v1/dashboard')
  }

  async getAttention(): Promise<ApiResponse<AttentionQueue>> {
    return this.request<ApiResponse<AttentionQueue>>('/api/v1/attention')
  }

  async listDeliverables(dealId: string): Promise<ApiResponse<Deliverable[]>> {
    return this.request<ApiResponse<Deliverable[]>>(`/api/v1/deals/${dealId}/deliverables`)
  }

  async createDeliverable(
    dealId: string,
    data: CreateDeliverable,
  ): Promise<ApiResponse<Deliverable>> {
    return this.request<ApiResponse<Deliverable>>(`/api/v1/deals/${dealId}/deliverables`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDeliverable(id: string, data: UpdateDeliverable): Promise<ApiResponse<Deliverable>> {
    return this.request<ApiResponse<Deliverable>>(`/api/v1/deliverables/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteDeliverable(id: string): Promise<void> {
    return this.request<void>(`/api/v1/deliverables/${id}`, { method: 'DELETE' })
  }

  async duplicateDeal(id: string): Promise<ApiResponse<Deal>> {
    return this.request<ApiResponse<Deal>>(`/api/v1/deals/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async downloadDealsPortfolioCsv(): Promise<Blob> {
    return this.fetchBinary('/api/v1/deals/export')
  }

  async downloadPaymentsPortfolioCsv(): Promise<Blob> {
    return this.fetchBinary('/api/v1/deals/export/payments')
  }

  async downloadDeliverablesPortfolioCsv(): Promise<Blob> {
    return this.fetchBinary('/api/v1/deals/export/deliverables')
  }

  async downloadAttentionQueueCsv(): Promise<Blob> {
    return this.fetchBinary('/api/v1/attention/export')
  }

  async shareProposal(dealId: string): Promise<{ data: { shareToken: string; shareUrl: string } }> {
    return this.request<{ data: { shareToken: string; shareUrl: string } }>(
      `/api/v1/deals/${dealId}/share`,
      { method: 'POST', body: JSON.stringify({}) },
    )
  }

  async revokeShare(dealId: string): Promise<{ data: { shareToken: null } }> {
    return this.request<{ data: { shareToken: null } }>(`/api/v1/deals/${dealId}/share`, {
      method: 'DELETE',
    })
  }

  async generateApprovalToken(
    dealId: string,
    deliverableId: string,
  ): Promise<{ data: { approvalToken: string; approvalUrl: string } }> {
    return this.request<{ data: { approvalToken: string; approvalUrl: string } }>(
      `/api/v1/deals/${dealId}/deliverables/${deliverableId}/share-approval`,
      { method: 'POST', body: JSON.stringify({}) },
    )
  }

  async revokeApprovalToken(
    dealId: string,
    deliverableId: string,
  ): Promise<{ data: { approvalToken: null } }> {
    return this.request<{ data: { approvalToken: null } }>(
      `/api/v1/deals/${dealId}/deliverables/${deliverableId}/share-approval`,
      { method: 'DELETE' },
    )
  }

  async getApprovalView(token: string): Promise<{ data: DeliverableApprovalView }> {
    return this.request<{ data: DeliverableApprovalView }>(`/api/v1/approvals/${token}`)
  }

  async submitApproval(token: string): Promise<{ data: DeliverableApprovalView }> {
    return this.request<{ data: DeliverableApprovalView }>(`/api/v1/approvals/${token}`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async getBrandProfile(brandName: string): Promise<ApiResponse<BrandProfileView>> {
    return this.request<ApiResponse<BrandProfileView>>(
      `/api/v1/brands/${encodeURIComponent(brandName)}`,
    )
  }

  async upsertBrandProfile(
    brandName: string,
    data: UpsertBrandProfile,
  ): Promise<ApiResponse<BrandProfile>> {
    return this.request<ApiResponse<BrandProfile>>(
      `/api/v1/brands/${encodeURIComponent(brandName)}`,
      { method: 'PUT', body: JSON.stringify(data) },
    )
  }

  async deleteBrandProfile(brandName: string): Promise<void> {
    return this.request<void>(`/api/v1/brands/${encodeURIComponent(brandName)}`, {
      method: 'DELETE',
    })
  }

  async login(body: LoginBody): Promise<MeResponse> {
    return this.request<MeResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async register(body: RegisterBody): Promise<MeResponse> {
    return this.request<MeResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async logout(): Promise<void> {
    // Fastify rejects application/json with an empty body; send a minimal object.
    return this.request<void>('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async getMe(): Promise<MeResponse> {
    return this.request<MeResponse>('/api/v1/auth/me')
  }

  async getPushPublicKey(): Promise<ApiResponse<{ publicKey: string }>> {
    return this.request<ApiResponse<{ publicKey: string }>>('/api/v1/push/public-key')
  }

  async subscribePush(subscription: {
    endpoint?: string
    keys?: Record<string, string>
  }): Promise<void> {
    return this.request<void>('/api/v1/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    })
  }

  async unsubscribePush(endpoint: string): Promise<void> {
    return this.request<void>('/api/v1/push/unsubscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    })
  }

  async listTemplates(): Promise<ApiResponse<DealTemplate[]>> {
    return this.request<ApiResponse<DealTemplate[]>>('/api/v1/templates')
  }

  async getTemplate(id: string): Promise<ApiResponse<DealTemplate>> {
    return this.request<ApiResponse<DealTemplate>>(`/api/v1/templates/${id}`)
  }

  async createTemplate(data: CreateDealTemplate): Promise<ApiResponse<DealTemplate>> {
    return this.request<ApiResponse<DealTemplate>>('/api/v1/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTemplate(id: string, data: UpdateDealTemplate): Promise<ApiResponse<DealTemplate>> {
    return this.request<ApiResponse<DealTemplate>>(`/api/v1/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.request<void>(`/api/v1/templates/${id}`, { method: 'DELETE' })
  }

  async saveAsTemplate(dealId: string, name: string): Promise<ApiResponse<DealTemplate>> {
    return this.request<ApiResponse<DealTemplate>>(`/api/v1/deals/${dealId}/save-as-template`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }
}

export const api = new ApiClient()
