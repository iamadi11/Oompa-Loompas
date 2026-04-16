import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { DealTemplate } from '@oompa/types'
import { serverApiFetch } from '@/lib/server-api-fetch'
import { DealFromTemplateForm } from '@/components/templates/DealFromTemplateForm'

interface Props {
  searchParams: Promise<{ templateId?: string }>
}

export const metadata: Metadata = {
  title: 'New Deal from Template',
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

export default async function NewDealFromTemplatePage({ searchParams }: Props) {
  const { templateId } = await searchParams

  if (!templateId) {
    redirect('/deals/templates' as Route)
  }

  const template = await getTemplate(templateId)

  if (!template) {
    return (
      <div className="max-w-2xl pb-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Create
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-stone-900">
            Template not found
          </h1>
        </div>
        <p className="text-sm text-stone-600 mb-4">
          This template does not exist or may have been deleted.
        </p>
        <Link
          href={'/deals/templates' as Route}
          className="text-sm font-semibold text-brand-800 hover:text-brand-900"
        >
          ← Choose a template
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl pb-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Create
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-stone-900">
          New deal
        </h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          From template:{' '}
          <span className="font-semibold text-stone-800">{template.name}</span>
          {' · '}
          <Link
            href={'/deals/templates' as Route}
            className="text-brand-800 hover:text-brand-900 font-medium"
          >
            Change template
          </Link>
        </p>
      </div>
      <div className="rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card">
        <DealFromTemplateForm template={template} />
      </div>
    </div>
  )
}
