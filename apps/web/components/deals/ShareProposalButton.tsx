'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface Props {
  dealId: string
  initialShareToken: string | null | undefined
}

/**
 * ShareProposalButton — generate or revoke a public share link for a deal.
 *
 * Inputs:  dealId (string), initialShareToken (from server)
 * Outputs: rendered button + copy/revoke controls; calls POST/DELETE /api/v1/deals/:id/share
 * Edge cases: copy API unavailable → falls back to showing the URL
 * Failure modes: API error → shows inline error message
 */
export function ShareProposalButton({ dealId, initialShareToken }: Props) {
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken ?? null)
  const [shareUrl, setShareUrl] = useState<string | null>(
    initialShareToken
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${initialShareToken}`
      : null,
  )
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.shareProposal(dealId)
      setShareToken(res.data.shareToken)
      setShareUrl(res.data.shareUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate link')
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke() {
    setLoading(true)
    setError(null)
    try {
      await api.revokeShare(dealId)
      setShareToken(null)
      setShareUrl(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke link')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available — user can copy the URL manually
    }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">Share proposal</h2>

      {!shareToken ? (
        <div>
          <p className="text-sm text-stone-500 mb-4">
            Generate a read-only link you can share with the brand. Anyone with the link can view
            deliverables and payment terms — no login required.
          </p>
          <button
            onClick={() => void handleGenerate()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            {loading ? 'Generating…' : 'Generate share link'}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-stone-500 mb-3">
            This deal has an active share link. Anyone with the link can view the proposal.
          </p>
          <div className="flex items-center gap-2 mb-4">
            <input
              readOnly
              value={shareUrl ?? ''}
              aria-label="Share URL"
              className="flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-700 font-mono truncate focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <button
              onClick={() => void handleCopy()}
              className="shrink-0 rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => void handleRevoke()}
            disabled={loading}
            className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:underline"
          >
            {loading ? 'Revoking…' : 'Revoke link'}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  )
}
