import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildServer } from '../server.js'
import { prisma, Prisma } from '@oompa/db'

const mockPrisma = prisma as typeof prisma & {
  deal: { findUnique: ReturnType<typeof vi.fn> }
  payment: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  invoiceCounter: { upsert: ReturnType<typeof vi.fn> }
  $transaction: ReturnType<typeof vi.fn>
  $executeRaw: ReturnType<typeof vi.fn>
}

const DEAL_ID = '550e8400-e29b-41d4-a716-446655440000'
const PAYMENT_ID = '660e8400-e29b-41d4-a716-446655440001'

const mockDealStub = { id: DEAL_ID }

const mockPayment = {
  id: PAYMENT_ID,
  dealId: DEAL_ID,
  amount: new Prisma.Decimal(40000),
  currency: 'INR',
  status: 'PENDING',
  dueDate: null,
  receivedAt: null,
  notes: null,
  invoiceNumber: null as string | null,
  createdAt: new Date('2026-04-04T00:00:00.000Z'),
  updatedAt: new Date('2026-04-04T00:00:00.000Z'),
}

const mockDealForInvoice = {
  id: DEAL_ID,
  title: 'Creator partnership',
  brandName: 'Acme Brand',
  currency: 'INR' as const,
  notes: null as string | null,
}

const mockPaymentWithDeal = {
  ...mockPayment,
  deal: mockDealForInvoice,
}

describe('GET /api/v1/deals/:dealId/payments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.deal.findUnique.mockResolvedValue(mockDealStub)
    mockPrisma.payment.findMany.mockResolvedValue([mockPayment])
  })

  it('returns 200 with payment list for existing deal', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${DEAL_ID}/payments`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toHaveLength(1)
    await fastify.close()
  })

  it('returns 404 when deal does not exist', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/550e8400-e29b-41d4-a716-000000000000/payments`,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns payments with isOverdue=false for non-overdue payment', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([
      { ...mockPayment, dueDate: new Date('2030-01-01T00:00:00.000Z') },
    ])

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${DEAL_ID}/payments`,
    })

    const body = response.json()
    expect(body.data[0]?.isOverdue).toBe(false)
    await fastify.close()
  })

  it('returns payments with isOverdue=true for past-due pending payment', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([
      { ...mockPayment, dueDate: new Date('2020-01-01T00:00:00.000Z'), status: 'PENDING' },
    ])

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${DEAL_ID}/payments`,
    })

    const body = response.json()
    expect(body.data[0]?.isOverdue).toBe(true)
    await fastify.close()
  })

  it('returns isOverdue=false for RECEIVED payment even if past due date', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([
      { ...mockPayment, dueDate: new Date('2020-01-01T00:00:00.000Z'), status: 'RECEIVED' },
    ])

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${DEAL_ID}/payments`,
    })

    const body = response.json()
    expect(body.data[0]?.isOverdue).toBe(false)
    await fastify.close()
  })
})

describe('POST /api/v1/deals/:dealId/payments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.deal.findUnique.mockResolvedValue(mockDealStub)
    mockPrisma.payment.create.mockResolvedValue(mockPayment)
  })

  it('creates payment and returns 201', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${DEAL_ID}/payments`,
      payload: { amount: 40000 },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.data.id).toBe(PAYMENT_ID)
    await fastify.close()
  })

  it('creates payment with dueDate and notes', async () => {
    mockPrisma.payment.create.mockResolvedValue({
      ...mockPayment,
      dueDate: new Date('2026-05-01T00:00:00.000Z'),
      notes: 'First instalment',
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${DEAL_ID}/payments`,
      payload: {
        amount: 40000,
        dueDate: '2026-05-01T00:00:00.000Z',
        notes: 'First instalment',
      },
    })

    expect(response.statusCode).toBe(201)
    await fastify.close()
  })

  it('returns 404 when deal does not exist', async () => {
    mockPrisma.deal.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/550e8400-e29b-41d4-a716-000000000000/payments`,
      payload: { amount: 40000 },
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 400 when amount is missing', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${DEAL_ID}/payments`,
      payload: {},
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when amount is negative', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${DEAL_ID}/payments`,
      payload: { amount: -1000 },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 400 when amount is zero', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/v1/deals/${DEAL_ID}/payments`,
      payload: { amount: 0 },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })
})

