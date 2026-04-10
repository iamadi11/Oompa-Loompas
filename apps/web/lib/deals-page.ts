import { DealStatusSchema } from '@oompa/types'
import type { Deal, DealStatus } from '@oompa/types'

/**
 * Normalizes Next.js App Router `searchParams` values for the deals list filter.
 */
export function isDealsNeedsAttentionFilter(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const raw = firstSearchParamValue(searchParams['needsAttention'])
  return raw === 'true' || raw === '1'
}

/**
 * Returns the active status filter from search params, or null if absent/invalid.
 */
export function getDealStatusFilter(
  searchParams: Record<string, string | string[] | undefined>,
): DealStatus | null {
  const raw = firstSearchParamValue(searchParams['status'])
  if (!raw) return null
  const parsed = DealStatusSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

/**
 * Counts deals by status. Returns a zero-initialized record for all statuses.
 */
export function computeStatusCounts(deals: Deal[]): Record<DealStatus, number> {
  const counts: Record<DealStatus, number> = {
    DRAFT: 0,
    NEGOTIATING: 0,
    ACTIVE: 0,
    DELIVERED: 0,
    PAID: 0,
    CANCELLED: 0,
  }
  for (const deal of deals) {
    counts[deal.status]++
  }
  return counts
}

function firstSearchParamValue(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value[0] : value
}

/**
 * Returns trimmed brand filter from `?brandName=` when non-empty; API applies case-insensitive contains match.
 */
export function getDealBrandFilter(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const raw = firstSearchParamValue(searchParams['brandName'])
  if (raw === undefined) return null
  const t = raw.trim()
  return t.length > 0 ? t : null
}

/** Link target that clears `brandName` while preserving pipeline / needs-attention / status filters. */
export function dealsPageHrefWithoutBrandFilter(opts: {
  needsAttention: boolean
  statusFilter: DealStatus | null
}): string {
  if (opts.needsAttention) return '/deals?needsAttention=true'
  if (opts.statusFilter) return `/deals?status=${opts.statusFilter}`
  return '/deals'
}

/** Query string for pipeline strip links while preserving an optional brand filter. */
export function dealsListSearchHref(opts: {
  status: DealStatus | null
  brandName: string | null
}): string {
  const q = new URLSearchParams()
  if (opts.status) q.set('status', opts.status)
  if (opts.brandName) q.set('brandName', opts.brandName)
  const s = q.toString()
  return s ? `/deals?${s}` : '/deals'
}
