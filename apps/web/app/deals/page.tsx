import Link from 'next/link'
import type { Metadata } from 'next'
import type { Deal } from '@oompa/types'
import { DealList } from '../../components/deals/DealList'

async function getDeals(needsAttention: boolean): Promise<{ deals: Deal[]; loadError: string | null }> {
  const apiBase = process.env['API_URL'] ?? 'http://localhost:3001'
  const qs = new URLSearchParams({ limit: '100', sortOrder: 'desc' })
  if (needsAttention) qs.set('needsAttention', 'true')
  try {
    const res = await fetch(`${apiBase}/api/v1/deals?${qs.toString()}`, {
      cache: 'no-store',
    })
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
  searchParams: Record<string, string | string[] | undefined>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const raw = searchParams['needsAttention']
  const needsAttention = raw === 'true' || raw === '1'
  return {
    title: needsAttention ? 'Needs attention' : 'Deals',
  }
}

export default async function DealsPage({ searchParams }: Props) {
  const raw = searchParams['needsAttention']
  const needsAttention = raw === 'true' || raw === '1'
  const { deals, loadError } = await getDeals(needsAttention)

  return (
    <div>
      {loadError && (
        <div
          className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900"
          role="status"
          aria-live="polite"
        >
          {loadError}
        </div>
      )}
      <nav className="flex flex-wrap items-center gap-2 text-sm mb-4" aria-label="Deal filters">
        <Link
          href="/deals"
          className={`rounded-md px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
            !needsAttention
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
          aria-current={!needsAttention ? 'page' : undefined}
        >
          All deals
        </Link>
        <Link
          href="/deals?needsAttention=true"
          className={`rounded-md px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
            needsAttention
              ? 'bg-amber-900 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
          aria-current={needsAttention ? 'page' : undefined}
        >
          Needs attention
        </Link>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Deals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add deal
          </Link>
        )}
      </div>
      <DealList deals={deals} emptyVariant={needsAttention ? 'needsAttention' : 'all'} />
    </div>
  )
}
