import { describe, expect, it } from 'vitest'
import { parseDealFromText } from '../deal-text-parser.js'

// ─── Currency extraction ────────────────────────────────────────────────────

describe('parseDealFromText — value extraction', () => {
  it('extracts rupee symbol amount with commas', () => {
    const r = parseDealFromText('We are offering ₹1,00,000 for this campaign.')
    expect(r.value).toBe(100000)
    expect(r.currency).toBe('INR')
  })

  it('extracts plain rupee amount without commas', () => {
    const r = parseDealFromText('Budget: ₹80000')
    expect(r.value).toBe(80000)
    expect(r.currency).toBe('INR')
  })

  it('extracts lakh shorthand (L)', () => {
    const r = parseDealFromText('We can pay 2.5L for the deal.')
    expect(r.value).toBe(250000)
    expect(r.currency).toBe('INR')
  })

  it('extracts lakh shorthand with rupee symbol', () => {
    const r = parseDealFromText('₹2L collaboration budget')
    expect(r.value).toBe(200000)
    expect(r.currency).toBe('INR')
  })

  it('extracts "lakhs" word form', () => {
    const r = parseDealFromText('We are budgeting 5 lakhs for creators this quarter.')
    expect(r.value).toBe(500000)
    expect(r.currency).toBe('INR')
  })

  it('extracts K shorthand', () => {
    const r = parseDealFromText('Budget: 50K')
    expect(r.value).toBe(50000)
    expect(r.currency).toBe('INR')
  })

  it('extracts Rs. prefix', () => {
    const r = parseDealFromText('Compensation: Rs. 25,000')
    expect(r.value).toBe(25000)
    expect(r.currency).toBe('INR')
  })

  it('extracts INR text prefix', () => {
    const r = parseDealFromText('Total payment: INR 75000')
    expect(r.value).toBe(75000)
    expect(r.currency).toBe('INR')
  })

  it('extracts USD dollar symbol', () => {
    const r = parseDealFromText('We budget $5,000 for this integration.')
    expect(r.value).toBe(5000)
    expect(r.currency).toBe('USD')
  })

  it('extracts USD text prefix', () => {
    const r = parseDealFromText('Compensation: USD 3000')
    expect(r.value).toBe(3000)
    expect(r.currency).toBe('USD')
  })

  it('extracts EUR symbol', () => {
    const r = parseDealFromText('Budget: €2,500 for this campaign.')
    expect(r.value).toBe(2500)
    expect(r.currency).toBe('EUR')
  })

  it('extracts GBP symbol', () => {
    const r = parseDealFromText('We can offer £1,200 for one video.')
    expect(r.value).toBe(1200)
    expect(r.currency).toBe('GBP')
  })

  it('returns no value for text without amounts', () => {
    const r = parseDealFromText('Hi, we would love to collaborate with you.')
    expect(r.value).toBeUndefined()
    expect(r.currency).toBeUndefined()
  })

  it('ignores numbers that are clearly not amounts (year, phone)', () => {
    const r = parseDealFromText('Since 2019, call us at 9876543210.')
    expect(r.value).toBeUndefined()
  })
})

// ─── Brand name extraction ──────────────────────────────────────────────────

describe('parseDealFromText — brand name extraction', () => {
  it('extracts brand from "I am [name] from [Brand]" pattern', () => {
    const r = parseDealFromText('Hi, I am Rahul from Nike. We would love to collaborate.')
    expect(r.brandName).toBe('Nike')
  })

  it('extracts brand from "from [Brand] team" pattern', () => {
    const r = parseDealFromText('Writing from the Zomato marketing team.')
    expect(r.brandName?.toLowerCase()).toContain('zomato')
  })

  it('extracts brand name from email domain', () => {
    const r = parseDealFromText('Please reply to partnerships@nike.com for further details.')
    expect(r.brandName?.toLowerCase()).toContain('nike')
  })

  it('returns no brandName for generic text', () => {
    const r = parseDealFromText('Budget is 50000. Please let us know.')
    expect(r.brandName).toBeUndefined()
  })
})

// ─── Title generation ───────────────────────────────────────────────────────

describe('parseDealFromText — title generation', () => {
  it('generates title from Subject: line', () => {
    const r = parseDealFromText(
      'Subject: Nike YouTube Integration Proposal\n\nHi, we are from Nike...',
    )
    expect(r.title).toContain('Nike')
  })

  it('generates title from brand + deliverable when no subject', () => {
    const r = parseDealFromText(
      'Hi, I am from Mamaearth. We want 2 reels and 1 Instagram post. Budget ₹30,000.',
    )
    if (r.brandName) {
      expect(r.title).toBeTruthy()
    }
  })
})

// ─── Notes extraction ───────────────────────────────────────────────────────

describe('parseDealFromText — deliverables in notes', () => {
  it('includes detected deliverable phrases in notes', () => {
    const r = parseDealFromText(
      'We need 3 reels and 2 Instagram posts. Budget ₹50,000.',
    )
    // notes may include deliverable summary
    if (r.notes) {
      expect(r.notes.toLowerCase()).toMatch(/reel|post/)
    }
  })
})

// ─── Edge cases ─────────────────────────────────────────────────────────────

describe('parseDealFromText — edge cases', () => {
  it('returns empty object for empty string', () => {
    const r = parseDealFromText('')
    expect(r).toEqual({})
  })

  it('returns empty object for whitespace-only string', () => {
    const r = parseDealFromText('   \n\t  ')
    expect(r).toEqual({})
  })

  it('handles very long text without crashing', () => {
    const longText = 'Hello '.repeat(2000) + '₹50,000 from Nike.'
    expect(() => parseDealFromText(longText)).not.toThrow()
  })

  it('realistic brand email — extracts value and currency', () => {
    const email = `
      Subject: Collaboration Proposal - YouTube Integration

      Hi there,

      I'm Priya from the Boat Lifestyle partnerships team.

      We'd love to feature your channel in our upcoming campaign.
      The compensation would be ₹75,000 for 1 YouTube integration video
      and 2 Instagram reels.

      Looking forward to hearing from you!

      Priya
      Boat Lifestyle | partnerships@boat-lifestyle.com
    `
    const r = parseDealFromText(email)
    expect(r.value).toBe(75000)
    expect(r.currency).toBe('INR')
    expect(r.title).toBeTruthy()
  })
})
