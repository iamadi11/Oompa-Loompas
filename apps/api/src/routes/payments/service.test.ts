import { describe, expect, it } from 'vitest'
import { Prisma } from '@oompa/db'
import { serializePayment, toCreatePaymentData, toUpdatePaymentData } from './service.js'

describe('payments service helpers', () => {
  it('serializes payment and computes overdue flag', () => {
    const out = serializePayment({
      id: 'p1',
      dealId: 'd1',
      amount: new Prisma.Decimal(500),
      currency: 'INR',
      status: 'PENDING',
      dueDate: new Date('2000-01-01T00:00:00.000Z'),
      receivedAt: null,
      remindAt: null,
      notes: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    })
    expect(out.amount).toBe(500)
    expect(out.isOverdue).toBe(true)
  })

  it('maps create payload defaults', () => {
    const out = toCreatePaymentData('d1', {
      amount: 250,
      currency: undefined,
      status: undefined,
      dueDate: undefined,
      notes: undefined,
    })
    expect(out).toEqual(
      expect.objectContaining({
        currency: 'INR',
        status: 'PENDING',
        deal: { connect: { id: 'd1' } },
      }),
    )
  })

  it('maps update payload branches', () => {
    const out = toUpdatePaymentData({
      amount: 10,
      dueDate: null,
      receivedAt: '2024-03-01T00:00:00.000Z',
      notes: null,
    })
    expect(out).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        amount: expect.any(Prisma.Decimal),
        dueDate: null,
        receivedAt: new Date('2024-03-01T00:00:00.000Z'),
        notes: null,
      }),
    )
  })
})
