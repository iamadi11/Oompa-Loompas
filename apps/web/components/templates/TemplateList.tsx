'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import type { DealTemplate } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { api } from '@/lib/api'

interface Props {
  initialTemplates: DealTemplate[]
}

export function TemplateList({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete template "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    setDeleteError(null)
    const prev = templates
    setTemplates((t) => t.filter((x) => x.id !== id))
    try {
      await api.deleteTemplate(id)
    } catch {
      setTemplates(prev)
      setDeleteError('Failed to delete template. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4 rounded-2xl border border-dashed border-line-strong/70 bg-surface-raised/50">
        <p className="text-sm font-semibold text-stone-600">All templates deleted</p>
        <p className="mt-1 text-sm text-stone-500">
          Create a new template to get started.
        </p>
        <Link
          href={'/deals/templates/new' as Route}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          New template
        </Link>
      </div>
    )
  }

  return (
    <div>
      {deleteError && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {deleteError}
        </p>
      )}
      <div className="grid gap-3 sm:gap-4">
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            deleting={deletingId === t.id}
            onDelete={() => void handleDelete(t.id, t.name)}
          />
        ))}
      </div>
    </div>
  )
}

function TemplateCard({
  template,
  deleting,
  onDelete,
}: {
  template: DealTemplate
  deleting: boolean
  onDelete: () => void
}) {
  const paymentSummary = template.payments
    .map((p) => `${p.percentage}%`)
    .join(' · ')

  const linkClass =
    'text-sm font-semibold text-brand-800 hover:text-brand-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

  return (
    <div className="rounded-2xl border border-line/90 bg-surface-raised p-4 sm:p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-base sm:text-lg font-semibold text-stone-900 truncate">
            {template.name}
          </h3>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500">
            {template.deliverables.length > 0 && (
              <span>
                {template.deliverables.length}{' '}
                {template.deliverables.length === 1 ? 'deliverable' : 'deliverables'}
              </span>
            )}
            {paymentSummary && <span>{paymentSummary} payment split</span>}
            {template.defaultValue != null && (
              <span className="font-medium text-stone-600">
                {formatCurrency(template.defaultValue, template.currency)} default
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/deals/new-from-template?templateId=${template.id}` as Route}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Use
          </Link>
          <Link
            href={`/deals/templates/${template.id}` as Route}
            className={`${linkClass} text-xs`}
          >
            Edit
          </Link>
          <button
            onClick={onDelete}
            disabled={deleting}
            aria-label={`Delete template ${template.name}`}
            className="text-xs font-semibold text-red-700 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
      {template.deliverables.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {template.deliverables.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700"
            >
              {d.platform} · {d.type}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
