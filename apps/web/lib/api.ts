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
  ApiResponse,
} from '@oompa/types'

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

class ApiClient {
  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
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
}

export const api = new ApiClient()
