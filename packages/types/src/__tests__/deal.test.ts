import { describe, expect, it } from 'vitest'
import {
  CreateDealSchema,
  DealBrandSummarySchema,
  DealListFiltersSchema,
  DealSchema,
  DealStatusSchema,
  isValidStatusTransition,
  UpdateDealSchema,
  computeDealNextAction,
} from '../deal.js'

const iso = '2024-01-15T12:00:00.000Z'
const dealId = '550e8400-e29b-41d4-a716-446655440001'

const fullDeal = {
  id: dealId,
  title: 'T',
  brandName: 'B',
  value: 100,
  currency: 'INR' as const,
  status: 'DRAFT' as const,
  startDate: null,
  endDate: null,
  notes: null,
  createdAt: iso,
  updatedAt: iso,
}

describe('DealBrandSummarySchema', () => {
  it('parses valid brand summary with contracted totals', () => {
    expect(
      DealBrandSummarySchema.parse({
        brandName: 'Acme',
        dealCount: 3,
        contractedTotals: [
          { currency: 'INR', amount: 10000 },
          { currency: 'USD', amount: 200 },
        ],
      }),
    ).toEqual({
      brandName: 'Acme',
      dealCount: 3,
      contractedTotals: [
        { currency: 'INR', amount: 10000 },
        { currency: 'USD', amount: 200 },
      ],
    })
  })

  it('rejects negative dealCount', () => {
    expect(() =>
      DealBrandSummarySchema.parse({
        brandName: 'X',
        dealCount: -1,
        contractedTotals: [],
      }),
    ).toThrow()
  })

  it('rejects invalid currency in contractedTotals', () => {
    expect(() =>
      DealBrandSummarySchema.parse({
        brandName: 'X',
        dealCount: 1,
        contractedTotals: [{ currency: 'XYZ', amount: 1 }],
      }),
    ).toThrow()
  })
})

describe('DealSchema', () => {
  it('parses a complete deal', () => {
    expect(DealSchema.parse(fullDeal)).toMatchObject({ title: 'T', value: 100 })
  })

  it('applies default currency and status', () => {
    const { currency, status, ...rest } = fullDeal
    const parsed = DealSchema.parse({
      ...rest,
      currency: undefined,
      status: undefined,
    } as unknown as typeof fullDeal)
    expect(parsed.currency).toBe('INR')
    expect(parsed.status).toBe('DRAFT')
  })

  it('rejects non-positive value', () => {
    expect(() => DealSchema.parse({ ...fullDeal, value: 0 })).toThrow()
  })
})

describe('CreateDealSchema', () => {
  it('parses minimal create payload', () => {
    expect(
      CreateDealSchema.parse({
        title: 'x',
        brandName: 'y',
        value: 1,
      }),
    ).toMatchObject({ title: 'x', brandName: 'y', value: 1, currency: 'INR' })
  })

  it('requires positive value with message', () => {
    const r = CreateDealSchema.safeParse({
      title: 'x',
      brandName: 'y',
      value: -1,
    })
    expect(r.success).toBe(false)
  })
})

describe('UpdateDealSchema', () => {
  it('allows partial updates', () => {
    expect(UpdateDealSchema.parse({ title: 'only' })).toEqual({ title: 'only' })
    expect(UpdateDealSchema.parse({})).toEqual({})
  })
})

