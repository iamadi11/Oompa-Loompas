import Link from 'next/link'
import type { Metadata, Route } from 'next'
import type { DealTemplate } from '@oompa/types'
import { serverApiFetch } from '@/lib/server-api-fetch'
import { getServerApiBaseUrl } from '@/lib/get-server-api-base-url'
import { TemplateList } from '@/components/templates/TemplateList'

export const metadata: Metadata = {
  title: 'Templates',
}

async function getTemplates(): Promise<{ templates: DealTemplate[]; loadError: string | null }> {
  const apiBase = getServerApiBaseUrl()
  try {
    const res = await serverApiFetch('/api/v1/templates')
    if (!res.ok) {
      return {
        templates: [],
        loadError: `Could not load templates (HTTP ${res.status}). Check that the API is running (${apiBase}).`,
      }
    }
    const body = (await res.json()) as { data: DealTemplate[] }
    return { templates: body.data ?? [], loadError: null }
  } catch {
    return {
      templates: [],
      loadError: `Could not reach the API at ${apiBase}. Start the API server if you are developing locally.`,
    }
  }
}

const btnClass =
  'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white text-sm font-semibold shadow-sm border border-brand-800/20 hover:bg-brand-800 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const linkClass =
  'text-sm font-semibold text-brand-800 hover:text-brand-900 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export default async function TemplatesPage() {
  const { templates, loadError } = await getTemplates()

  if (loadError) {
    return (
      <div className="py-12 space-y-5 max-w-lg">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          Templates
        </h1>
        <p className="text-stone-600 leading-relaxed" role="status">
          {loadError}
        </p>
        <Link href={'/deals' as Route} className={`inline-flex ${linkClass}`}>
          Back to deals
        </Link>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="py-12 space-y-5 max-w-lg">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          Templates
        </h1>
        <p className="text-stone-600 leading-relaxed">
          Save your recurring deal structures — deliverables, payment split — and reuse them in
          seconds. No re-entering the same campaign setup every time.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={'/deals/templates/new' as Route} className={btnClass}>
            New template
          </Link>
          <Link href={'/deals' as Route} className={`inline-flex self-center ${linkClass}`}>
            ← Deals
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-1 sm:py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Deal Templates
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Templates
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {templates.length} {templates.length === 1 ? 'template' : 'templates'} — reuse your
            recurring campaign structures.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:shrink-0">
          <Link href={'/deals/templates/new' as Route} className={btnClass}>
            New template
          </Link>
          <Link href={'/deals' as Route} className={linkClass}>
            ← Deals
          </Link>
        </div>
      </div>

      <TemplateList initialTemplates={templates} />
    </div>
  )
}
