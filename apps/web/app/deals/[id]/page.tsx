import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Deal } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { StatusBadge } from '../../../components/ui/Badge'
import { DealForm } from '../../../components/deals/DealForm'

interface Props {
  params: { id: string }
}

async function getDeal(id: string): Promise<Deal | null> {
  const apiBase = process.env['API_URL'] ?? 'http://localhost:3001'
  try {
    const res = await fetch(`${apiBase}/api/v1/deals/${id}`, { cache: 'no-store' })
    if (res.status === 404) return null
    if (!res.ok) return null
    const body = (await res.json()) as { data: Deal }
    return body.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const deal = await getDeal(params.id)
  return {
    title: deal ? `${deal.title} — Revenue` : 'Deal Not Found — Revenue',
  }
}

export default async function DealDetailPage({ params }: Props) {
  const deal = await getDeal(params.id)
  if (!deal) notFound()

  return (
    <div className="max-w-2xl">
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
        <h2 className="text-base font-semibold text-gray-900 mb-5">Edit deal</h2>
        <DealForm deal={deal} mode="edit" />
      </div>
    </div>
  )
}
