'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface Props {
  dealId: string
}

/**
 * DuplicateDealButton — copy an existing deal as a new DRAFT.
 *
 * Inputs:  dealId (string)
 * Outputs: calls POST /api/v1/deals/:id/duplicate; navigates to new deal on success
 * Edge cases: unauthenticated → API throws → inline error shown
 * Failure modes: network error → inline error message; user can retry
 */
export function DuplicateDealButton({ dealId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDuplicate() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.duplicateDeal(dealId)
      router.push(`/deals/${res.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate deal. Try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-stone-900 mb-2">Duplicate deal</h2>
      <p className="text-sm text-stone-500 mb-4">
        Copy this deal as a new draft — same brand, value, deliverables, and payment milestones.
        Adjust dates and price for the new campaign.
      </p>
      <button
        onClick={() => void handleDuplicate()}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
      >
        {loading ? 'Duplicating…' : 'Duplicate deal'}
      </button>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  )
}
