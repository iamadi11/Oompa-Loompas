import Link from 'next/link'
import type { DashboardSummary } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { SummaryCard } from '../components/dashboard/SummaryCard'
import { RecentDealRow } from '../components/dashboard/RecentDealRow'

const API_BASE = process.env['API_URL'] ?? 'http://localhost:3001'

async function getDashboardData(): Promise<DashboardSummary | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/dashboard`, { cache: 'no-store' })
    if (!res.ok) return null
    const body = (await res.json()) as { data: DashboardSummary }
    return body.data
  } catch {
    return null
  }
}

export default async function HomePage() {
  const data = await getDashboardData()

  // Empty state — no deals yet or API unreachable
  if (!data || data.totalDealsCount === 0) {
    return (
      <div className="flex flex-col items-start gap-6 py-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Your revenue, under control.
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Track deals, monitor payments, and never miss a rupee.
          </p>
        </div>
        <Link
          href="/deals/new"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Add your first deal
        </Link>
      </div>
    )
  }

  const currency = data.dominantCurrency

  return (
    <div className="space-y-8 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h1>
        <Link
          href="/deals/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          + New deal
        </Link>
      </div>

      {/* Summary cards */}
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">Financial summary</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard
            label="Contracted"
            value={formatCurrency(data.totalContractedValue, currency)}
            subtext={`${data.totalDealsCount} deal${data.totalDealsCount !== 1 ? 's' : ''}`}
          />
          <SummaryCard
            label="Received"
            value={formatCurrency(data.totalReceivedValue, currency)}
            accent="green"
          />
          <SummaryCard
            label="Outstanding"
            value={formatCurrency(data.totalOutstandingValue, currency)}
            accent={data.overduePaymentsCount > 0 ? 'red' : 'default'}
          />
          <SummaryCard
            label={data.overduePaymentsCount > 0 ? 'Overdue' : 'Active deals'}
            value={
              data.overduePaymentsCount > 0
                ? formatCurrency(data.overduePaymentsValue, currency)
                : String(data.activeDealsCount)
            }
            accent={data.overduePaymentsCount > 0 ? 'red' : 'default'}
            subtext={
              data.overduePaymentsCount > 0
                ? `${data.overduePaymentsCount} payment${data.overduePaymentsCount !== 1 ? 's' : ''} overdue`
                : undefined
            }
          />
        </div>
      </section>

      {/* Recent deals */}
      <section aria-labelledby="recent-deals-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="recent-deals-heading" className="text-base font-semibold text-gray-900">
            Recent deals
          </h2>
          <Link
            href="/deals"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {data.recentDeals.map((deal) => (
            <RecentDealRow key={deal.id} deal={deal} />
          ))}
        </div>
      </section>
    </div>
  )
}
