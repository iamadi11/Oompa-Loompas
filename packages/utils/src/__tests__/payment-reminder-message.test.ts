import { describe, it, expect } from 'vitest'
import { buildPaymentReminderMessage } from '../payment-reminder-message.js'

describe('buildPaymentReminderMessage', () => {
  it('includes greeting, work label, amount, due date, and invoice URL', () => {
    const text = buildPaymentReminderMessage({
      dealTitle: 'Summer drop',
      brandName: 'Acme Co',
      amount: 50_000,
      currency: 'INR',
      dueDateIso: '2026-04-01T00:00:00.000Z',
      invoiceUrl: 'https://app.example.com/api/v1/deals/d1/payments/p1/invoice',
    })
    expect(text).toContain('Hi Acme Co,')
    expect(text).toContain('Following up on "Summer drop"')
    expect(text).toMatch(/50[,\u202f]000/)
    expect(text).toContain('This was due on')
    expect(text).toContain('Invoice:\nhttps://app.example.com/api/v1/deals/d1/payments/p1/invoice')
    expect(text.endsWith('Thank you.')).toBe(true)
  })

  it('omits due sentence when dueDateIso is null', () => {
    const text = buildPaymentReminderMessage({
      dealTitle: 'Project',
      brandName: 'Beta',
      amount: 100,
      currency: 'USD',
      dueDateIso: null,
      invoiceUrl: null,
    })
    expect(text).not.toContain('This was due on')
    expect(text).toContain('$100')
    expect(text).not.toContain('Invoice:')
  })

  it('omits invoice block when invoiceUrl is missing or blank', () => {
    const without = buildPaymentReminderMessage({
      dealTitle: 'X',
      brandName: 'Y',
      amount: 1,
      currency: 'INR',
      dueDateIso: null,
    })
    expect(without).not.toContain('Invoice:')

    const blank = buildPaymentReminderMessage({
      dealTitle: 'X',
      brandName: 'Y',
      amount: 1,
      currency: 'INR',
      dueDateIso: null,
      invoiceUrl: '   ',
    })
    expect(blank).not.toContain('Invoice:')
  })

  it('uses generic greeting and work label when brand or title are whitespace', () => {
    const text = buildPaymentReminderMessage({
      dealTitle: '   ',
      brandName: '',
      amount: 10,
      currency: 'GBP',
      dueDateIso: null,
    })
    expect(text).toContain('Hi,')
    expect(text).toContain('our engagement')
  })
})
