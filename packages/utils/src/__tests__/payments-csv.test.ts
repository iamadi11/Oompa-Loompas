import { describe, it, expect } from 'vitest'
import {
  buildPaymentsPortfolioCsv,
  paymentsPortfolioExportFilename,
  type PaymentPortfolioCsvRow,
} from '../payments-csv.js'

const base: PaymentPortfolioCsvRow = {
  paymentId: 'pay-1',
  dealId: 'deal-1',
  dealTitle: 'Spring',
  brandName: 'Acme',
  amount: 25000,
  currency: 'INR',
  status: 'PENDING',
  dueDate: '2026-05-01T00:00:00.000Z',
  receivedAt: null,
  invoiceNumber: 'INV-00000001',
  notes: null,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
}

describe('buildPaymentsPortfolioCsv', () => {
  it('outputs header and row with CRLF', () => {
    const csv = buildPaymentsPortfolioCsv([base])
    expect(csv).toContain('payment_id,deal_id,deal_title')
    expect(csv).toContain('pay-1')
    expect(csv).toContain('25000.00')
    expect(csv).toContain('\r\n')
  })

  it('header only when empty', () => {
    expect(buildPaymentsPortfolioCsv([]).split('\r\n').length).toBe(1)
  })

  it('escapes deal title with comma', () => {
    const line = buildPaymentsPortfolioCsv([{ ...base, dealTitle: 'A, B' }]).split('\r\n')[1]
    expect(line).toContain('"A, B"')
  })
})

describe('paymentsPortfolioExportFilename', () => {
  it('uses UTC date', () => {
    expect(paymentsPortfolioExportFilename(new Date('2026-04-12T00:00:00.000Z'))).toBe(
      'oompa-payments-portfolio-2026-04-12.csv',
    )
  })
})
