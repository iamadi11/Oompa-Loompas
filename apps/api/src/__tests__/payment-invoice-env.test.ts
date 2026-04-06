import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  readPaymentInvoiceDocumentLabel,
  readPaymentInvoiceIssuerEnv,
  readPaymentInvoicePlaceOfSupply,
} from '../lib/payment-invoice-env.js'

const KEYS = [
  'INVOICE_ISSUER_LEGAL_NAME',
  'INVOICE_ISSUER_ADDRESS',
  'INVOICE_ISSUER_TAX_IDS',
  'INVOICE_ISSUER_EMAIL',
  'INVOICE_DOCUMENT_LABEL',
  'INVOICE_PLACE_OF_SUPPLY',
] as const

let initialEnv: Record<(typeof KEYS)[number], string | undefined>

beforeAll(() => {
  initialEnv = Object.fromEntries(KEYS.map((k) => [k, process.env[k]])) as Record<
    (typeof KEYS)[number],
    string | undefined
  >
})

beforeEach(() => {
  for (const k of KEYS) {
    delete process.env[k]
  }
})

afterEach(() => {
  for (const k of KEYS) {
    const v = initialEnv[k]
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
})

describe('readPaymentInvoiceIssuerEnv', () => {
  it('returns null when legal name is missing', () => {
    expect(readPaymentInvoiceIssuerEnv()).toBeNull()
  })

  it('returns null when legal name is whitespace only', () => {
    process.env.INVOICE_ISSUER_LEGAL_NAME = '   \t'
    expect(readPaymentInvoiceIssuerEnv()).toBeNull()
  })

  it('parses address pipes, tax id lines, and trims email', () => {
    process.env.INVOICE_ISSUER_LEGAL_NAME = '  Acme Creator Ltd  '
    process.env.INVOICE_ISSUER_ADDRESS = 'Line1|Line2'
    process.env.INVOICE_ISSUER_TAX_IDS = 'GST: 22AAAA\nVAT EU1'
    process.env.INVOICE_ISSUER_EMAIL = ' b@x.com '
    expect(readPaymentInvoiceIssuerEnv()).toEqual({
      legalName: 'Acme Creator Ltd',
      addressLines: ['Line1', 'Line2'],
      taxIdLines: ['GST: 22AAAA', 'VAT EU1'],
      email: 'b@x.com',
    })
  })

  it('allows legal name only with empty address and tax blocks', () => {
    process.env.INVOICE_ISSUER_LEGAL_NAME = 'Solo'
    expect(readPaymentInvoiceIssuerEnv()).toEqual({
      legalName: 'Solo',
      addressLines: [],
      taxIdLines: [],
      email: null,
    })
  })
})

describe('readPaymentInvoiceDocumentLabel', () => {
  it('defaults to Invoice', () => {
    expect(readPaymentInvoiceDocumentLabel()).toBe('Invoice')
  })

  it('uses trimmed override', () => {
    process.env.INVOICE_DOCUMENT_LABEL = '  Tax invoice  '
    expect(readPaymentInvoiceDocumentLabel()).toBe('Tax invoice')
  })
})

describe('readPaymentInvoicePlaceOfSupply', () => {
  it('returns null when unset', () => {
    expect(readPaymentInvoicePlaceOfSupply()).toBeNull()
  })

  it('returns trimmed value when set', () => {
    process.env.INVOICE_PLACE_OF_SUPPLY = '  Maharashtra, IN  '
    expect(readPaymentInvoicePlaceOfSupply()).toBe('Maharashtra, IN')
  })
})
