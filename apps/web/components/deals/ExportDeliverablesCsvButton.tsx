'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { deliverablesPortfolioExportFilename } from '@oompa/utils'

/**
 * ExportDeliverablesCsvButton — download all deliverables for session user as CSV.
 */
export function ExportDeliverablesCsvButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setLoading(true)
    setError(null)
    try {
      const blob = await api.downloadDeliverablesPortfolioCsv()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = deliverablesPortfolioExportFilename(new Date())
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={loading}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-line/90 bg-surface-raised px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-surface transition-colors duration-200 motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {loading ? 'Exporting…' : 'Export deliverables CSV'}
      </button>
      {error && (
        <p className="text-xs text-red-600" role="status">
          {error}
        </p>
      )}
    </div>
  )
}
