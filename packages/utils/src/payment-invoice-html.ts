import type { Currency } from '@oompa/types'
import { formatCurrency } from './currency.js'
import { formatDate } from './date.js'
import { escapeHtml } from './html.js'

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

function lineItemDescription(deal: PaymentInvoiceDealInput, payment: PaymentInvoicePaymentInput): string {
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${docLabel} — ${invNo}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; color: #111; line-height: 1.5; background: #fafafa; }
    .page { max-width: 48rem; margin: 0 auto; padding: 1.5rem 1.25rem 3rem; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    h1 { font-size: 1.75rem; margin: 0 0 0.25rem; letter-spacing: -0.02em; }
    h2 { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin: 0 0 0.5rem; font-weight: 700; }
    .muted { color: #555; font-size: 0.875rem; }
    .small { font-size: 0.8125rem; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.25rem 0; }
    @media (max-width: 520px) { .meta-grid { grid-template-columns: 1fr; } }
    .party { border: 1px solid #e5e5e5; border-radius: 0.5rem; padding: 1rem; background: #fcfcfc; }
    .party-title { margin-top: 0; }
    .party-legal { margin: 0.25rem 0 0; font-size: 1rem; }
    .party-address { margin: 0.5rem 0 0; white-space: pre-wrap; }
    .party-placeholder { margin: 0; font-size: 0.875rem; color: #444; }
    .party-placeholder code { font-size: 0.8em; }
    .tax-ids { margin: 0.5rem 0 0; padding-left: 1.1rem; font-size: 0.875rem; }
    .party-email { margin: 0.5rem 0 0; font-size: 0.875rem; }
    table.data { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.9375rem; }
    table.data th, table.data td { text-align: left; padding: 0.5rem 0.35rem; border-bottom: 1px solid #e5e5e5; vertical-align: top; }
    table.data thead th { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.06em; color: #555; font-weight: 700; border-bottom: 2px solid #ccc; }
    table.data .num { text-align: right; font-variant-numeric: tabular-nums; }
    table.summary { width: 100%; max-width: 22rem; margin-left: auto; border-collapse: collapse; }
    table.summary th, table.summary td { padding: 0.35rem 0; border-bottom: 1px solid #eee; }
    table.summary th { text-align: left; font-weight: 600; color: #444; font-size: 0.875rem; }
    table.summary td { text-align: right; font-variant-numeric: tabular-nums; }
    table.summary .total th, table.summary .total td { border-bottom: none; font-size: 1.15rem; font-weight: 800; padding-top: 0.75rem; }
    .amount-strong { font-weight: 800; }
    .notes { margin-top: 1.25rem; padding: 1rem; background: #f4f4f5; border-radius: 0.5rem; font-size: 0.9rem; }
    .notes-title { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.06em; color: #666; margin: 0 0 0.35rem; }
    .compliance { margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid #e5e5e5; font-size: 0.75rem; color: #444; }
    .compliance ul { margin: 0.35rem 0 0; padding-left: 1.1rem; }
    footer.doc-footer { margin-top: 1.5rem; font-size: 0.7rem; color: #666; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; padding: 0.75rem; background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 0.5rem; }
    .toolbar button { font: inherit; font-size: 0.8125rem; padding: 0.4rem 0.75rem; border-radius: 0.375rem; border: 1px solid #6366f1; background: #fff; color: #3730a3; cursor: pointer; font-weight: 600; }
    .toolbar button:hover, .toolbar button:focus-visible { background: #eef2ff; outline: 2px solid #6366f1; outline-offset: 2px; }
    .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    @media print {
      body { background: #fff; }
      .page { box-shadow: none; padding: 0; max-width: none; }
      .no-print { display: none !important; }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body data-invoice-number="${invNo}" data-download-base="${downloadBase}" data-share-title="${shareTitleEsc}">
  <div id="invoice-status" class="visually-hidden" role="status" aria-live="polite"></div>
  <div class="page">
  <div class="toolbar no-print" role="toolbar" aria-label="Invoice actions">
    <button type="button" id="inv-print">Print / Save as PDF</button>
    <button type="button" id="inv-copy">Copy link</button>
    <button type="button" id="inv-share">Share…</button>
    <button type="button" id="inv-download">Download HTML</button>
  </div>
  <main id="invoice-content">
  <header>
    <h1>${docLabel}</h1>
    <p class="muted">Invoice no. <strong>${invNo}</strong> · Issue date (UTC) <strong>${escapeHtml(invDateLabel)}</strong></p>
    <p class="muted small">Internal reference <code>${internalRef}</code> (immutable system id)</p>
  </header>
  ${placeBlock}
  <div class="meta-grid">
    ${issuerBlock(issuer)}
    ${customerBlock(deal.brandName)}
  </div>
  <p><strong>Contract / deal:</strong> ${escapeHtml(deal.title)}</p>
  <h2 class="section-heading visually-hidden" id="lines-heading">Line items</h2>
  <table class="data" aria-labelledby="lines-heading">
    <thead>
      <tr>
        <th scope="col">Description of supply</th>
        <th scope="col" class="num">Qty</th>
        <th scope="col" class="num">Unit price</th>
        <th scope="col" class="num">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${lineDesc}</td>
        <td class="num">1</td>
        <td class="num">${escapeHtml(unitPriceLabel)}</td>
        <td class="num amount-strong">${escapeHtml(amountLabel)}</td>
      </tr>
    </tbody>
  </table>
  <table class="summary" aria-label="Totals">
    <tbody>
      <tr><th scope="row">Subtotal</th><td>${escapeHtml(amountLabel)}</td></tr>
      <tr><th scope="row">Taxes</th><td>Not calculated here — declare per your registration and local rules.</td></tr>
      <tr class="total"><th scope="row">Total (${escapeHtml(payCurrency)})</th><td>${escapeHtml(amountLabel)}</td></tr>
    </tbody>
  </table>
  <table class="data" aria-label="Payment milestone status">
    <tbody>
      <tr><th scope="row">Payment status</th><td>${statusLabel}</td></tr>
      ${optionalDateRow('Due date', payment.dueDateIso)}
      ${optionalDateRow('Amount received on', payment.receivedAtIso)}
    </tbody>
  </table>
  ${optionalNotesBlock('Payment notes', payment.notes)}
  ${optionalNotesBlock('Deal notes', deal.notes)}
  <section class="compliance" aria-labelledby="compliance-heading">
    <h2 id="compliance-heading" class="party-title">Compliance notice</h2>
    <p>This document is a structured payment-milestone record produced by your revenue workspace. It is <strong>not</strong> legal or tax advice. Rules for VAT (EU), GST (e.g. India, Australia, Canada), US sales tax, and other regimes differ by country and transaction type — including mandatory fields, sequential numbering, e-invoicing, withholding, and reverse charge.</p>
    <ul>
      <li>Confirm tax rates, exemptions, place of supply, and buyer tax IDs with a qualified advisor or tax authority.</li>
      <li>Sequential invoice numbers are assigned the first time this page is opened and stored for audit traceability.</li>
      <li>Sharing this URL may allow recipients to view the document — protect the link like any financial record.</li>
    </ul>
  </section>
  <footer class="doc-footer">
    <p>Document generated <strong>${escapeHtml(generatedLabel)}</strong> (UTC). Retain a copy for your books and statutory retention period.</p>
  </footer>
  </main>
  </div>
  <script>
(function () {
  var statusEl = document.getElementById('invoice-status');
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }
  var body = document.body;
  var invNo = body.getAttribute('data-invoice-number') || 'invoice';
  var downloadBase = body.getAttribute('data-download-base') || 'invoice';
  var shareTitle = body.getAttribute('data-share-title') || ('Invoice ' + invNo);
  var printBtn = document.getElementById('inv-print');
  var copyBtn = document.getElementById('inv-copy');
  var shareBtn = document.getElementById('inv-share');
  var dlBtn = document.getElementById('inv-download');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { say('Link copied'); }).catch(function () { say('Copy failed'); });
    } else {
      say('Clipboard not available');
    }
  });
  if (shareBtn) shareBtn.addEventListener('click', function () {
    var url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareTitle, url: url }).then(function () { say('Shared'); }).catch(function () {});
    } else {
      say('Use Copy link or your browser share menu');
    }
  });
  if (dlBtn) dlBtn.addEventListener('click', function () {
    var html = '<!DOCTYPE html>\\n' + document.documentElement.outerHTML;
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = downloadBase + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    say('Download started');
  });
})();
  </script>
</body>
</html>`
}
