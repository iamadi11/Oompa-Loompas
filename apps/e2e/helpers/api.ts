/**
 * Typed API helpers for seeding test data directly against the Fastify API.
 * All requests use the Playwright session cookie (from storageState auth).
 */
import type { APIRequestContext } from '@playwright/test'
import { expect } from '@playwright/test'

export const API = process.env['E2E_API_URL'] ?? 'http://localhost:3001'

type Req = APIRequestContext

// ─── Deals ────────────────────────────────────────────────────────────────

export async function createDeal(
  req: Req,
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const res = await req.post(`${API}/api/v1/deals`, {
    data: {
      title: `E2E Deal ${Date.now()}`,
      brandName: 'E2EBrand',
      value: 75000,
      currency: 'INR',
      status: 'DRAFT',
      ...overrides,
    },
  })
  expect(res.ok(), `createDeal failed: ${res.status()}`).toBe(true)
  const body = (await res.json()) as { data: { id: string } }
  return body.data.id
}

export async function updateDealStatus(req: Req, dealId: string, status: string): Promise<void> {
  const res = await req.patch(`${API}/api/v1/deals/${dealId}`, { data: { status } })
  expect(res.ok(), `updateDealStatus failed: ${res.status()}`).toBe(true)
}

export async function deleteDeal(req: Req, dealId: string): Promise<void> {
  await req.delete(`${API}/api/v1/deals/${dealId}`)
}

// ─── Payments ─────────────────────────────────────────────────────────────

export async function createPayment(
  req: Req,
  dealId: string,
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const res = await req.post(`${API}/api/v1/deals/${dealId}/payments`, {
    data: {
      amount: 25000,
      currency: 'INR',
      dueDate: new Date(Date.now() - 86_400_000).toISOString(), // yesterday (overdue)
      notes: null,
      ...overrides,
    },
  })
  expect(res.ok(), `createPayment failed: ${res.status()}`).toBe(true)
  const body = (await res.json()) as { data: { id: string } }
  return body.data.id
}

export async function markPaymentReceived(req: Req, paymentId: string): Promise<void> {
  const res = await req.patch(`${API}/api/v1/payments/${paymentId}`, {
    data: { status: 'RECEIVED' },
  })
  expect(res.ok(), `markPaymentReceived failed: ${res.status()}`).toBe(true)
}

// ─── Deliverables ──────────────────────────────────────────────────────────

export async function createDeliverable(
  req: Req,
  dealId: string,
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const res = await req.post(`${API}/api/v1/deals/${dealId}/deliverables`, {
    data: {
      title: `E2E Deliverable ${Date.now()}`,
      platform: 'INSTAGRAM',
      type: 'REEL',
      dueDate: new Date(Date.now() - 86_400_000).toISOString(),
      notes: null,
      ...overrides,
    },
  })
  expect(res.ok(), `createDeliverable failed: ${res.status()}`).toBe(true)
  const body = (await res.json()) as { data: { id: string } }
  return body.data.id
}

// ─── Share token ───────────────────────────────────────────────────────────

export async function generateShareToken(req: Req, dealId: string): Promise<string> {
  const res = await req.post(`${API}/api/v1/deals/${dealId}/share`)
  expect(res.ok(), `generateShareToken failed: ${res.status()}`).toBe(true)
  const body = (await res.json()) as { data: { shareToken: string } }
  return body.data.shareToken
}

// ─── Deliverable approval ─────────────────────────────────────────────────

export async function generateApprovalToken(
  req: Req,
  dealId: string,
  deliverableId: string,
): Promise<string> {
  const res = await req.post(
    `${API}/api/v1/deals/${dealId}/deliverables/${deliverableId}/share-approval`,
  )
  expect(res.ok(), `generateApprovalToken failed: ${res.status()}`).toBe(true)
  const body = (await res.json()) as { data: { approvalToken: string } }
  return body.data.approvalToken
}

// ─── Templates ────────────────────────────────────────────────────────────

export async function deleteAllTemplates(req: Req): Promise<void> {
  const res = await req.get(`${API}/api/v1/templates`)
  if (!res.ok()) return
  const body = (await res.json()) as { data: { id: string }[] }
  const items = body.data ?? []
  await Promise.all(items.map((t) => req.delete(`${API}/api/v1/templates/${t.id}`)))
}

export async function createTemplate(
  req: Req,
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const res = await req.post(`${API}/api/v1/templates`, {
    data: {
      name: `E2E Template ${Date.now()}`,
      defaultValue: 50000,
      currency: 'INR',
      notes: null,
      deliverables: [],
      payments: [],
      ...overrides,
    },
  })
  expect(res.ok(), `createTemplate failed: ${res.status()} ${await res.text()}`).toBe(true)
  const body = (await res.json()) as { data: { id: string } }
  return body.data.id
}
