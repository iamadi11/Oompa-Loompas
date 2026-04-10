/**
 * Deterministic CSV builder for deal portfolio exports (accountant / spreadsheet workflows).
 * RFC 4180-style quoting; rows joined with CRLF for broad Excel compatibility.
 */

export type DealPortfolioCsvRow = {
  id: string
  title: string
  brandName: string
  status: string
  value: number
  currency: string
  startDate: string | null
  endDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const HEADER = [
  'deal_id',
  'title',
  'brand',
  'status',
  'contract_value',
  'currency',
  'start_date',
  'end_date',
  'created_at',
  'updated_at',
  'notes',
] as const

/** Escape a single CSV field (handles comma, quote, CR/LF). */
export function escapeCsvCell(raw: string): string {
  if (/[",\r\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

function cell(raw: string): string {
  return escapeCsvCell(raw)
}

function money(n: number): string {
  return cell(n.toFixed(2))
}

function optionalIso(iso: string | null): string {
  return cell(iso ?? '')
}

function optionalNotes(notes: string | null): string {
  return cell(notes ?? '')
}

/**
 * Build UTF-8 CSV body (no BOM). Caller may prepend `\uFEFF` for Excel UTF-8 hint.
 */
export function buildDealsPortfolioCsv(deals: DealPortfolioCsvRow[]): string {
  const lines: string[] = [HEADER.join(',')]
  for (const d of deals) {
    lines.push(
      [
        cell(d.id),
        cell(d.title),
        cell(d.brandName),
        cell(d.status),
        money(d.value),
        cell(d.currency),
        optionalIso(d.startDate),
        optionalIso(d.endDate),
        optionalIso(d.createdAt),
        optionalIso(d.updatedAt),
        optionalNotes(d.notes),
      ].join(','),
    )
  }
  return lines.join('\r\n')
}

export function dealsPortfolioExportFilename(now: Date): string {
  const day = now.toISOString().slice(0, 10)
  return `oompa-deals-portfolio-${day}.csv`
}
