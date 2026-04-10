import Link from 'next/link'
import type { Metadata } from 'next'
import type { DealBrandSummary } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { getServerApiBaseUrl } from '@/lib/get-server-api-base-url'
import { serverApiFetch } from '@/lib/server-api-fetch'

export const metadata: Metadata = {
  title: 'Brands',
}

const linkClass =
  'text-sm font-semibold text-brand-800 hover:text-brand-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

async function getBrands(): Promise<{ rows: DealBrandSummary[]; loadError: string | null }> {
  const apiBase = getServerApiBaseUrl()
  try {
    const res = await serverApiFetch('/api/v1/deals/brands')
    if (!res.ok) {
      return {
        rows: [],
        loadError: `Could not load brands (HTTP ${res.status}). Check that the API is running (${apiBase}).`,
      }
    }
    const body = (await res.json()) as { data: DealBrandSummary[] }
    return { rows: body.data ?? [], loadError: null }
  } catch {
    return {
      rows: [],
      loadError: `Could not reach the API at ${apiBase}. Start the API server if you are developing locally.`,
    }
  }
}

function formatTotals(row: DealBrandSummary): string {
  return row.contractedTotals
    .map((t) => formatCurrency(t.amount, t.currency))
    .join(' · ')
}

export default async function BrandsPage() {
  const { rows, loadError } = await getBrands()

  if (loadError) {
    return (
      <div className="py-12 space-y-5 max-w-lg">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          Brands
        </h1>
        <p className="text-stone-600 leading-relaxed" role="status">
          {loadError}
        </p>
        <Link href="/deals" className={`inline-flex ${linkClass}`}>
          Back to deals
        </Link>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="py-12 space-y-5 max-w-lg">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          Brands
        </h1>
        <p className="text-stone-600 leading-relaxed">
          When you add deals with brand names, they will appear here with deal counts and contracted value
          per currency.
        </p>
        <Link
          href="/deals/new"
          className="inline-flex w-fit items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white text-sm font-semibold shadow-sm border border-brand-800/20 hover:bg-brand-800 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Add deal
        </Link>
        <div>
          <Link href="/deals" className={`inline-flex ${linkClass}`}>
            Back to deals
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-1 sm:py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Portfolio</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Brands
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {rows.length} {rows.length === 1 ? 'brand' : 'brands'} from your deals — contracted value by
            currency (no mixing across currencies).
          </p>
        </div>
        <Link href="/deals" className={`${linkClass} sm:shrink-0 w-fit`}>
          ← Deals
        </Link>
      </div>

      <div className="rounded-2xl border border-line/80 bg-surface-raised shadow-card overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="border-b border-line/80 bg-surface text-stone-600">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Brand
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">
                Deals
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Contracted
              </th>
              <th scope="col" className="px-4 py-3 font-semibold w-[1%] whitespace-nowrap">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.brandName}
                className="border-b border-line/60 last:border-0 hover:bg-surface/80 transition-colors"
              >
                <th scope="row" className="px-4 py-3 font-medium text-stone-900">
                  {row.brandName}
                </th>
                <td className="px-4 py-3 text-right tabular-nums text-stone-700">{row.dealCount}</td>
                <td className="px-4 py-3 text-stone-700">{formatTotals(row)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/deals?brandName=${encodeURIComponent(row.brandName)}`}
                    className={`${linkClass} whitespace-nowrap`}
                  >
                    View deals
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
