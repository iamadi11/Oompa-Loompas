import { describe, expect, it } from 'vitest'
import { getDealListEmptyContent } from '@/lib/deal-list-empty'

describe('getDealListEmptyContent', () => {
  it('returns onboarding copy for all deals with empty list', () => {
    const c = getDealListEmptyContent('all')
    expect(c.title).toBe('No deals yet')
    expect(c.primaryHref).toBe('/deals/new')
    expect(c.primaryLabel).toBe('Add your first deal')
    expect(c.secondaryHref).toBe('/dashboard')
  })

  it('returns caught-up copy when needs-attention filter has no matches', () => {
    const c = getDealListEmptyContent('needsAttention')
    expect(c.title).toBe('Nothing needs you right now')
    expect(c.primaryHref).toBe('/deals')
    expect(c.primaryLabel).toBe('View all deals')
    expect(c.description.toLowerCase()).toContain('overdue')
  })
})
