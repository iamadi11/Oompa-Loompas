import type { Metadata } from 'next'
import { DealForm } from '@/components/deals/DealForm'

export const metadata: Metadata = {
  title: 'New deal',
}

const panelClass =
  'rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card'

export default function NewDealPage() {
  return (
    <div className="max-w-2xl pb-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Create</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          New deal
        </h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          Record a brand deal. You can update status and add payments later.
        </p>
      </div>
      <div className={panelClass}>
        <DealForm mode="create" />
      </div>
    </div>
  )
}
