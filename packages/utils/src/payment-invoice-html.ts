import type { Currency } from '@oompa/types'
import { formatCurrency } from './currency.js'
import { formatDate } from './date.js'
import { escapeHtml } from './html.js'
import { renderPaymentInvoiceDocument } from './payment-invoice-template.js'

const DATE_DISPLAY: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

/** Seller / supplier — typically loaded from server environment. */
export type PaymentInvoiceIssuerInput = {
  legalName: string
  addressLines: string[]
  /** Free-text lines, e.g. "VAT: EU1234567" or "GSTIN 22AAAAA0000A1Z5". */
  taxIdLines: string[]
  email: string | null
} | null

export type PaymentInvoiceDealInput = {
  title: string
  brandName: string
  currency: Currency
  notes: string | null
}

export type PaymentInvoicePaymentInput = {
  id: string
  amount: number
  /** ISO currency code from storage; unknown values fall back to INR for display. */
  currency: string
  status: string
  dueDateIso: string | null
  receivedAtIso: string | null
  notes: string | null
}

export type PaymentInvoiceBuildInput = {
  /** ISO-8601 instant when the document was generated (caller-controlled for tests). */
  generatedAtIso: string
  /** Shown as the invoice issue date (calendar, UTC). */
  invoiceDateIso: string
  /** Human-facing sequential invoice number (e.g. INV-00000001). */
  invoiceNumber: string
  /** Document title, e.g. "Invoice" or "Tax invoice". */
  documentLabel: string
  issuer: PaymentInvoiceIssuerInput
  /** Optional place-of-supply line (jurisdiction hint). */
  placeOfSupply: string | null
  deal: PaymentInvoiceDealInput
  payment: PaymentInvoicePaymentInput
}

function assertCurrency(c: string): Currency {
  if (c === 'INR' || c === 'USD' || c === 'EUR' || c === 'GBP') return c
  return 'INR'
}

/** Human-readable payment status for print/PDF (enum → title case). */
function paymentStatusDisplayLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PARTIAL: 'Partial',
    RECEIVED: 'Received',
    OVERDUE: 'Overdue',
    REFUNDED: 'Refunded',
  }
  return labels[status] ?? status
}

function utcCalendarLabel(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'Invalid date'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    ...DATE_DISPLAY,
  }).format(d)
}

function optionalDateRow(label: string, iso: string | null): string {
  if (!iso) return ''
  const formatted = formatDate(iso, DATE_DISPLAY)
  return `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(formatted)}</td></tr>`
}

function optionalNotesBlock(title: string, notes: string | null): string {
  if (!notes?.trim()) return ''
  return `<div class="notes"><p class="notes-title">${escapeHtml(title)}</p><p>${escapeHtml(notes.trim())}</p></div>`
}

function issuerBlock(issuer: PaymentInvoiceIssuerInput): string {
  if (!issuer) {
    return `<section class="party issuer" aria-labelledby="issuer-heading">
  <h2 id="issuer-heading" class="party-title">From (supplier / service provider)</h2>
  <p class="party-placeholder">Add your legal business name, address, and tax registration details using the environment variables documented for the API (<code>INVOICE_ISSUER_*</code>). This block is required for most VAT, GST, and sales-tax compliant invoices.</p>
</section>`
  }

  const addr =
    issuer.addressLines.length > 0
      ? `<p class="party-address">${issuer.addressLines.map((l) => escapeHtml(l)).join('<br />')}</p>`
      : ''
  const tax =
    issuer.taxIdLines.length > 0
      ? `<ul class="tax-ids">${issuer.taxIdLines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`
      : ''
  const mail = issuer.email
    ? `<p class="party-email"><a href="mailto:${escapeHtml(issuer.email)}">${escapeHtml(issuer.email)}</a></p>`
    : ''

  return `<section class="party issuer" aria-labelledby="issuer-heading">
  <h2 id="issuer-heading" class="party-title">From (supplier / service provider)</h2>
  <p class="party-legal"><strong>${escapeHtml(issuer.legalName)}</strong></p>
  ${addr}
  ${tax}
  ${mail}
</section>`
}

