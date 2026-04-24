import { describe, it, expect } from 'vitest'
import {
  matchTransactionsToPayments,
  parseReconcileCsv,
  type BankTransaction,
  type PendingPaymentRow,
  type PaymentMatch,
} from '../payment-reconciliation.js'

// ─── matchTransactionsToPayments ─────────────────────────────────────────────

const BASE_DATE = new Date('2026-04-18')

function makePayment(overrides: Partial<PendingPaymentRow> = {}): PendingPaymentRow {
  return {
    id: 'pay-1',
    dealId: 'deal-1',
    dealTitle: 'Nike Q2',
    brandName: 'Nike',
    amount: 75000,
    dueDate: new Date('2026-04-20'),
    ...overrides,
  }
}

function makeTx(overrides: Partial<BankTransaction> = {}): BankTransaction {
  return {
    date: BASE_DATE,
    amount: 75000,
    description: 'UPI/Nike Creative',
    ...overrides,
  }
}

describe('matchTransactionsToPayments — confidence', () => {
  it('returns high confidence for exact amount + brand in description', () => {
    const matches = matchTransactionsToPayments([makeTx()], [makePayment()])
    expect(matches).toHaveLength(1)
    expect(matches[0]!.confidence).toBe('high')
  })

  it('returns high confidence for exact amount + date within 7 days of dueDate', () => {
    const matches = matchTransactionsToPayments(
      [makeTx({ description: 'NEFT transfer' })],
      [makePayment({ dueDate: new Date('2026-04-21') })], // 3 days after tx date
    )
    expect(matches[0]!.confidence).toBe('high')
  })

  it('returns medium confidence for exact amount with no description match and far due date', () => {
    const matches = matchTransactionsToPayments(
      [makeTx({ description: 'NEFT transfer', date: new Date('2026-03-01') })],
      [makePayment({ dueDate: new Date('2026-04-30') })], // 60 days out
    )
    expect(matches[0]!.confidence).toBe('medium')
  })

  it('returns low confidence for near-amount (within 5%) match with close date', () => {
    const matches = matchTransactionsToPayments(
      [makeTx({ amount: 74500, description: 'NEFT', date: new Date('2026-04-18') })],
      [makePayment({ dueDate: new Date('2026-04-20') })],
    )
    expect(matches[0]!.confidence).toBe('low')
  })

  it('returns no match when amount is too far off (>5%)', () => {
    const matches = matchTransactionsToPayments(
      [makeTx({ amount: 50000 })],
      [makePayment({ amount: 75000 })],
    )
    expect(matches).toHaveLength(0)
  })

  it('returns no match when low-confidence amount but date too far', () => {
    const matches = matchTransactionsToPayments(
      [makeTx({ amount: 74500, date: new Date('2026-01-01') })],
      [makePayment({ dueDate: new Date('2026-04-30') })], // 119 days off
    )
    expect(matches).toHaveLength(0)
  })
})

describe('matchTransactionsToPayments — deduplication', () => {
  it('each transaction matches at most one payment', () => {
    const payments = [
      makePayment({ id: 'pay-1', brandName: 'Nike', amount: 75000 }),
      makePayment({ id: 'pay-2', brandName: 'Nike', amount: 75000, dealId: 'deal-2', dealTitle: 'Nike Q3' }),
    ]
    const matches = matchTransactionsToPayments([makeTx()], payments)
    // One transaction → at most one match
    expect(matches).toHaveLength(1)
  })

  it('each payment can only be matched once across transactions', () => {
    const transactions = [makeTx(), makeTx({ amount: 75000, description: 'duplicate' })]
    const payments = [makePayment()]
    const matches = matchTransactionsToPayments(transactions, payments)
    // Two transactions, one payment → one match
    expect(matches).toHaveLength(1)
  })

  it('multiple transactions match multiple distinct payments', () => {
    const transactions = [
      makeTx({ amount: 75000, description: 'Nike' }),
      makeTx({ amount: 50000, description: 'Zomato' }),
    ]
    const payments = [
      makePayment({ id: 'pay-1', amount: 75000, brandName: 'Nike' }),
      makePayment({ id: 'pay-2', amount: 50000, brandName: 'Zomato', dealId: 'deal-2', dealTitle: 'Zomato' }),
    ]
    const matches = matchTransactionsToPayments(transactions, payments)
    expect(matches).toHaveLength(2)
    const ids = matches.map((m) => m.paymentId).sort()
    expect(ids).toEqual(['pay-1', 'pay-2'])
  })
})

