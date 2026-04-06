import { describe, it, expect } from 'vitest'
import { buildPaymentInvoiceHtml } from '../payment-invoice-html.js'

describe('buildPaymentInvoiceHtml', () => {
  const base = {
    generatedAtIso: '2026-04-06T12:00:00.000Z',
    deal: {
      title: 'Sponsored reel series',
      brandName: 'Acme Co',
      currency: 'INR' as const,
      notes: null,
    },
    payment: {
      id: '660e8400-e29b-41d4-a716-446655440001',
      amount: 40_000,
      currency: 'INR' as const,
      status: 'PENDING',
      dueDateIso: '2026-05-01T00:00:00.000Z',
      receivedAtIso: null,
      notes: null,
    },
  }

  it('includes escaped deal and brand fields', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      deal: { ...base.deal, brandName: '<script>', title: 'A & B' },
    })
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('A &amp; B')
    expect(html).not.toContain('<script>')
  })

  it('includes formatted amount and payment id reference', () => {
    const html = buildPaymentInvoiceHtml(base)
    expect(html).toContain(base.payment.id)
    expect(html).toMatch(/40|000|₹/)
  })

  it('uses a main landmark and human-readable status', () => {
    const html = buildPaymentInvoiceHtml(base)
    expect(html).toContain('<main id="invoice-content">')
    expect(html).toContain('aria-label="Payment milestone details"')
    expect(html).toContain('>Pending</td>')
    expect(html).not.toContain('>PENDING</td>')
  })

  it('omits due row when dueDateIso is null', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      payment: { ...base.payment, dueDateIso: null },
    })
    expect(html).not.toContain('>Due</th>')
  })

  it('renders payment and deal notes when present', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      deal: { ...base.deal, notes: 'Net 30' },
      payment: { ...base.payment, notes: 'Milestone 1' },
    })
    expect(html).toContain('Net 30')
    expect(html).toContain('Milestone 1')
  })

  it('maps unknown payment currency to INR for amount formatting', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      payment: { ...base.payment, currency: 'XXX', amount: 100 },
    })
    expect(html).toContain('₹')
    expect(html).toContain('100')
  })
})
