/**
 * CSV builder for deliverable rows across all deals (accountant / ops spreadsheets).
 */

import { escapeCsvCell } from './deals-csv.js'

export type DeliverablePortfolioCsvRow = {
  deliverableId: string
  dealId: string
  dealTitle: string
  brandName: string
  title: string
  platform: string
  type: string
  status: string
  dueDate: string | null
  completedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const HEADER = [
  'deliverable_id',
  'deal_id',
  'deal_title',
  'brand',
  'deliverable_title',
  'platform',
  'type',
  'status',
  'due_date',
  'completed_at',
  'notes',
  'deliverable_created_at',
  'deliverable_updated_at',
] as const

function cell(raw: string): string {
  return escapeCsvCell(raw)
}

function optionalIso(iso: string | null): string {
  return cell(iso ?? '')
}

function optionalText(s: string | null): string {
  return cell(s ?? '')
}

/** Build UTF-8 CSV body (no BOM). Caller may prepend `\uFEFF` for Excel. */
export function buildDeliverablesPortfolioCsv(rows: DeliverablePortfolioCsvRow[]): string {
  const lines: string[] = [HEADER.join(',')]
  for (const r of rows) {
    lines.push(
      [
        cell(r.deliverableId),
        cell(r.dealId),
        cell(r.dealTitle),
        cell(r.brandName),
        cell(r.title),
        cell(r.platform),
        cell(r.type),
        cell(r.status),
        optionalIso(r.dueDate),
        optionalIso(r.completedAt),
        optionalText(r.notes),
        optionalIso(r.createdAt),
        optionalIso(r.updatedAt),
      ].join(','),
    )
  }
  return lines.join('\r\n')
}

export function deliverablesPortfolioExportFilename(now: Date): string {
  const day = now.toISOString().slice(0, 10)
  return `oompa-deliverables-portfolio-${day}.csv`
}