describe('matchTransactionsToPayments — edge cases', () => {
  it('returns empty array for empty transactions', () => {
    expect(matchTransactionsToPayments([], [makePayment()])).toHaveLength(0)
  })

  it('returns empty array for empty payments', () => {
    expect(matchTransactionsToPayments([makeTx()], [])).toHaveLength(0)
  })

  it('returns empty array for both empty', () => {
    expect(matchTransactionsToPayments([], [])).toHaveLength(0)
  })

  it('handles payment with null dueDate (falls back to amount-only match)', () => {
    const matches = matchTransactionsToPayments(
      [makeTx({ description: 'NEFT transfer' })],
      [makePayment({ dueDate: null })],
    )
    // null dueDate: cannot use date bonus, description does not contain brand → medium
    expect(matches).toHaveLength(1)
    expect(matches[0]!.confidence).toBe('medium')
  })

  it('match result contains correct fields', () => {
    const matches = matchTransactionsToPayments([makeTx()], [makePayment()])
    const m = matches[0]!
    expect(m.paymentId).toBe('pay-1')
    expect(m.dealId).toBe('deal-1')
    expect(m.dealTitle).toBe('Nike Q2')
    expect(m.brandName).toBe('Nike')
    expect(m.paymentAmount).toBe(75000)
    expect(m.transactionAmount).toBe(75000)
    expect(m.transactionDate).toEqual(BASE_DATE)
    expect(m.suggestedReceivedAt).toEqual(BASE_DATE)
    expect(m.transactionIndex).toBe(0)
  })

  it('is case-insensitive for brand name in description', () => {
    const matches = matchTransactionsToPayments(
      [makeTx({ description: 'UPI/NIKE CREATIVE' })],
      [makePayment({ brandName: 'Nike' })],
    )
    expect(matches[0]!.confidence).toBe('high')
  })

  it('prefers high-confidence match over medium when both candidates exist', () => {
    const transactions = [makeTx({ description: 'Nike UPI', amount: 75000 })]
    const payments = [
      makePayment({ id: 'pay-low', amount: 75000, brandName: 'UnrelatedBrand', dueDate: new Date('2026-10-01') }),
      makePayment({ id: 'pay-high', amount: 75000, brandName: 'Nike', dueDate: new Date('2026-04-20') }),
    ]
    const matches = matchTransactionsToPayments(transactions, payments)
    expect(matches).toHaveLength(1)
    expect(matches[0]!.paymentId).toBe('pay-high')
    expect(matches[0]!.confidence).toBe('high')
  })
})

// ─── parseReconcileCsv ────────────────────────────────────────────────────────

describe('parseReconcileCsv', () => {
  it('parses HDFC-style CSV (Credit Amount column)', () => {
    const csv = `Date,Narration,Value Date,Debit Amount,Credit Amount,Chq/Ref Number,Closing Balance
19/04/2026,UPI/Nike,19/04/2026,,75000,,300000
18/04/2026,ATM Withdrawal,18/04/2026,5000,,,295000`
    const txs = parseReconcileCsv(csv)
    expect(txs).toHaveLength(1)
    expect(txs[0]!.amount).toBe(75000)
    expect(txs[0]!.description).toContain('Nike')
  })

  it('parses ICICI-style CSV (Deposit Amount column)', () => {
    const csv = `S No.,Value Date,Transaction Date,Cheque Number,Transaction Remarks,Withdrawal Amount (INR ),Deposit Amount (INR ),Balance (INR )
1,19/04/2026,19/04/2026,,UPI-Nike Creative,,75000.00,300000
2,18/04/2026,18/04/2026,,ATM Cash,5000.00,,295000`
    const txs = parseReconcileCsv(csv)
    expect(txs).toHaveLength(1)
    expect(txs[0]!.amount).toBe(75000)
  })

  it('parses generic CSV with amount and date columns', () => {
    const csv = `date,amount,description
2026-04-19,75000,Nike payment
2026-04-18,-5000,ATM withdrawal`
    const txs = parseReconcileCsv(csv)
    // Only positive amounts
    expect(txs).toHaveLength(1)
    expect(txs[0]!.amount).toBe(75000)
  })

  it('skips rows with zero or negative amounts', () => {
    const csv = `date,amount,description
2026-04-19,0,Fee
2026-04-18,-5000,Debit`
    const txs = parseReconcileCsv(csv)
    expect(txs).toHaveLength(0)
  })

  it('returns empty array for empty CSV', () => {
    expect(parseReconcileCsv('')).toHaveLength(0)
  })

  it('returns empty array for header-only CSV', () => {
    const csv = 'Date,Amount,Description'
    expect(parseReconcileCsv(csv)).toHaveLength(0)
  })

  it('handles amounts with commas (1,00,000)', () => {
    const csv = `date,amount,description
2026-04-19,"1,00,000",Nike`
    const txs = parseReconcileCsv(csv)
    expect(txs[0]!.amount).toBe(100000)
  })

  it('parses dates in DD/MM/YYYY format', () => {
    const csv = `date,amount,description
19/04/2026,75000,Nike`
    const txs = parseReconcileCsv(csv)
    expect(txs[0]!.date.getFullYear()).toBe(2026)
    expect(txs[0]!.date.getMonth()).toBe(3) // April = 3
    expect(txs[0]!.date.getDate()).toBe(19)
  })
})
