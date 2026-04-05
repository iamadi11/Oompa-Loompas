import type { Metadata } from 'next'
import Link from 'next/link'
import type { AttentionQueue } from '@oompa/types'
import { PriorityActionList } from '../../components/dashboard/PriorityActionList'

const API_BASE = process.env['API_URL'] ?? 'http://localhost:3001'

export const metadata: Metadata = {
  title: 'Attention',
}

async function getAttentionQueue(): Promise<AttentionQueue | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/attention`, { cache: 'no-store' })
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
      <div className="py-12 space-y-4">
        <h1
          className="text-2xl font-bold tracking-tight text-gray-900"
          aria-describedby="attention-error-desc"
        >
          Attention
        </h1>
        <p id="attention-error-desc" className="text-gray-600">
          We could not load your queue. Check your connection and try again.
        </p>
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Back to overview
        </Link>
      </div>
    )
  }

  if (data.actions.length === 0) {
    return (
      <div className="py-12 space-y-4 max-w-lg">
        <h1
          className="text-2xl font-bold tracking-tight text-gray-900"
          aria-describedby="attention-empty-desc"
        >
          You are caught up
        </h1>
        <p id="attention-empty-desc" className="text-gray-600">
          No overdue payments or deliverables right now. When something slips, it will show up here and on your
          overview.
        </p>
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Back to overview
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-gray-900"
            aria-describedby="attention-queue-summary"
          >
            Needs your attention
          </h1>
          <p id="attention-queue-summary" className="mt-1 text-sm text-gray-600">
            {data.actions.length} overdue {data.actions.length === 1 ? 'item' : 'items'} — most overdue first.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:shrink-0"
        >
          ← Overview
        </Link>
      </div>

      <section
        aria-labelledby="attention-queue-list-heading"
        className="rounded-xl border border-amber-200 bg-amber-50/80 p-4"
      >
        <h2 id="attention-queue-list-heading" className="sr-only">
          Overdue items
        </h2>
        <PriorityActionList actions={data.actions} className="flex flex-col gap-2" />
      </section>

      <p className="text-sm text-gray-600">
        <Link
          href="/deals?needsAttention=true"
          className="font-medium text-brand-600 hover:text-brand-700 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Browse deals with overdue work
        </Link>
        <span className="text-gray-500"> — same filter as the deal list.</span>
      </p>
    </div>
  )
}
