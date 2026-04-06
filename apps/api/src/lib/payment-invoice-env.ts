import type { PaymentInvoiceIssuerInput } from '@oompa/utils'

function splitLines(raw: string, pattern: RegExp): string[] {
  return raw
    .split(pattern)
    .map((l) => l.trim())
    .filter(Boolean)
}

/**
 * Optional seller (issuer) block for invoices — from server environment only.
 * When unset, the invoice still renders with a compliance notice to complete issuer details.
 */
export function readPaymentInvoiceIssuerEnv(): PaymentInvoiceIssuerInput {
  const legalName = process.env.INVOICE_ISSUER_LEGAL_NAME?.trim()
  if (!legalName) return null

  const addressRaw = process.env.INVOICE_ISSUER_ADDRESS?.trim() ?? ''
  const addressLines = addressRaw ? splitLines(addressRaw, /\n|\\n|\|/g) : []

  const taxRaw = process.env.INVOICE_ISSUER_TAX_IDS?.trim() ?? ''
  const taxIdLines = taxRaw ? splitLines(taxRaw, /\n|\\n/g) : []

  const email = process.env.INVOICE_ISSUER_EMAIL?.trim() || null

  return { legalName, addressLines, taxIdLines, email }
}

export function readPaymentInvoiceDocumentLabel(): string {
  const v = process.env.INVOICE_DOCUMENT_LABEL?.trim()
  return v && v.length > 0 ? v : 'Invoice'
}

export function readPaymentInvoicePlaceOfSupply(): string | null {
  const v = process.env.INVOICE_PLACE_OF_SUPPLY?.trim()
  return v && v.length > 0 ? v : null
}
