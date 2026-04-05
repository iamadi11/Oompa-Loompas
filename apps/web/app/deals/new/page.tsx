import type { Metadata } from 'next'
import { DealForm } from '../../../components/deals/DealForm'

export const metadata: Metadata = {
  title: 'New deal',
}

export default function NewDealPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">New deal</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Record a brand deal. You can update status and add payments later.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <DealForm mode="create" />
      </div>
    </div>
  )
}
