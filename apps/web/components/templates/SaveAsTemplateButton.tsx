'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { api } from '@/lib/api'

interface Props {
  dealId: string
  dealTitle: string
}

export function SaveAsTemplateButton({ dealId, dealTitle }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    const name = window.prompt('Template name:', dealTitle)
    if (!name || !name.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await api.saveAsTemplate(dealId, name.trim())
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-stone-900 mb-2">Save as template</h2>
      <p className="text-sm text-stone-500 mb-4">
        Save this deal&apos;s deliverables and payment structure as a reusable template for future
        campaigns.
      </p>
      <button
        onClick={() => void handleSave()}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
      >
        {loading ? 'Saving…' : 'Save as template'}
      </button>
      {success && (
        <p className="mt-3 text-xs text-emerald-700 font-medium" role="status">
          Template saved. Find it at{' '}
          <Link
            href={'/deals/templates' as Route}
            className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
          >
            Deals → Templates
          </Link>
          .
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
