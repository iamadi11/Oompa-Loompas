import Link from 'next/link'
import type { Deal } from '@oompa/types'
import { DealList } from '../../components/deals/DealList'

async function getDeals(): Promise<Deal[]> {
  const apiBase = process.env['API_URL'] ?? 'http://localhost:3001'
  try {
    const res = await fetch(`${apiBase}/api/v1/deals?limit=100&sortOrder=desc`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const body = (await res.json()) as { data: Deal[] }
    return body.data
  } catch {
    return []
  }
}

export default async function DealsPage() {
  const deals = await getDeals()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Deals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {deals.length} deal{deals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/deals/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add deal
        </Link>
      </div>
      <DealList deals={deals} />
    </div>
  )
}
