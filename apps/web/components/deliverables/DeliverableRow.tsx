'use client'

import { useState } from 'react'
import type { Deliverable } from '@oompa/types'
import { formatDate } from '@oompa/utils'
import { api } from '../../lib/api'
import { Button } from '../ui/Button'

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
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg border ${
        deliverable.isOverdue
          ? 'border-red-200 bg-red-50'
          : isCompleted
          ? 'border-green-200 bg-green-50'
          : 'border-gray-100 bg-white'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {PLATFORM_LABELS[deliverable.platform] ?? deliverable.platform}
          </span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {TYPE_LABELS[deliverable.type] ?? deliverable.type}
          </span>
          <span
            className={`text-sm font-medium ${
              isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {deliverable.title}
          </span>
          {isCompleted && (
            <span className="text-xs font-medium text-green-700">Completed</span>
          )}
          {isCancelled && (
            <span className="text-xs font-medium text-gray-400">Cancelled</span>
          )}
          {deliverable.isOverdue && (
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Overdue</span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-4 text-xs text-gray-500">
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

      <div className="flex items-center gap-2 shrink-0">
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
          onClick={() => void handleDelete()}
          disabled={updating}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
          aria-label={`Delete deliverable: ${deliverable.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
