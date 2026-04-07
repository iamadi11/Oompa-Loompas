import type { Metadata } from 'next'
import { cache } from 'react'
import type { Deal, Payment, Deliverable } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { StatusBadge } from '@/components/ui/Badge'
import { DealForm } from '@/components/deals/DealForm'
import { DealNotFoundContent } from '@/components/deals/DealNotFoundContent'
import { PaymentSection } from '@/components/payments/PaymentSection'
import { DeliverableSection } from '@/components/deliverables/DeliverableSection'
import { serverApiFetch } from '@/lib/server-api-fetch'

interface Props {
  params: Promise<{ id: string }>
}

const panelClass =
  'rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card'

async function loadDeal(id: string): Promise<Deal | null> {
  try {
    const res = await serverApiFetch(`/api/v1/deals/${id}`)
    if (res.status === 404) return null
    if (!res.ok) return null
    const body = (await res.json()) as { data: Deal }
    return body.data
  } catch {
    return null
  }
}

/** Dedupes `GET /deals/:id` when metadata + page both need the deal in one RSC request. */
const getDeal = cache(loadDeal)

async function getPayments(dealId: string): Promise<Payment[]> {
  try {
    const res = await serverApiFetch(`/api/v1/deals/${dealId}/payments`)
    if (!res.ok) return []
    const body = (await res.json()) as { data: Payment[] }
    return body.data
  } catch {
    return []
  }
}

async function getDeliverables(dealId: string): Promise<Deliverable[]> {
  try {
    const res = await serverApiFetch(`/api/v1/deals/${dealId}/deliverables`)
    if (!res.ok) return []
    const body = (await res.json()) as { data: Deliverable[] }
    return body.data
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const deal = await getDeal(id)
  // Root layout title template appends short app name; keep segment title to the deal only.
  return {
    title: deal ? deal.title : 'Deal not found',
  }
}

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params
  const [deal, payments, deliverables] = await Promise.all([
    getDeal(id),
    getPayments(id),
    getDeliverables(id),
  ])
  if (!deal) {
    return <DealNotFoundContent />
  }

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      <div className="mb-2">
        <p className="text-[0.65rem] font-semibold text-stone-500 uppercase tracking-[0.14em]">{deal.brandName}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mt-2">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 flex-1 leading-tight">
            {deal.title}
          </h1>
          <StatusBadge status={deal.status} />
        </div>
        <p className="text-2xl sm:text-3xl font-bold tabular-nums text-stone-900 mt-4 tracking-tight">
          {formatCurrency(deal.value, deal.currency)}
        </p>
      </div>

      <div className={panelClass}>
        <DeliverableSection dealId={deal.id} initialDeliverables={deliverables} />
      </div>

      <div className={panelClass}>
        <PaymentSection
          dealId={deal.id}
          dealTitle={deal.title}
          brandName={deal.brandName}
          dealValue={deal.value}
          dealCurrency={deal.currency}
          initialPayments={payments}
        />
      </div>

      <div className={panelClass}>
        <h2 className="font-display text-lg font-semibold text-stone-900 mb-5">Edit deal</h2>
        <DealForm deal={deal} mode="edit" />
      </div>
    </div>
  )
}