describe('PATCH /api/v1/payments/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates payment and returns 200', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(mockPayment)
    mockPrisma.payment.update.mockResolvedValue({
      ...mockPayment,
      status: 'RECEIVED',
      receivedAt: new Date('2026-04-10T00:00:00.000Z'),
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/payments/${PAYMENT_ID}`,
      payload: {
        status: 'RECEIVED',
        receivedAt: '2026-04-10T00:00:00.000Z',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data.status).toBe('RECEIVED')
    await fastify.close()
  })

  it('returns 404 when payment does not exist', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/payments/660e8400-e29b-41d4-a716-000000000000`,
      payload: { status: 'RECEIVED' },
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 400 for invalid amount (negative)', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(mockPayment)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/payments/${PAYMENT_ID}`,
      payload: { amount: -500 },
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('clears dueDate and receivedAt when set to null', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(mockPayment)
    mockPrisma.payment.update.mockResolvedValue({
      ...mockPayment,
      dueDate: null,
      receivedAt: null,
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/payments/${PAYMENT_ID}`,
      payload: { dueDate: null, receivedAt: null },
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('sets dueDate and receivedAt when provided as ISO strings', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(mockPayment)
    mockPrisma.payment.update.mockResolvedValue({
      ...mockPayment,
      dueDate: new Date('2026-05-01T00:00:00.000Z'),
      receivedAt: new Date('2026-05-05T00:00:00.000Z'),
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/payments/${PAYMENT_ID}`,
      payload: {
        dueDate: '2026-05-01T00:00:00.000Z',
        receivedAt: '2026-05-05T00:00:00.000Z',
      },
    })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })
})

describe('GET /api/v1/deals/:dealId/payments/:paymentId/invoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.payment.findUnique.mockResolvedValue(mockPaymentWithDeal)
  })

  it('returns 200 HTML with invoice content and no-store cache header', async () => {
    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${DEAL_ID}/payments/${PAYMENT_ID}/invoice`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.headers['cache-control']).toBe('no-store')
    expect(response.payload).toContain('Invoice')
    expect(response.payload).toContain('Acme Brand')
    expect(response.payload).toContain(PAYMENT_ID)
    expect(response.payload).toContain('INV-00000001')
    expect(mockPrisma.invoiceCounter.upsert).toHaveBeenCalled()
    await fastify.close()
  })

  it('reuses stored invoice number and does not bump counter', async () => {
    mockPrisma.invoiceCounter.upsert.mockClear()
    mockPrisma.payment.findUnique.mockResolvedValue({
      ...mockPaymentWithDeal,
      invoiceNumber: 'INV-00000042',
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${DEAL_ID}/payments/${PAYMENT_ID}/invoice`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.payload).toContain('INV-00000042')
    expect(mockPrisma.invoiceCounter.upsert).not.toHaveBeenCalled()
    await fastify.close()
  })

  it('returns 404 when payment does not exist', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${DEAL_ID}/payments/660e8400-e29b-41d4-a716-000000000000/invoice`,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('returns 404 when payment belongs to a different deal', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      ...mockPaymentWithDeal,
      dealId: '550e8400-e29b-41d4-a716-000000000099',
    })

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/v1/deals/${DEAL_ID}/payments/${PAYMENT_ID}/invoice`,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })
})

describe('DELETE /api/v1/payments/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes payment and returns 204', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(mockPayment)
    mockPrisma.payment.delete.mockResolvedValue(mockPayment)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/payments/${PAYMENT_ID}`,
    })

    expect(response.statusCode).toBe(204)
    await fastify.close()
  })

  it('returns 404 when payment does not exist', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(null)

    const fastify = await buildServer()
    const response = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/payments/660e8400-e29b-41d4-a716-000000000000`,
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })
})
