import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { TemplateForm } from '@/components/templates/TemplateForm'

export const metadata: Metadata = {
  title: 'New Template',
}

export default function NewTemplatePage() {
  return (
    <div className="max-w-2xl pb-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Templates
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-stone-900">
          New template
        </h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          Save a reusable deal structure with deliverables and payment milestones.
        </p>
      </div>
      <div className="rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card">
        <TemplateForm mode="create" />
      </div>
      <div className="mt-4">
        <Link
          href={'/deals/templates' as Route}
          className="text-sm font-semibold text-brand-800 hover:text-brand-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          ← Templates
        </Link>
      </div>
    </div>
  )
}
