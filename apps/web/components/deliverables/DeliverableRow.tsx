'use client'

import { useState } from 'react'
import type { Deliverable } from '@oompa/types'
import { formatDate } from '@oompa/utils'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'

interface DeliverableRowProps {
  deliverable: Deliverable
  onUpdate: () => void
}

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

export function DeliverableRow({ deliverable, onUpdate }: DeliverableRowProps) {
  const [updating, setUpdating] = useState(false)

  async function toggleComplete() {
    setUpdating(true)
    const nextStatus = deliverable.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    try {
      await api.updateDeliverable(deliverable.id, { status: nextStatus })
      onUpdate()
    } catch {
      // Parent re-fetch will show current state
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Remove deliverable "${deliverable.title}"? This cannot be undone.`,
      )
    ) {
      return
    }
    setUpdating(true)
    try {
      await api.deleteDeliverable(deliverable.id)
      onUpdate()
    } catch {
      // Parent re-fetch will show current state
    } finally {
      setUpdating(false)
    }
  }

  const isCompleted = deliverable.status === 'COMPLETED'
  const isCancelled = deliverable.status === 'CANCELLED'

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-4 py-3 rounded-xl border shadow-sm ${
        deliverable.isOverdue
          ? 'border-red-200/90 bg-red-50/80'
          : isCompleted
          ? 'border-emerald-200/90 bg-emerald-50/70'
          : 'border-line/70 bg-surface-raised'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-stone-600 bg-stone-200/60 border border-stone-300/50 px-2 py-0.5 rounded-md">
            {PLATFORM_LABELS[deliverable.platform] ?? deliverable.platform}
          </span>
          <span className="text-xs font-semibold text-stone-600 bg-stone-200/60 border border-stone-300/50 px-2 py-0.5 rounded-md">
            {TYPE_LABELS[deliverable.type] ?? deliverable.type}
          </span>
          <span
            className={`text-sm font-medium ${
              isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
            }`}
          >
            {deliverable.title}
          </span>
          {isCompleted && (
            <span className="text-xs font-medium text-green-700">Completed</span>
          )}
          {isCancelled && (
            <span className="text-xs font-medium text-stone-400">Cancelled</span>
          )}
          {deliverable.isOverdue && (
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Overdue</span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          {deliverable.dueDate && (
            <span>
              Due {formatDate(deliverable.dueDate, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {deliverable.completedAt && (
            <span>
              Completed {formatDate(deliverable.completedAt, { day: 'numeric', month: 'short' })}
            </span>
          )}
          {deliverable.notes && (
            <span className="truncate max-w-xs">{deliverable.notes}</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 border-t border-line/50 sm:border-0 pt-2 sm:pt-0">
        {!isCancelled && (
          <Button
            variant="secondary"
            size="sm"
            loading={updating}
            onClick={() => void toggleComplete()}
            aria-label={
              isCompleted
                ? `Undo completion of ${deliverable.title}`
                : `Mark ${deliverable.title} as complete`
            }
          >
            {isCompleted ? 'Undo' : 'Mark complete'}
          </Button>
        )}
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={updating}
          className="text-xs font-medium text-stone-400 hover:text-red-600 transition-colors duration-200 motion-reduce:transition-none disabled:opacity-40 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          aria-label={`Delete deliverable: ${deliverable.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
