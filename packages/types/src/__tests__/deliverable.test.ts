import { describe, expect, it, vi } from 'vitest'
import {
  computeIsDeliverableOverdue,
  CreateDeliverableSchema,
  DeliverableSchema,
  UpdateDeliverableSchema,
} from '../deliverable.js'

const iso = '2024-06-01T00:00:00.000Z'

const baseDeliverable = {
  id: '550e8400-e29b-41d4-a716-446655440004',
  dealId: '550e8400-e29b-41d4-a716-446655440005',
  title: 'Post',
  platform: 'INSTAGRAM' as const,
  type: 'POST' as const,
  dueDate: null,
  status: 'PENDING' as const,
  completedAt: null,
  notes: null,
  isOverdue: false,
  approvalToken: null,
  brandApprovedAt: null,
  createdAt: iso,
  updatedAt: iso,
}

describe('DeliverableSchema', () => {
  it('parses deliverable', () => {
    expect(DeliverableSchema.parse(baseDeliverable).title).toBe('Post')
  })

  it('rejects empty title', () => {
    expect(() => DeliverableSchema.parse({ ...baseDeliverable, title: '' })).toThrow()
  })
})

describe('CreateDeliverableSchema', () => {
  it('parses required fields', () => {
    expect(
      CreateDeliverableSchema.parse({
        title: 'x',
        platform: 'YOUTUBE',
        type: 'VIDEO',
      }),
    ).toMatchObject({ platform: 'YOUTUBE', type: 'VIDEO' })
  })
})

describe('UpdateDeliverableSchema', () => {
  it('allows partial', () => {
    expect(UpdateDeliverableSchema.parse({ status: 'COMPLETED' })).toEqual({
      status: 'COMPLETED',
    })
  })
})

describe('computeIsDeliverableOverdue', () => {
  it('false when no due date', () => {
    expect(computeIsDeliverableOverdue(null, 'PENDING')).toBe(false)
  })

  it('false when completed', () => {
    const past = new Date('2020-01-01T00:00:00.000Z')
    expect(computeIsDeliverableOverdue(past, 'COMPLETED')).toBe(false)
  })

  it('true when pending and past due', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const past = new Date('2024-01-01T00:00:00.000Z')
    expect(computeIsDeliverableOverdue(past, 'PENDING')).toBe(true)
    vi.useRealTimers()
  })
})
