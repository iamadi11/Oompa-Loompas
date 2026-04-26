import { describe, it, expect } from 'vitest'
import { renderPaymentInvoiceDocument, type PaymentInvoiceTemplateInput } from '../payment-invoice-template.js'

function makeInput(overrides: Partial<PaymentInvoiceTemplateInput> = {}): PaymentInvoiceTemplateInput {
  return {
    docLabel: 'Invoice',
    invNo: 'INV-00000001',
    invDateLabel: '1 Jan 2026',
    internalRef: 'pay-abc-123',
    placeBlock: '',
    issuerBlockHtml: '<section>Issuer</section>',
    customerBlockHtml: '<section>Customer</section>',
    dealTitle: 'Brand Campaign',
    lineDesc: 'Sponsored content',
    unitPriceLabel: '₹40,000.00',
    amountLabel: '₹40,000.00',
    payCurrency: 'INR',
    statusLabel: 'Pending',
    dueDateRow: '',
    receivedDateRow: '',
    paymentNotesBlock: '',
    dealNotesBlock: '',
    generatedLabel: '1 Jan 2026, 12:00',
    shareTitleEsc: 'Invoice INV-00000001',
    downloadBase: 'INV-00000001',
    ...overrides,
  }
}

describe('renderPaymentInvoiceDocument', () => {
  it('returns a valid HTML document', () => {
    const html = renderPaymentInvoiceDocument(makeInput())
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('</html>')
  })

  it('embeds invoice number in title and data attribute', () => {
    const html = renderPaymentInvoiceDocument(makeInput({ invNo: 'INV-00000042' }))
    expect(html).toContain('INV-00000042')
    expect(html).toContain('data-invoice-number="INV-00000042"')
  })

  it('embeds docLabel in the title tag', () => {
    const html = renderPaymentInvoiceDocument(makeInput({ docLabel: 'Tax Invoice', invNo: 'INV-00000001' }))
    expect(html).toContain('<title>Tax Invoice — INV-00000001</title>')
  })

  it('embeds dealTitle in the document body', () => {
    const html = renderPaymentInvoiceDocument(makeInput({ dealTitle: 'Unique Campaign XYZ' }))
    expect(html).toContain('Unique Campaign XYZ')
  })

  it('embeds issuer and customer blocks verbatim', () => {
    const html = renderPaymentInvoiceDocument(
      makeInput({
        issuerBlockHtml: '<section id="issuer-test">Issuer Block</section>',
        customerBlockHtml: '<section id="customer-test">Customer Block</section>',
      }),
    )
    expect(html).toContain('<section id="issuer-test">Issuer Block</section>')
    expect(html).toContain('<section id="customer-test">Customer Block</section>')
  })

  it('embeds downloadBase in the data attribute', () => {
    const html = renderPaymentInvoiceDocument(makeInput({ downloadBase: 'my-invoice-42' }))
    expect(html).toContain('data-download-base="my-invoice-42"')
  })

  it('renders an empty placeBlock without breaking structure', () => {
    const html = renderPaymentInvoiceDocument(makeInput({ placeBlock: '' }))
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).not.toContain('undefined')
  })

  it('embeds optional notes blocks when provided', () => {
    const html = renderPaymentInvoiceDocument(
      makeInput({
        paymentNotesBlock: '<div class="notes">Pay note</div>',
        dealNotesBlock: '<div class="notes">Deal note</div>',
      }),
    )
    expect(html).toContain('Pay note')
    expect(html).toContain('Deal note')
  })

  it('does not contain raw "undefined" or "null" strings', () => {
    const html = renderPaymentInvoiceDocument(makeInput())
    expect(html).not.toContain('undefined')
    expect(html).not.toContain('>null<')
  })

  it('renders special characters that were pre-escaped without double-escaping', () => {
    // Caller is responsible for escaping; template must pass through escaped entities
    const html = renderPaymentInvoiceDocument(
      makeInput({ dealTitle: '&lt;Brand&gt; &amp; Co' }),
    )
    expect(html).toContain('&lt;Brand&gt; &amp; Co')
    expect(html).not.toContain('<Brand>')
  })
})
