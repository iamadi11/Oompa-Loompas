import { describe, expect, it } from 'vitest'
import { isDealsNeedsAttentionFilter } from '../deals-page'

describe('isDealsNeedsAttentionFilter', () => {
  it('is true when needsAttention is the string true or 1', () => {
    expect(isDealsNeedsAttentionFilter({ needsAttention: 'true' })).toBe(true)
    expect(isDealsNeedsAttentionFilter({ needsAttention: '1' })).toBe(true)
  })

  it('is true when needsAttention is a single-element array', () => {
    expect(isDealsNeedsAttentionFilter({ needsAttention: ['true'] })).toBe(true)
    expect(isDealsNeedsAttentionFilter({ needsAttention: ['1'] })).toBe(true)
  })

  it('is false when absent, false, or other strings', () => {
    expect(isDealsNeedsAttentionFilter({})).toBe(false)
    expect(isDealsNeedsAttentionFilter({ needsAttention: undefined })).toBe(false)
    expect(isDealsNeedsAttentionFilter({ needsAttention: 'false' })).toBe(false)
    expect(isDealsNeedsAttentionFilter({ needsAttention: 'yes' })).toBe(false)
  })

  it('uses first value when needsAttention is an array', () => {
    expect(isDealsNeedsAttentionFilter({ needsAttention: ['true', 'false'] })).toBe(true)
    expect(isDealsNeedsAttentionFilter({ needsAttention: ['false', 'true'] })).toBe(false)
  })
})
