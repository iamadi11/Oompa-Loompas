/**
 * CSV builder for payment milestone rows across all deals (accountant / reconciliation).
 */

import { escapeCsvCell } from './deals-csv.js'

export type PaymentPortfolioCsvRow = {
  paymentId: string
  dealId: string
  dealTitle: string
  brandName: string
  amount: number
  currency: string
  status: string
  dueDate: string | null
  receivedAt: string | null
  invoiceNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const HEADER = [
  'payment_id',
  'deal_id',
  'deal_title',
  'brand',
  'amount',
  'currency',
  'status',
  'due_date',
  'received_at',
  'invoice_number',
  'notes',
  'payment_created_at',
  'payment_updated_at',
] as const

function cell(raw: string): string {
  return escapeCsvCell(raw)
}

function money(n: number): string {
  return cell(n.toFixed(2))
}

function optionalIso(iso: string | null): string {
  return cell(iso ?? '')
}

function optionalText(s: string | null): string {
  return cell(s ?? '')
}

/** Build UTF-8 CSV body (no BOM). Caller may prepend `\uFEFF` for Excel. */
export function buildPaymentsPortfolioCsv(rows: PaymentPortfolioCsvRow[]): string {
  const lines: string[] = [HEADER.join(',')]
  for (const r of rows) {
    lines.push(
      [
        cell(r.paymentId),
        cell(r.dealId),
        cell(r.dealTitle),
        cell(r.brandName),
        money(r.amount),
        cell(r.currency),
        cell(r.status),
        optionalIso(r.dueDate),
        optionalIso(r.receivedAt),
        optionalText(r.invoiceNumber),
        optionalText(r.notes),
        optionalIso(r.createdAt),
        optionalIso(r.updatedAt),
      ].join(','),
    )
  }
  return lines.join('\r\n')
}

export function paymentsPortfolioExportFilename(now: Date): string {
  const day = now.toISOString().slice(0, 10)
  return `oompa-payments-portfolio-${day}.csv`
}
