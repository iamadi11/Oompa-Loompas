/**
 * CSV builder for the full attention queue (overdue payments and deliverables).
 * Same RFC 4180 / CRLF conventions as portfolio exports.
 */

import { escapeCsvCell } from './deals-csv.js'

export type AttentionQueueCsvRow = {
  kind: 'overdue_payment' | 'overdue_deliverable'
  dealId: string
  dealTitle: string
  brandName: string
  paymentId: string
  paymentAmount: number | null
  paymentCurrency: string | null
  deliverableId: string
  deliverableTitle: string
  dueDate: string | null
}

const HEADER = [
  'priority_kind',
  'deal_id',
  'deal_title',
  'brand_name',
  'payment_id',
  'payment_amount',
  'payment_currency',
  'deliverable_id',
  'deliverable_title',
  'due_date',
] as const

function cell(raw: string): string {
  return escapeCsvCell(raw)
}

function optionalMoney(n: number | null): string {
  return n === null ? '' : cell(n.toFixed(2))
}

function optionalStr(s: string | null): string {
  return cell(s ?? '')
}

/**
 * Build UTF-8 CSV body (no BOM). Caller may prepend `\uFEFF` for Excel UTF-8 hint.
 */
export function buildAttentionQueueCsv(rows: AttentionQueueCsvRow[]): string {
  const lines: string[] = [HEADER.join(',')]
  for (const r of rows) {
    lines.push(
      [
        cell(r.kind),
        cell(r.dealId),
        cell(r.dealTitle),
        cell(r.brandName),
        cell(r.paymentId),
        optionalMoney(r.paymentAmount),
        r.paymentCurrency === null ? '' : cell(r.paymentCurrency),
        cell(r.deliverableId),
        cell(r.deliverableTitle),
        optionalStr(r.dueDate),
      ].join(','),
    )
  }
  return lines.join('\r\n')
}

export function attentionQueueExportFilename(exportDate: Date): string {
  const y = exportDate.getUTCFullYear()
  const m = String(exportDate.getUTCMonth() + 1).padStart(2, '0')
  const d = String(exportDate.getUTCDate()).padStart(2, '0')
  return `oompa-attention-queue-${y}-${m}-${d}.csv`
}
