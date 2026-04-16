import Link from 'next/link'
import type { Metadata, Route } from 'next'
import type { Deal, DealStatus } from '@oompa/types'
import { DealList } from '@/components/deals/DealList'
import { DealPipelineStrip } from '@/components/deals/DealPipelineStrip'
import { ExportDealsCsvButton } from '@/components/deals/ExportDealsCsvButton'
import { ExportPaymentsCsvButton } from '@/components/deals/ExportPaymentsCsvButton'
import { ExportDeliverablesCsvButton } from '@/components/deals/ExportDeliverablesCsvButton'
import {
  isDealsNeedsAttentionFilter,
  getDealStatusFilter,
  getDealBrandFilter,
  dealsPageHrefWithoutBrandFilter,
  dealsListSearchHref,
  computeStatusCounts,
} from '@/lib/deals-page'
import { getServerApiBaseUrl } from '@/lib/get-server-api-base-url'
import { serverApiFetch } from '@/lib/server-api-fetch'

async function getDeals(
  opts: { needsAttention?: boolean; brandName?: string } = {},
): Promise<{ deals: Deal[]; loadError: string | null }> {
  const apiBase = getServerApiBaseUrl()
  const qs = new URLSearchParams({ limit: '100', sortOrder: 'desc' })
  if (opts.needsAttention) qs.set('needsAttention', 'true')
  if (opts.brandName !== undefined && opts.brandName.trim().length > 0) {
    qs.set('brandName', opts.brandName.trim())
  }
  try {
    const res = await serverApiFetch(`/api/v1/deals?${qs.toString()}`)
    if (!res.ok) {
      return {
        deals: [],
        loadError: `Could not load deals (HTTP ${res.status}). Check that the API is running and API_URL matches (${apiBase}).`,
      }
    }
    const body = (await res.json()) as { data: Deal[] }
    return { deals: body.data ?? [], loadError: null }
  } catch {
    return {
      deals: [],
      loadError: `Could not reach the API at ${apiBase}. Start the API server (for example from the repo root: pnpm --filter @oompa/api dev).`,
    }
  }
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams
  const needsAttention = isDealsNeedsAttentionFilter(sp)
  const statusFilter = getDealStatusFilter(sp)
  const brandFilter = getDealBrandFilter(sp)
  if (brandFilter) return { title: `${brandFilter} — Deals` }
  if (needsAttention) return { title: 'Needs attention' }
  if (statusFilter)
    return { title: `${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} deals` }
  return { title: 'Deals' }
}

const filterPillBase =
  'rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export default async function DealsPage({ searchParams }: Props) {
  const sp = await searchParams
  const needsAttention = isDealsNeedsAttentionFilter(sp)
  const statusFilter = getDealStatusFilter(sp)
  const brandFilter = getDealBrandFilter(sp)
  const brandQueryOpt = brandFilter ?? undefined

  let allDeals: Deal[]
  let displayDeals: Deal[]
  let statusCounts: Record<DealStatus, number> | null = null
  let loadError: string | null

  if (needsAttention) {
    // Needs-attention mode: API does the join-based filtering; no pipeline strip
    const result = await getDeals({ needsAttention: true, brandName: brandQueryOpt })
    allDeals = result.deals
    displayDeals = result.deals
    loadError = result.loadError
  } else {
    // Pipeline mode: fetch all deals, compute counts, filter in component
    const result = await getDeals({ brandName: brandQueryOpt })
    allDeals = result.deals
    loadError = result.loadError
    statusCounts = computeStatusCounts(allDeals)
    displayDeals = statusFilter ? allDeals.filter((d) => d.status === statusFilter) : allDeals
  }

  const dealCountLabel = needsAttention
    ? displayDeals.length === 1
      ? '1 deal with overdue work'
      : `${displayDeals.length} deals with overdue work`
    : statusFilter
      ? displayDeals.length === 1
        ? '1 deal'
        : `${displayDeals.length} deals`
      : allDeals.length === 1
        ? '1 deal'
        : `${allDeals.length} deals`

  return (
    <div className="py-1 sm:py-2">
      {loadError && (
        <div
          className="mb-6 rounded-2xl bg-amber-50/90 border border-amber-200/80 px-4 py-3 text-sm text-amber-950 shadow-sm"
          role="status"
          aria-live="polite"
        >
          {loadError}
        </div>
      )}
      <nav className="flex flex-wrap items-center gap-2 text-sm mb-5" aria-label="Deal view mode">
        <Link
          href={dealsListSearchHref({ status: null, brandName: brandFilter }) as Route}
          className={`${filterPillBase} ${
            !needsAttention
              ? 'bg-brand-900 text-white shadow-sm border border-brand-800'
              : 'bg-surface-raised text-stone-700 border border-line/90 hover:bg-surface shadow-sm'
          }`}
          aria-current={!needsAttention ? 'page' : undefined}
        >
          Pipeline
        </Link>
        <Link
          href={
            (brandFilter
              ? `/deals?needsAttention=true&brandName=${encodeURIComponent(brandFilter)}`
              : '/deals?needsAttention=true') as Route
          }
          className={`${filterPillBase} ${
            needsAttention
              ? 'bg-amber-900 text-white shadow-sm border border-amber-950/30'
              : 'bg-surface-raised text-stone-700 border border-line/90 hover:bg-surface shadow-sm'
          }`}
          aria-current={needsAttention ? 'page' : undefined}
        >
          Needs attention
        </Link>
        <Link
          href="/deals/brands"
          className={`${filterPillBase} bg-surface-raised text-stone-700 border border-line/90 hover:bg-surface shadow-sm`}
        >
          Brands
        </Link>
        <Link
          href="/deals/templates"
          className={`${filterPillBase} bg-surface-raised text-stone-700 border border-line/90 hover:bg-surface shadow-sm`}
        >
          Templates
        </Link>
      </nav>

      {brandFilter && (
        <p className="mb-4 text-sm text-stone-600" role="status">
          Brand filter: <span className="font-semibold text-stone-900">{brandFilter}</span>
          {' · '}
          <Link
            href={dealsPageHrefWithoutBrandFilter({ needsAttention, statusFilter }) as Route}
            className="font-semibold text-brand-800 hover:text-brand-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Clear brand filter
          </Link>
        </p>
      )}

      {statusCounts !== null && (
        <DealPipelineStrip
          counts={statusCounts}
          activeStatus={statusFilter}
          brandName={brandFilter}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            {needsAttention ? 'Attention' : 'Pipeline'}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Deals
          </h1>
          <p className="text-sm text-stone-600 mt-1">{dealCountLabel}</p>
        </div>
        {!loadError && (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 w-full sm:w-auto">
            <ExportDealsCsvButton />
            <ExportPaymentsCsvButton />
            <ExportDeliverablesCsvButton />
            {(needsAttention || allDeals.length > 0) && (
              <>
                <Link
                  href="/deals/templates"
                  className="inline-flex w-fit items-center gap-2 px-4 py-2.5 rounded-xl border border-line-strong bg-surface-raised text-stone-700 text-sm font-semibold shadow-sm hover:bg-surface transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  From template
                </Link>
                <Link
                  href="/deals/new"
                  className="inline-flex w-fit items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white text-sm font-semibold shadow-sm border border-brand-800/20 hover:bg-brand-800 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add deal
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      <DealList deals={displayDeals} emptyVariant={needsAttention ? 'needsAttention' : 'all'} />
    </div>
  )
}