function customerBlock(brandName: string): string {
  return `<section class="party customer" aria-labelledby="customer-heading">
  <h2 id="customer-heading" class="party-title">Bill to (customer)</h2>
  <p class="party-legal"><strong>${escapeHtml(brandName)}</strong></p>
  <p class="muted small">Use the customer&rsquo;s registered legal name and full billing address on contracts and tax filings where required.</p>
</section>`
}

function lineItemDescription(
  deal: PaymentInvoiceDealInput,
  payment: PaymentInvoicePaymentInput,
): string {
  const base = deal.title.trim()
  const note = payment.notes?.trim()
  if (note) return `${base} — ${note}`
  return base || 'Creator services (per deal)'
}

function sanitizeDownloadBasename(invoiceNumber: string): string {
  return invoiceNumber.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-|-$/g, '') || 'invoice'
}

function shareTitle(documentLabel: string, invoiceNumber: string): string {
  return `${documentLabel} ${invoiceNumber}`
}

/**
 * Structured, printable HTML invoice for a payment milestone.
 * Layout follows commonly required commercial fields (EU VAT Directive-style line items and totals,
 * US/IRS-style record fields, GST-style supplier/customer identification) while remaining jurisdiction-agnostic.
 * All user-controlled strings are escaped.
 */
export function buildPaymentInvoiceHtml(input: PaymentInvoiceBuildInput): string {
  const {
    generatedAtIso,
    invoiceDateIso,
    invoiceNumber,
    documentLabel,
    issuer,
    placeOfSupply,
    deal,
    payment,
  } = input
  const payCurrency = assertCurrency(payment.currency)
  const amountLabel = formatCurrency(payment.amount, payCurrency)
  const unitPriceLabel = formatCurrency(payment.amount, payCurrency)
  const generatedLabel = formatDate(generatedAtIso, {
    ...DATE_DISPLAY,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
  const invDateLabel = utcCalendarLabel(invoiceDateIso)
  const statusLabel = escapeHtml(paymentStatusDisplayLabel(payment.status))
  const invNo = escapeHtml(invoiceNumber)
  const internalRef = escapeHtml(payment.id)
  const docLabel = escapeHtml(documentLabel)
  const lineDesc = escapeHtml(lineItemDescription(deal, payment))
  const placeBlock = placeOfSupply
    ? `<p class="place-of-supply"><strong>Place of supply / jurisdiction note:</strong> ${escapeHtml(placeOfSupply)}</p>`
    : ''
  const shareTitleEsc = escapeHtml(shareTitle(documentLabel, invoiceNumber))
  const downloadBase = escapeHtml(sanitizeDownloadBasename(invoiceNumber))

  return renderPaymentInvoiceDocument({
    docLabel,
    invNo,
    invDateLabel: escapeHtml(invDateLabel),
    internalRef,
    placeBlock,
    issuerBlockHtml: issuerBlock(issuer),
    customerBlockHtml: customerBlock(deal.brandName),
    dealTitle: escapeHtml(deal.title),
    lineDesc,
    unitPriceLabel: escapeHtml(unitPriceLabel),
    amountLabel: escapeHtml(amountLabel),
    payCurrency: escapeHtml(payCurrency),
    statusLabel,
    dueDateRow: optionalDateRow('Due date', payment.dueDateIso),
    receivedDateRow: optionalDateRow('Amount received on', payment.receivedAtIso),
    paymentNotesBlock: optionalNotesBlock('Payment notes', payment.notes),
    dealNotesBlock: optionalNotesBlock('Deal notes', deal.notes),
    generatedLabel: escapeHtml(generatedLabel),
    shareTitleEsc,
    downloadBase,
  })
}
