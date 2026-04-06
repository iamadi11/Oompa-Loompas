import type { Currency } from '@oompa/types'
import { formatCurrency } from './currency.js'
import { formatDate } from './date.js'
import { escapeHtml } from './html.js'

const DATE_DISPLAY: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

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

function optionalDateLine(label: string, iso: string | null): string {
  if (!iso) return ''
  const formatted = formatDate(iso, DATE_DISPLAY)
  return `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(formatted)}</td></tr>`
}

function optionalNotesBlock(title: string, notes: string | null): string {
  if (!notes?.trim()) return ''
  return `<div class="notes"><p class="notes-title">${escapeHtml(title)}</p><p>${escapeHtml(notes.trim())}</p></div>`
}

/**
 * Builds a minimal, printable HTML invoice for a single payment milestone on a deal.
 * All user-controlled strings are escaped. Amount formatting uses the same rules as the app.
 */
export function buildPaymentInvoiceHtml(input: PaymentInvoiceBuildInput): string {
  const { generatedAtIso, deal, payment } = input
  const payCurrency = assertCurrency(payment.currency)
  const amountLabel = formatCurrency(payment.amount, payCurrency)
  const generatedLabel = formatDate(generatedAtIso, {
    ...DATE_DISPLAY,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
  const invoiceRef = escapeHtml(payment.id)
  const statusLabel = escapeHtml(paymentStatusDisplayLabel(payment.status))

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice — ${escapeHtml(deal.brandName)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 40rem; color: #111; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
    .muted { color: #555; font-size: 0.875rem; }
    table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; }
    th, td { text-align: left; padding: 0.35rem 0; border-bottom: 1px solid #e5e5e5; }
    th { width: 9rem; font-weight: 600; color: #444; }
    .amount { font-size: 1.25rem; font-weight: 700; }
    .notes { margin-top: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem; }
    .notes-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 0 0 0.35rem; }
    footer { margin-top: 2rem; font-size: 0.75rem; color: #666; }
  </style>
</head>
<body>
  <main id="invoice-content">
  <h1>Invoice</h1>
  <p class="muted">Reference <strong>${invoiceRef}</strong></p>
  <p><strong>Bill to:</strong> ${escapeHtml(deal.brandName)}</p>
  <p><strong>Deal:</strong> ${escapeHtml(deal.title)}</p>
  <table aria-label="Payment milestone details">
    <tbody>
      <tr><th scope="row">Amount</th><td class="amount">${escapeHtml(amountLabel)}</td></tr>
      <tr><th scope="row">Status</th><td>${statusLabel}</td></tr>
      ${optionalDateLine('Due', payment.dueDateIso)}
      ${optionalDateLine('Received', payment.receivedAtIso)}
    </tbody>
  </table>
  ${optionalNotesBlock('Payment notes', payment.notes)}
  ${optionalNotesBlock('Deal notes', deal.notes)}
  <footer>
    <p>Generated ${escapeHtml(generatedLabel)} (UTC). This document is informational; keep records per your tax and contract obligations.</p>
  </footer>
  </main>
</body>
</html>`
}
