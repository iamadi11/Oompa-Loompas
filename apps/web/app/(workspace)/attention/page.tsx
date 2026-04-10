import type { Metadata } from 'next'
import Link from 'next/link'
import type { AttentionQueue } from '@oompa/types'
import { ExportAttentionCsvButton } from '@/components/attention/ExportAttentionCsvButton'
import { PriorityActionList } from '@/components/dashboard/PriorityActionList'
import { serverApiFetch } from '@/lib/server-api-fetch'

export const metadata: Metadata = {
  title: 'Attention',
}

const linkClass =
  'text-sm font-semibold text-brand-800 hover:text-brand-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

async function getAttentionQueue(): Promise<AttentionQueue | null> {
  try {
    const res = await serverApiFetch('/api/v1/attention')
    if (!res.ok) return null
    const body = (await res.json()) as { data: AttentionQueue }
    return body.data
  } catch {
    return null
  }
}

export default async function AttentionPage() {
  const data = await getAttentionQueue()

  if (!data) {
    return (
      <div className="py-12 space-y-5 max-w-lg">
        <h1
          className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900"
          aria-describedby="attention-error-desc"
        >
          Attention
        </h1>
        <p id="attention-error-desc" className="text-stone-600 leading-relaxed">
          We could not load your queue. Check your connection and try again.
        </p>
        <Link href="/dashboard" className={`inline-flex ${linkClass}`}>
          Back to overview
        </Link>
      </div>
    )
  }

  if (data.actions.length === 0) {
    return (
      <div className="py-12 space-y-5 max-w-lg">
        <h1
          className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900"
          aria-describedby="attention-empty-desc"
        >
          You are caught up
        </h1>
        <p id="attention-empty-desc" className="text-stone-600 leading-relaxed">
          No overdue payments or deliverables right now. When something slips, it will show up here
          and on your overview.
        </p>
        <Link href="/dashboard" className={`inline-flex ${linkClass}`}>
          Back to overview
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-2 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Queue</p>
          <h1
            className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900"
            aria-describedby="attention-queue-summary"
          >
            Needs your attention
          </h1>
          <p id="attention-queue-summary" className="mt-2 text-sm text-stone-600">
            {data.actions.length} overdue {data.actions.length === 1 ? 'item' : 'items'} — most
            overdue first.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <ExportAttentionCsvButton />
          <Link href="/dashboard" className={`${linkClass} sm:shrink-0 w-fit`}>
            ← Overview
          </Link>
        </div>
      </div>

      <section
        aria-labelledby="attention-queue-list-heading"
        className="rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50/95 via-surface-raised to-amber-50/40 p-4 sm:p-5 shadow-card"
      >
        <h2 id="attention-queue-list-heading" className="sr-only">
          Overdue items
        </h2>
        <PriorityActionList actions={data.actions} className="flex flex-col gap-2" />
      </section>

      <p className="text-sm text-stone-600 leading-relaxed">
        <Link href="/deals?needsAttention=true" className={linkClass}>
          Browse deals with overdue work
        </Link>
        <span className="text-stone-500"> — same filter as the deal list.</span>
      </p>
    </div>
  )
}
