import Link from 'next/link'
import type { Metadata, Route } from 'next'
import { formatCurrency } from '@oompa/utils'
import { StatusBadge } from '@/components/ui/Badge'
import { BrandProfileForm } from '@/components/brands/BrandProfileForm'
import { serverApiFetch } from '@/lib/server-api-fetch'
import type { BrandProfileView } from '@/lib/api'

interface Props {
  params: Promise<{ brandName: string }>
}

const panelClass = 'rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card'

const linkClass =
  'text-sm font-semibold text-brand-800 hover:text-brand-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

async function loadBrandProfile(brandName: string): Promise<BrandProfileView | null> {
  try {
    const res = await serverApiFetch(`/api/v1/brands/${encodeURIComponent(brandName)}`)
    if (res.status === 404) return null
    if (!res.ok) return null
    const body = (await res.json()) as { data: BrandProfileView }
    return body.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandName } = await params
  return { title: decodeURIComponent(brandName) }
}

export default async function BrandProfilePage({ params }: Props) {
  const { brandName: encodedName } = await params
  const brandName = decodeURIComponent(encodedName)
  const view = await loadBrandProfile(brandName)

  if (!view) {
    return (
      <div className="py-12 space-y-5 max-w-lg">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          Brand not found
        </h1>
        <p className="text-stone-600 leading-relaxed">
          No deals found for &ldquo;{brandName}&rdquo;. Check the brand name or add a deal with this
          brand.
        </p>
        <Link href="/deals/brands" className={`inline-flex ${linkClass}`}>
          ← All brands
        </Link>
      </div>
    )
  }

  const { stats, profile, recentDeals } = view

  const contractedLabel =
    stats.contractedTotals.length > 0
      ? stats.contractedTotals.map((t) => formatCurrency(t.amount, t.currency)).join(' · ')
      : '—'

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      {/* Header */}
      <div>
        <Link
          href="/deals/brands"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
        >
          ← Brands
        </Link>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 break-words">
          {brandName}
        </h1>
      </div>

      {/* Stats */}
      <div className={panelClass}>
        <h2 className="text-base font-semibold text-stone-900 mb-4">Overview</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Deals</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-stone-900">
              {stats.totalDeals}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Contracted
            </dt>
            <dd className="mt-1 text-base font-semibold text-stone-900">{contractedLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Overdue payments
            </dt>
            <dd className="mt-1">
              {stats.overduePaymentsCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                  {stats.overduePaymentsCount}
                </span>
              ) : (
                <span className="text-sm text-stone-500">None</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Contact info (client — editable) */}
      <BrandProfileForm brandName={brandName} initial={profile} />

      {/* Recent deals */}
      {recentDeals.length > 0 && (
        <section aria-label="Recent deals">
          <div className={panelClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-stone-900">Recent deals</h2>
              <Link
                href={`/deals?brandName=${encodeURIComponent(brandName)}` as Route}
                className={linkClass}
              >
                View all
              </Link>
            </div>
            <ul className="space-y-3" role="list">
              {recentDeals.map((deal) => (
                <li key={deal.id}>
                  <Link
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 -mx-1 hover:bg-surface/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    <span className="text-sm font-medium text-stone-900 truncate">
                      {deal.title}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-sm tabular-nums text-stone-600">
                        {formatCurrency(deal.value, deal.currency)}
                      </span>
                      <StatusBadge status={deal.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {recentDeals.length === 0 && (
        <div className={panelClass}>
          <p className="text-sm text-stone-500">No deals yet for this brand.</p>
        </div>
      )}
    </div>
  )
}
