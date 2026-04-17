import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { DashboardSummary } from '@oompa/types'

export const metadata: Metadata = { title: 'Overview' }
import { formatCurrency } from '@oompa/utils'
import { OverviewFetchError } from '@/components/dashboard/OverviewFetchError'
import { PriorityActionsSection } from '@/components/dashboard/PriorityActionsSection'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { SummaryGrid } from '@/components/dashboard/SummaryGrid'
import { RecentDealsList } from '@/components/dashboard/RecentDealsList'
import { resolveHomeOverviewState } from '@/lib/home-page'
import { serverApiFetch } from '@/lib/server-api-fetch'

async function getDashboardData(): Promise<DashboardSummary | null> {
  try {
    const res = await serverApiFetch('/api/v1/dashboard')
    if (res.status === 401) {
      redirect('/login?from=/dashboard')
    }
    if (!res.ok) return null
    const body = (await res.json()) as { data: DashboardSummary }
    return body.data
  } catch {
    return null
  }
}

export default async function HomePage() {
  const data = await getDashboardData()
  const state = resolveHomeOverviewState(data)

  if (state.kind === 'unavailable') {
    return <OverviewFetchError />
  }

  if (state.kind === 'empty') {
    return (
      <div className="flex flex-col gap-8 py-8 sm:py-14 max-w-xl">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600/90">
            Start here
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 leading-[1.15]">
            Your outcomes, composed — not just counted.
          </h1>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
            Track deals and payments in one calm surface. Built for creators who treat their work
            like a studio, not a spreadsheet.
          </p>
        </div>
        <Link
          href="/deals/new"
          className="inline-flex w-fit items-center px-5 py-3 rounded-xl bg-brand-700 text-white text-sm font-semibold shadow-sm border border-brand-800/20 hover:bg-brand-800 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Add your first deal
        </Link>
      </div>
    )
  }

  const { data: dashboard } = state
  const currency = dashboard.dominantCurrency

  return (
    <div className="space-y-8 sm:space-y-10 py-2 sm:py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Today</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Overview
          </h1>
        </div>
        <Link
          href="/deals/new"
          className="inline-flex w-fit items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white text-sm font-semibold shadow-sm border border-brand-800/20 hover:bg-brand-800 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          <span className="text-lg leading-none" aria-hidden="true">
            +
          </span>
          New deal
        </Link>
      </div>

      <PriorityActionsSection
        actions={dashboard.priorityActions}
        totalCount={dashboard.priorityActionsTotalCount}
      />

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Financial summary
        </h2>
        <SummaryGrid>
          <SummaryCard
            label="Contracted"
            value={formatCurrency(dashboard.totalContractedValue, currency)}
            subtext={`${dashboard.totalDealsCount} deal${dashboard.totalDealsCount !== 1 ? 's' : ''}`}
          />
          <SummaryCard
            label="Received"
            value={formatCurrency(dashboard.totalReceivedValue, currency)}
            accent="green"
          />
          <SummaryCard
            label="Outstanding"
            value={formatCurrency(dashboard.totalOutstandingValue, currency)}
            accent={dashboard.overduePaymentsCount > 0 ? 'red' : 'default'}
          />
          <SummaryCard
            label={dashboard.overduePaymentsCount > 0 ? 'Overdue' : 'Active deals'}
            value={
              dashboard.overduePaymentsCount > 0
                ? formatCurrency(dashboard.overduePaymentsValue, currency)
                : String(dashboard.activeDealsCount)
            }
            accent={dashboard.overduePaymentsCount > 0 ? 'red' : 'default'}
            subtext={
              dashboard.overduePaymentsCount > 0
                ? `${dashboard.overduePaymentsCount} payment${dashboard.overduePaymentsCount !== 1 ? 's' : ''} overdue`
                : undefined
            }
          />
        </SummaryGrid>
      </section>

      <section aria-labelledby="recent-deals-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2
            id="recent-deals-heading"
            className="font-display text-lg font-semibold text-stone-900"
          >
            Recent deals
          </h2>
          <Link
            href="/deals"
            className="text-sm font-semibold text-brand-400 hover:text-brand-300 w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            View all
          </Link>
        </div>
        <RecentDealsList deals={dashboard.recentDeals} />
      </section>
    </div>
  )
}
