import Link from 'next/link'
import type { Metadata } from 'next'
import type { Deal } from '@oompa/types'
import { DealList } from '@/components/deals/DealList'
import { isDealsNeedsAttentionFilter } from '@/lib/deals-page'
import { getServerApiBaseUrl } from '@/lib/get-server-api-base-url'
import { serverApiFetch } from '@/lib/server-api-fetch'

async function getDeals(
  needsAttention: boolean,
): Promise<{ deals: Deal[]; loadError: string | null }> {
  const apiBase = getServerApiBaseUrl()
  const qs = new URLSearchParams({ limit: '100', sortOrder: 'desc' })
  if (needsAttention) qs.set('needsAttention', 'true')
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
  return {
    title: needsAttention ? 'Needs attention' : 'Deals',
  }
}

const filterPillBase =
  'rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export default async function DealsPage({ searchParams }: Props) {
  const sp = await searchParams
  const needsAttention = isDealsNeedsAttentionFilter(sp)
  const { deals, loadError } = await getDeals(needsAttention)

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
      <nav className="flex flex-wrap items-center gap-2 text-sm mb-5" aria-label="Deal filters">
        <Link
          href="/deals"
          className={`${filterPillBase} ${
            !needsAttention
              ? 'bg-brand-900 text-white shadow-sm border border-brand-800'
              : 'bg-surface-raised text-stone-700 border border-line/90 hover:bg-surface shadow-sm'
          }`}
          aria-current={!needsAttention ? 'page' : undefined}
        >
          All deals
        </Link>
        <Link
          href="/deals?needsAttention=true"
          className={`${filterPillBase} ${
            needsAttention
              ? 'bg-amber-900 text-white shadow-sm border border-amber-950/30'
              : 'bg-surface-raised text-stone-700 border border-line/90 hover:bg-surface shadow-sm'
          }`}
          aria-current={needsAttention ? 'page' : undefined}
        >
          Needs attention
        </Link>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Pipeline
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Deals
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            {needsAttention
              ? deals.length === 1
                ? '1 deal with overdue work'
                : `${deals.length} deals with overdue work`
              : deals.length === 1
                ? '1 deal'
                : `${deals.length} deals`}
          </p>
        </div>
        {!loadError && (needsAttention || deals.length > 0) && (
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
        )}
      </div>
      <DealList deals={deals} emptyVariant={needsAttention ? 'needsAttention' : 'all'} />
    </div>
  )
}
