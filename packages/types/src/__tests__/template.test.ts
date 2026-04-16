import { describe, expect, it } from 'vitest'
import {
  CreateDealTemplateSchema,
  UpdateDealTemplateSchema,
  DealTemplateSchema,
  SaveAsTemplateSchema,
  TemplateDeliverableSchema,
  TemplatePaymentSchema,
  DEAL_TEMPLATE_MAX_PER_USER,
} from '../template.js'

const iso = '2026-04-16T00:00:00.000Z'

const baseDeliverable = {
  id: '550e8400-e29b-41d4-a716-000000000001',
  templateId: '550e8400-e29b-41d4-a716-000000000002',
  title: 'YouTube Integration Video',
  platform: 'YOUTUBE' as const,
  type: 'INTEGRATION' as const,
  notes: null,
  sortOrder: 0,
}

const basePayment = {
  id: '550e8400-e29b-41d4-a716-000000000003',
  templateId: '550e8400-e29b-41d4-a716-000000000002',
  label: 'Advance',
  percentage: 50,
  notes: null,
  sortOrder: 0,
}

const baseTemplate = {
  id: '550e8400-e29b-41d4-a716-000000000002',
  name: 'YouTube Integration Standard',
  defaultValue: 50000,
  currency: 'INR' as const,
  notes: null,
  deliverables: [baseDeliverable],
  payments: [basePayment],
  createdAt: iso,
  updatedAt: iso,
}

describe('TemplateDeliverableSchema', () => {
  it('parses valid deliverable', () => {
    expect(TemplateDeliverableSchema.parse(baseDeliverable).title).toBe(
      'YouTube Integration Video',
    )
  })

  it('rejects empty title', () => {
    expect(() => TemplateDeliverableSchema.parse({ ...baseDeliverable, title: '' })).toThrow()
  })

  it('rejects invalid platform', () => {
    expect(() =>
      TemplateDeliverableSchema.parse({ ...baseDeliverable, platform: 'TIKTOK' }),
    ).toThrow()
  })

  it('rejects invalid type', () => {
    expect(() =>
      TemplateDeliverableSchema.parse({ ...baseDeliverable, type: 'PODCAST_SPONSOR' }),
    ).toThrow()
  })
})

describe('TemplatePaymentSchema', () => {
  it('parses valid payment', () => {
    expect(TemplatePaymentSchema.parse(basePayment).percentage).toBe(50)
  })

  it('rejects empty label', () => {
    expect(() => TemplatePaymentSchema.parse({ ...basePayment, label: '' })).toThrow()
  })

  it('rejects zero percentage', () => {
    expect(() => TemplatePaymentSchema.parse({ ...basePayment, percentage: 0 })).toThrow()
  })

  it('rejects percentage over 100', () => {
    expect(() => TemplatePaymentSchema.parse({ ...basePayment, percentage: 101 })).toThrow()
  })
})

describe('DealTemplateSchema', () => {
  it('parses a full template', () => {
    const result = DealTemplateSchema.parse(baseTemplate)
    expect(result.name).toBe('YouTube Integration Standard')
    expect(result.deliverables).toHaveLength(1)
    expect(result.payments).toHaveLength(1)
  })

  it('allows null defaultValue', () => {
    const result = DealTemplateSchema.parse({ ...baseTemplate, defaultValue: null })
    expect(result.defaultValue).toBeNull()
  })

  it('rejects empty name', () => {
    expect(() => DealTemplateSchema.parse({ ...baseTemplate, name: '' })).toThrow()
  })
})

describe('CreateDealTemplateSchema', () => {
  it('parses minimal valid payload (name only)', () => {
    const result = CreateDealTemplateSchema.parse({ name: 'Minimal Template' })
    expect(result.name).toBe('Minimal Template')
    expect(result.deliverables).toEqual([])
    expect(result.payments).toEqual([])
  })

  it('parses with deliverables and payments', () => {
    const result = CreateDealTemplateSchema.parse({
      name: 'Full Template',
      defaultValue: 50000,
      currency: 'USD',
      deliverables: [{ title: 'Reel', platform: 'INSTAGRAM', type: 'REEL' }],
      payments: [
        { label: 'Advance', percentage: 50 },
        { label: 'On delivery', percentage: 50 },
      ],
    })
    expect(result.deliverables).toHaveLength(1)
    expect(result.payments).toHaveLength(2)
  })

  it('rejects deliverables exceeding 10', () => {
    expect(() =>
      CreateDealTemplateSchema.parse({
        name: 'Too many',
        deliverables: Array.from({ length: 11 }, (_, i) => ({
          title: `D${i}`,
          platform: 'YOUTUBE',
          type: 'VIDEO',
        })),
      }),
    ).toThrow()
  })

  it('rejects payments exceeding 10', () => {
    expect(() =>
      CreateDealTemplateSchema.parse({
        name: 'Too many payments',
        payments: Array.from({ length: 11 }, (_, i) => ({
          label: `P${i}`,
          percentage: 9,
        })),
      }),
    ).toThrow()
  })

  it('rejects payment with zero percentage', () => {
    expect(() =>
      CreateDealTemplateSchema.parse({
        name: 'Bad payment',
        payments: [{ label: 'Bad', percentage: 0 }],
      }),
    ).toThrow()
  })

  it('rejects empty template name', () => {
    expect(() => CreateDealTemplateSchema.parse({ name: '' })).toThrow()
  })
})

describe('UpdateDealTemplateSchema', () => {
  it('requires name (same as create)', () => {
    expect(() => UpdateDealTemplateSchema.parse({ deliverables: [], payments: [] })).toThrow()
  })

  it('accepts valid update', () => {
    const result = UpdateDealTemplateSchema.parse({
      name: 'Updated Name',
      deliverables: [],
      payments: [{ label: 'Full', percentage: 100 }],
    })
    expect(result.name).toBe('Updated Name')
    expect(result.payments[0].percentage).toBe(100)
  })
})

describe('SaveAsTemplateSchema', () => {
  it('parses name', () => {
    expect(SaveAsTemplateSchema.parse({ name: 'My Template' }).name).toBe('My Template')
  })

  it('rejects empty name', () => {
    expect(() => SaveAsTemplateSchema.parse({ name: '' })).toThrow()
  })

  it('rejects missing name', () => {
    expect(() => SaveAsTemplateSchema.parse({})).toThrow()
  })
})

describe('DEAL_TEMPLATE_MAX_PER_USER', () => {
  it('is 20', () => {
    expect(DEAL_TEMPLATE_MAX_PER_USER).toBe(20)
  })
})
