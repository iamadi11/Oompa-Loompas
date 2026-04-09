import { describe, expect, it } from 'vitest'
import { Prisma } from '@oompa/db'
import { buildDealWhere, serializeDeal, toCreateDealData, toUpdateDealData } from './service.js'

describe('deals service helpers', () => {
  it('serializes decimal and date fields', () => {
    const out = serializeDeal({
      id: '1',
      title: 'Deal',
      brandName: 'Brand',
      value: new Prisma.Decimal(1200),
      currency: 'USD',
      status: 'ACTIVE',
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: null,
      notes: null,
      shareToken: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    })
    expect(out.value).toBe(1200)
    expect(out.startDate).toBe('2024-01-01T00:00:00.000Z')
  })

  it('builds base where clause when no filters', () => {
    expect(
      buildDealWhere('u1', {
        status: undefined,
        brandName: undefined,
        needsAttention: undefined,
      }),
    ).toEqual({ userId: 'u1' })
  })

  it('adds status, brand, and attention filters', () => {
    const where = buildDealWhere('u1', {
      status: 'ACTIVE',
      brandName: 'acme',
      needsAttention: 'true',
    })
    expect(where).toEqual(
      expect.objectContaining({
        userId: 'u1',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        AND: expect.any(Array),
      }),
    )
  })

  it('maps create payload with defaults', () => {
    expect(
      toCreateDealData('u1', {
        title: 'T',
        brandName: 'B',
        value: 100,
        currency: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        notes: undefined,
      }),
    ).toEqual(
      expect.objectContaining({
        userId: 'u1',
        currency: 'INR',
        status: 'DRAFT',
      }),
    )
  })

  it('maps update payload with nullable date reset', () => {
    const out = toUpdateDealData({
      endDate: null,
      notes: 'ok',
    })
    expect(out).toEqual(
      expect.objectContaining({
        endDate: null,
        notes: 'ok',
      }),
    )
  })
})
