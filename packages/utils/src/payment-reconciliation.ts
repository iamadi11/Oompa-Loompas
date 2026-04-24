import { parseCurrencyString } from './currency.js'

export interface BankTransaction {
  date: Date
  amount: number
  description?: string
}

export interface PendingPaymentRow {
  id: string
  dealId: string
  dealTitle: string
  brandName: string
  amount: number
  dueDate: Date | null
}

export interface PaymentMatch {
  transactionIndex: number
  paymentId: string
  dealId: string
  dealTitle: string
  brandName: string
  paymentAmount: number
  transactionAmount: number
  transactionDate: Date
  suggestedReceivedAt: Date
  confidence: 'high' | 'medium' | 'low'
}

const ONE_DAY_MS = 24 * 60 * 60 * 1_000
const AMOUNT_TOLERANCE = 0.05
const DATE_MATCH_THRESHOLD_DAYS = 7

type ScoredCandidate = {
  paymentIndex: number
  confidence: 'high' | 'medium' | 'low'
  score: number
}

function confidenceScore(c: 'high' | 'medium' | 'low'): number {
  return c === 'high' ? 3 : c === 'medium' ? 2 : 1
}

function classifyConfidence(
  tx: BankTransaction,
  payment: PendingPaymentRow,
): 'high' | 'medium' | 'low' | null {
  const exactAmount = tx.amount === payment.amount
  const nearAmount =
    !exactAmount &&
    payment.amount > 0 &&
    Math.abs(tx.amount - payment.amount) / payment.amount <= AMOUNT_TOLERANCE

  if (!exactAmount && !nearAmount) return null

  const daysFromDue =
    payment.dueDate !== null
      ? Math.abs(tx.date.getTime() - payment.dueDate.getTime()) / ONE_DAY_MS
      : null
  const dateClose = daysFromDue !== null && daysFromDue <= DATE_MATCH_THRESHOLD_DAYS

  const brandInDescription =
    typeof tx.description === 'string' &&
    tx.description.toLowerCase().includes(payment.brandName.toLowerCase())

  if (exactAmount && (brandInDescription || dateClose)) return 'high'
  if (exactAmount) return 'medium'
  if (nearAmount && dateClose) return 'low'
  return null
}

/**
 * Pure function: match bank transactions to pending payments.
 * Each transaction → at most one payment (highest confidence wins).
 * Each payment → claimed by at most one transaction.
 */
export function matchTransactionsToPayments(
  transactions: BankTransaction[],
  payments: PendingPaymentRow[],
): PaymentMatch[] {
  if (transactions.length === 0 || payments.length === 0) return []

  // Build scored candidates: txIndex → sorted list of (paymentIndex, confidence)
  const candidates: Map<number, ScoredCandidate[]> = new Map()

  for (let ti = 0; ti < transactions.length; ti++) {
    const tx = transactions[ti]!
    const scoredList: ScoredCandidate[] = []

    for (let pi = 0; pi < payments.length; pi++) {
      const payment = payments[pi]!
      const confidence = classifyConfidence(tx, payment)
      if (confidence !== null) {
        scoredList.push({ paymentIndex: pi, confidence, score: confidenceScore(confidence) })
      }
    }

    if (scoredList.length > 0) {
      scoredList.sort((a, b) => b.score - a.score)
      candidates.set(ti, scoredList)
    }
  }

  const result: PaymentMatch[] = []
  const claimedPayments = new Set<number>()

  // Greedy: process transactions by their best candidate score (highest first)
  const txOrder = Array.from(candidates.entries()).sort(
    (a, b) => (b[1][0]?.score ?? 0) - (a[1][0]?.score ?? 0),
  )

  for (const [ti, scoredList] of txOrder) {
    for (const { paymentIndex, confidence } of scoredList) {
      if (claimedPayments.has(paymentIndex)) continue
      const tx = transactions[ti]!
      const payment = payments[paymentIndex]!
      result.push({
        transactionIndex: ti,
        paymentId: payment.id,
        dealId: payment.dealId,
        dealTitle: payment.dealTitle,
        brandName: payment.brandName,
        paymentAmount: payment.amount,
        transactionAmount: tx.amount,
        transactionDate: tx.date,
        suggestedReceivedAt: tx.date,
        confidence,
      })
      claimedPayments.add(paymentIndex)
      break
    }
  }

  return result
}

// ─── CSV parsing ─────────────────────────────────────────────────────────────

function parseDate(raw: string): Date | null {
  const s = raw.trim()
  if (!s) return null

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  // YYYY-MM-DD (ISO)
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return new Date(s)
  }

  const parsed = new Date(s)
  return isNaN(parsed.getTime()) ? null : parsed
}

function findColumn(lower: string[], keywords: string[]): number {
  for (const kw of keywords) {
    const idx = lower.findIndex((h) => h.includes(kw))
    if (idx !== -1) return idx
  }
  return -1
}

function detectColumns(headers: string[]): {
  dateCol: number
  amountCol: number
  descCol: number
} | null {
  const lower = headers.map((h) => h.toLowerCase().trim())

  let amountCol = findColumn(lower, ['credit amount', 'deposit amount (inr )', 'deposit amount', 'received amount', 'credit'])
  if (amountCol === -1) amountCol = lower.findIndex((h) => h === 'amount')

  const dateCol = findColumn(lower, ['transaction date', 'value date', 'date'])
  const descCol = findColumn(lower, ['transaction remarks', 'narration', 'description', 'particulars', 'remarks'])

  if (amountCol === -1 || dateCol === -1) return null
  return { dateCol, amountCol, descCol }
}

function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { result.push(current); current = ''; continue }
    current += ch
  }
  result.push(current)
  return result
}

/**
 * Parse a bank statement CSV (client-side or server-side) into BankTransaction[].
 * Only returns credit (positive) rows.
 * Handles HDFC, ICICI, SBI, and generic date/amount/description formats.
 */
export function parseReconcileCsv(csv: string): BankTransaction[] {
  const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = splitCsvLine(lines[0]!)
  const cols = detectColumns(headers)
  if (!cols) return []

  const { dateCol, amountCol, descCol } = cols
  const result: BankTransaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]!)
    const rawAmount = cells[amountCol]?.trim() ?? ''
    if (!rawAmount) continue

    const amount = parseCurrencyString(rawAmount)
    if (!isFinite(amount) || amount <= 0) continue

    const rawDate = cells[dateCol]?.trim() ?? ''
    const date = parseDate(rawDate)
    if (!date) continue

    const description = descCol >= 0 ? (cells[descCol]?.trim() ?? '') : ''
    result.push({ date, amount, description })
  }

  return result
}
