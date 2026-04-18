import { describe, expect, it, vi } from 'vitest'
import {
  computeIsOverdue,
  computePaymentSummary,
  CreatePaymentSchema,
  PaymentSchema,
  PaymentStatusSchema,
  UpdatePaymentSchema,
} from '../payment.js'

const iso = '2024-06-01T00:00:00.000Z'

const basePayment = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  dealId: '550e8400-e29b-41d4-a716-446655440003',
  amount: 50,
  currency: 'USD' as const,
  status: 'PENDING' as const,
  dueDate: null,
  receivedAt: null,
  remindAt: null,
  notes: null,
  isOverdue: false,
  createdAt: iso,
  updatedAt: iso,
}

describe('PaymentSchema', () => {
  it('parses payment', () => {
    expect(PaymentSchema.parse(basePayment).amount).toBe(50)
  })

  it('rejects non-positive amount', () => {
    expect(() => PaymentSchema.parse({ ...basePayment, amount: 0 })).toThrow()
  })
})

describe('CreatePaymentSchema', () => {
  it('requires amount', () => {
    const r = CreatePaymentSchema.safeParse({})
    expect(r.success).toBe(false)
  })

  it('parses amount only', () => {
    expect(CreatePaymentSchema.parse({ amount: 10 })).toMatchObject({
      amount: 10,
    })
  })
})

describe('UpdatePaymentSchema', () => {
  it('allows empty object', () => {
    expect(UpdatePaymentSchema.parse({})).toEqual({})
  })
})

describe('PaymentStatusSchema', () => {
  it('accepts OVERDUE', () => {
    expect(PaymentStatusSchema.parse('OVERDUE')).toBe('OVERDUE')
  })
})

describe('computeIsOverdue', () => {
  it('returns false when no due date', () => {
    expect(computeIsOverdue(null, 'PENDING')).toBe(false)
  })

  it('returns false for RECEIVED even if due in past', () => {
    const past = new Date('2020-01-01T00:00:00.000Z')
    expect(computeIsOverdue(past, 'RECEIVED')).toBe(false)
  })

  it('returns true when pending and due in past', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const past = new Date('2024-01-01T00:00:00.000Z')
    expect(computeIsOverdue(past, 'PENDING')).toBe(true)
    vi.useRealTimers()
  })
})

describe('computePaymentSummary', () => {
  it('sums RECEIVED and PARTIAL toward totalReceived', () => {
    const s = computePaymentSummary(100, [
      { amount: 40, status: 'RECEIVED', dueDate: null },
      { amount: 10, status: 'PARTIAL', dueDate: null },
      { amount: 50, status: 'PENDING', dueDate: null },
    ])
    expect(s.totalReceived).toBe(50)
    expect(s.totalOutstanding).toBe(50)
    expect(s.paymentCount).toBe(3)
  })

  it('sets hasOverdue when any payment is overdue', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const s = computePaymentSummary(100, [
      {
        amount: 100,
        status: 'PENDING',
        dueDate: new Date('2024-01-01T00:00:00.000Z'),
      },
    ])
    expect(s.hasOverdue).toBe(true)
    vi.useRealTimers()
  })
})
