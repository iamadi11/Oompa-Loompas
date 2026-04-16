import type { Metadata, Route } from 'next'
import Link from 'next/link'
import type { DealTemplate } from '@oompa/types'
import { serverApiFetch } from '@/lib/server-api-fetch'
import { TemplateForm } from '@/components/templates/TemplateForm'

interface Props {
  params: Promise<{ id: string }>
}

async function getTemplate(id: string): Promise<DealTemplate | null> {
  try {
    const res = await serverApiFetch(`/api/v1/templates/${id}`)
    if (!res.ok) return null
    const body = (await res.json()) as { data: DealTemplate }
    return body.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const template = await getTemplate(id)
  return { title: template ? `Edit — ${template.name}` : 'Template not found' }
}

export default async function TemplateEditPage({ params }: Props) {
  const { id } = await params
  const template = await getTemplate(id)

  if (!template) {
    return (
      <div className="py-12 space-y-5 max-w-lg">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          Template not found
        </h1>
        <p className="text-stone-600">
          This template does not exist or may have been deleted.
        </p>
        <Link
          href={'/deals/templates' as Route}
          className="text-sm font-semibold text-brand-800 hover:text-brand-900"
        >
          ← Templates
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl pb-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Templates
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-stone-900">
          {template.name}
        </h1>
      </div>
      <div className="rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card">
        <TemplateForm mode="edit" template={template} />
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
