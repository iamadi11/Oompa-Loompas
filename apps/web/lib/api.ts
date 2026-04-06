import type {
  Deal,
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
  MeResponse,
} from '@oompa/types'

/**
 * Browser JSON + invoice link base. Empty string = same-origin `/api/v1` via Next rewrites (cookies on web host).
 * Set `NEXT_PUBLIC_API_URL` when the API is on another origin.
 */
export function getBrowserApiBase(): string {
  const raw = process.env['NEXT_PUBLIC_API_URL']
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.replace(/\/$/, '')
  }
  return ''
}

export function paymentInvoiceHref(dealId: string, paymentId: string): string {
  const base = getBrowserApiBase()
  const path = `/api/v1/deals/${dealId}/payments/${paymentId}/invoice`
  return base ? `${base}${path}` : path
}

class ApiClient {
  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const base = getBrowserApiBase()
    const res = await fetch(`${base}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!res.ok) {
      const error = (await res.json().catch(() => ({ message: 'Unknown error' }))) as {
        message: string
      }
      throw new Error(error.message ?? `HTTP ${res.status}`)
    }

    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
  }

  async listDeals(
    filters: Partial<DealListFilters> = {},
  ): Promise<ApiResponse<Deal[]>> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v))
    })
    const qs = params.toString()
    return this.request<ApiResponse<Deal[]>>(`/api/v1/deals${qs ? `?${qs}` : ''}`)
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

  async createDeliverable(dealId: string, data: CreateDeliverable): Promise<ApiResponse<Deliverable>> {
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

  async login(body: LoginBody): Promise<MeResponse> {
    return this.request<MeResponse>('/api/v1/auth/login', {
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
}

export const api = new ApiClient()