describe('DealListFiltersSchema', () => {
  it('coerces page and limit from strings', () => {
    expect(
      DealListFiltersSchema.parse({
        page: '2',
        limit: '10',
      }),
    ).toEqual(
      expect.objectContaining({
        page: 2,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    )
  })

  it('accepts needsAttention flag', () => {
    expect(DealListFiltersSchema.parse({ needsAttention: 'true' })).toMatchObject({
      needsAttention: 'true',
    })
  })
})

describe('DealStatusSchema', () => {
  it('rejects unknown status', () => {
    expect(() => DealStatusSchema.parse('UNKNOWN')).toThrow()
  })
})

describe('isValidStatusTransition', () => {
  it('allows DRAFT to NEGOTIATING', () => {
    expect(isValidStatusTransition('DRAFT', 'NEGOTIATING')).toBe(true)
  })

  it('disallows DRAFT to PAID', () => {
    expect(isValidStatusTransition('DRAFT', 'PAID')).toBe(false)
  })

  it('PAID has no outbound transitions', () => {
    expect(isValidStatusTransition('PAID', 'ACTIVE')).toBe(false)
  })
})

describe('computeDealNextAction', () => {
  // DRAFT: always suggest NEGOTIATING
  it('suggests NEGOTIATING for a DRAFT deal', () => {
    const action = computeDealNextAction('DRAFT', [], [])
    expect(action).not.toBeNull()
    expect(action?.targetStatus).toBe('NEGOTIATING')
  })

  // NEGOTIATING: always suggest ACTIVE
  it('suggests ACTIVE for a NEGOTIATING deal', () => {
    const action = computeDealNextAction('NEGOTIATING', [], [])
    expect(action).not.toBeNull()
    expect(action?.targetStatus).toBe('ACTIVE')
  })

  // ACTIVE → DELIVERED conditions
  it('suggests DELIVERED when ACTIVE with no deliverables', () => {
    const action = computeDealNextAction('ACTIVE', [], [])
    expect(action?.targetStatus).toBe('DELIVERED')
  })

  it('suggests DELIVERED when ACTIVE and all deliverables COMPLETED', () => {
    const action = computeDealNextAction(
      'ACTIVE',
      [],
      [{ status: 'COMPLETED' }, { status: 'COMPLETED' }],
    )
    expect(action?.targetStatus).toBe('DELIVERED')
  })

  it('suggests DELIVERED when ACTIVE and all deliverables COMPLETED or CANCELLED', () => {
    const action = computeDealNextAction(
      'ACTIVE',
      [],
      [{ status: 'COMPLETED' }, { status: 'CANCELLED' }],
    )
    expect(action?.targetStatus).toBe('DELIVERED')
  })

  it('suggests DELIVERED when ACTIVE and all deliverables CANCELLED', () => {
    const action = computeDealNextAction('ACTIVE', [], [{ status: 'CANCELLED' }])
    expect(action?.targetStatus).toBe('DELIVERED')
  })

  it('returns null when ACTIVE and some deliverables are PENDING', () => {
    const action = computeDealNextAction(
      'ACTIVE',
      [],
      [{ status: 'COMPLETED' }, { status: 'PENDING' }],
    )
    expect(action).toBeNull()
  })

  it('returns null when ACTIVE and a deliverable is PENDING (single)', () => {
    const action = computeDealNextAction('ACTIVE', [], [{ status: 'PENDING' }])
    expect(action).toBeNull()
  })

  // DELIVERED → PAID conditions
  it('suggests PAID when DELIVERED with no payments', () => {
    const action = computeDealNextAction('DELIVERED', [], [])
    expect(action?.targetStatus).toBe('PAID')
  })

  it('suggests PAID when DELIVERED and all payments RECEIVED', () => {
    const action = computeDealNextAction(
      'DELIVERED',
      [{ status: 'RECEIVED' }, { status: 'RECEIVED' }],
      [],
    )
    expect(action?.targetStatus).toBe('PAID')
  })

  it('suggests PAID when DELIVERED and payments are RECEIVED or REFUNDED', () => {
    const action = computeDealNextAction(
      'DELIVERED',
      [{ status: 'RECEIVED' }, { status: 'REFUNDED' }],
      [],
    )
    expect(action?.targetStatus).toBe('PAID')
  })

  it('suggests PAID when DELIVERED and all payments REFUNDED', () => {
    const action = computeDealNextAction('DELIVERED', [{ status: 'REFUNDED' }], [])
    expect(action?.targetStatus).toBe('PAID')
  })

  it('returns null when DELIVERED and a payment is PENDING', () => {
    const action = computeDealNextAction(
      'DELIVERED',
      [{ status: 'RECEIVED' }, { status: 'PENDING' }],
      [],
    )
    expect(action).toBeNull()
  })

  it('returns null when DELIVERED and a payment is PARTIAL', () => {
    const action = computeDealNextAction('DELIVERED', [{ status: 'PARTIAL' }], [])
    expect(action).toBeNull()
  })

  it('returns null when DELIVERED and a payment is OVERDUE', () => {
    const action = computeDealNextAction('DELIVERED', [{ status: 'OVERDUE' }], [])
    expect(action).toBeNull()
  })

  // Terminal states
  it('returns null for PAID deals', () => {
    expect(computeDealNextAction('PAID', [], [])).toBeNull()
  })

  it('returns null for CANCELLED deals', () => {
    expect(computeDealNextAction('CANCELLED', [], [])).toBeNull()
  })

  // Shape validation
  it('returns action with label and description strings', () => {
    const action = computeDealNextAction('DRAFT', [], [])
    expect(typeof action?.label).toBe('string')
    expect(action!.label.length).toBeGreaterThan(0)
    expect(typeof action?.description).toBe('string')
    expect(action!.description.length).toBeGreaterThan(0)
  })
})
