import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Deal, Payment, Deliverable } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { StatusBadge } from '../../../components/ui/Badge'
import { DealForm } from '../../../components/deals/DealForm'
import { PaymentSection } from '../../../components/payments/PaymentSection'
import { DeliverableSection } from '../../../components/deliverables/DeliverableSection'

interface Props {
  params: { id: string }
}

const API_BASE = process.env['API_URL'] ?? 'http://localhost:3001'

async function getDeal(id: string): Promise<Deal | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${id}`, { cache: 'no-store' })
    if (res.status === 404) return null
    if (!res.ok) return null
    const body = (await res.json()) as { data: Deal }
    return body.data
  } catch {
    return null
  }
}

async function getPayments(dealId: string): Promise<Payment[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${dealId}/payments`, { cache: 'no-store' })
    if (!res.ok) return []
    const body = (await res.json()) as { data: Payment[] }
    return body.data
  } catch {
    return []
  }
}

async function getDeliverables(dealId: string): Promise<Deliverable[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/deals/${dealId}/deliverables`, { cache: 'no-store' })
    if (!res.ok) return []
    const body = (await res.json()) as { data: Deliverable[] }
    return body.data
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const deal = await getDeal(params.id)
  // Root layout template is "%s · Revenue"; do not embed "Revenue" again in the segment title.
  return {
    title: deal ? deal.title : 'Deal not found',
  }
}

export default async function DealDetailPage({ params }: Props) {
  const [deal, payments, deliverables] = await Promise.all([
    getDeal(params.id),
    getPayments(params.id),
    getDeliverables(params.id),
  ])
  if (!deal) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{deal.brandName}</p>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex-1">
            {deal.title}
          </h1>
          <StatusBadge status={deal.status} />
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-3">
          {formatCurrency(deal.value, deal.currency)}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <DeliverableSection
          dealId={deal.id}
          initialDeliverables={deliverables}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <PaymentSection
          dealId={deal.id}
          dealValue={deal.value}
          dealCurrency={deal.currency}
          initialPayments={payments}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Edit deal</h2>
        <DealForm deal={deal} mode="edit" />
      </div>
    </div>
  )
}
