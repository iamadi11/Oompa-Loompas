'use client'

import { useState } from 'react'
import type { DeliverableApprovalView } from '@oompa/types'
import { api } from '@/lib/api'

const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: 'Instagram',
  YOUTUBE: 'YouTube',
  TWITTER: 'Twitter',
  LINKEDIN: 'LinkedIn',
  PODCAST: 'Podcast',
  BLOG: 'Blog',
  OTHER: 'Other',
}

const TYPE_LABELS: Record<string, string> = {
  POST: 'Post',
  REEL: 'Reel',
  STORY: 'Story',
  VIDEO: 'Video',
  INTEGRATION: 'Integration',
  MENTION: 'Mention',
  ARTICLE: 'Article',
  OTHER: 'Other',
}

interface Props {
  token: string
  initial: DeliverableApprovalView
}

export function ApprovalAction({ token, initial }: Props) {
  const [view, setView] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isApproved = view.brandApprovedAt != null

  async function handleApprove() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.submitApproval(token)
      setView(res.data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          {/* Brand + deal context */}
          <p className="text-[0.65rem] font-semibold text-stone-500 uppercase tracking-[0.14em]">
            {view.dealBrandName}
          </p>
          <h1 className="mt-1 font-display text-xl sm:text-2xl font-semibold tracking-tight text-stone-900 leading-tight">
            {view.dealTitle}
          </h1>

          {/* Deliverable details */}
          <div className="mt-5 rounded-xl border border-stone-100 bg-stone-50 p-4">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-[0.1em] mb-2">
              Deliverable
            </p>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900">{view.title}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {PLATFORM_LABELS[view.platform] ?? view.platform} ·{' '}
                  {TYPE_LABELS[view.type] ?? view.type}
                </p>
                {view.dueDate && (
                  <p className="text-xs text-stone-400 mt-1">
                    Due {new Date(view.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action area */}
          <div className="mt-6" aria-live="polite">
            {isApproved ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-700">Approved</p>
                <p className="text-xs text-emerald-600 mt-1">
                  Confirmed on{' '}
                  {new Date(view.brandApprovedAt!).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-stone-600 mb-4 text-center">
                  Confirm that you have reviewed and approved this deliverable.
                </p>
                <button
                  type="button"
                  onClick={() => void handleApprove()}
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  {loading ? 'Confirming…' : 'Confirm Approval'}
                </button>
                {error && (
                  <p className="mt-3 text-xs text-red-600 text-center" role="alert">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">Shared via Oompa</p>
      </div>
    </div>
  )
}
