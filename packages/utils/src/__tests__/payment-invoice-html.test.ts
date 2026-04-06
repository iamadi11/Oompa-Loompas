import { describe, it, expect } from 'vitest'
import { buildPaymentInvoiceHtml } from '../payment-invoice-html.js'

describe('buildPaymentInvoiceHtml', () => {
  const base = {
    generatedAtIso: '2026-04-06T12:00:00.000Z',
    invoiceDateIso: '2026-04-06T12:00:00.000Z',
    invoiceNumber: 'INV-00000001',
    documentLabel: 'Invoice',
    issuer: null,
    placeOfSupply: null,
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
    expect(html).toContain('<strong>&lt;script&gt;</strong>')
    expect(html).toContain('A &amp; B')
  })

  it('includes formatted amount, invoice number, and internal reference', () => {
    const html = buildPaymentInvoiceHtml(base)
    expect(html).toContain('INV-00000001')
    expect(html).toContain(base.payment.id)
    expect(html).toMatch(/40|000|₹/)
  })

  it('uses a main landmark, line items table, and human-readable status', () => {
    const html = buildPaymentInvoiceHtml(base)
    expect(html).toContain('<main id="invoice-content">')
    expect(html).toContain('Description of supply')
    expect(html).toContain('aria-label="Totals"')
    expect(html).toContain('>Pending</td>')
    expect(html).not.toContain('>PENDING</td>')
  })

  it('omits due row when dueDateIso is null', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      payment: { ...base.payment, dueDateIso: null },
    })
    expect(html).not.toContain('>Due date</th>')
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

  it('renders issuer block when issuer is provided', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      issuer: {
        legalName: 'Creator LLC',
        addressLines: ['1 Main St', 'London'],
        taxIdLines: ['VAT: GB123'],
        email: 'billing@example.com',
      },
    })
    expect(html).toContain('Creator LLC')
    expect(html).toContain('1 Main St')
    expect(html).toContain('VAT: GB123')
    expect(html).toContain('billing@example.com')
  })

  it('renders issuer with legal name only when address, tax lines, and email are empty', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      issuer: {
        legalName: 'Solo Creator',
        addressLines: [],
        taxIdLines: [],
        email: null,
      },
    })
    expect(html).toContain('Solo Creator')
    expect(html).not.toMatch(/<p class="party-address"/)
    expect(html).not.toMatch(/<ul class="tax-ids"/)
    expect(html).not.toMatch(/<p class="party-email"/)
  })

  it('includes share and download controls', () => {
    const html = buildPaymentInvoiceHtml(base)
    expect(html).toContain('id="inv-print"')
    expect(html).toContain('id="inv-copy"')
    expect(html).toContain('id="inv-share"')
    expect(html).toContain('id="inv-download"')
  })

  it('includes place of supply when set', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      placeOfSupply: 'Maharashtra, India',
    })
    expect(html).toContain('Maharashtra, India')
  })

  it('uses default line description when deal title is blank', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      deal: { ...base.deal, title: '   ' },
    })
    expect(html).toContain('Creator services (per deal)')
  })

  it('shows invalid date label when invoice date ISO is not parseable', () => {
    const html = buildPaymentInvoiceHtml({
      ...base,
      invoiceDateIso: 'not-a-date',
    })
    expect(html).toContain('Invalid date')
  })
})
