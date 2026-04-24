'use client'

import { useState, useRef, useId } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { api, type BankTransactionInput, type ReconcileMatch } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { parseReconcileCsv, formatCurrency } from '@oompa/utils'

type MatchRow = ReconcileMatch & { selected: boolean; receivedAt: string }

type Step = 'input' | 'review'

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-green-50 text-green-800 border-green-200',
    medium: 'bg-amber-50 text-amber-800 border-amber-200',
    low: 'bg-stone-50 text-stone-600 border-stone-200',
  }
  const labels = { high: 'High', medium: 'Medium', low: 'Low' }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[confidence]}`}
    >
      {labels[confidence]}
    </span>
  )
}

export function ReconcilePage() {
  const router = useRouter()
  const fileInputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('input')
  const [csvText, setCsvText] = useState('')
  const [tab, setTab] = useState<'upload' | 'paste'>('upload')
  const [parseError, setParseError] = useState('')
  const [loading, setLoading] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [matchRows, setMatchRows] = useState<MatchRow[]>([])
  const [unmatchedCount, setUnmatchedCount] = useState(0)
  const statusRegionId = useId()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    let active = true
    reader.onload = (ev) => {
      if (!active) return
      setCsvText(ev.target?.result as string ?? '')
      setParseError('')
    }
    reader.readAsText(file)
    return () => { active = false }
  }

  const handleParse = async () => {
    setParseError('')
    const raw = csvText.trim()
    if (!raw) { setParseError('Paste or upload a CSV first.'); return }

    const txs = parseReconcileCsv(raw)
    if (txs.length === 0) {
      setParseError("Couldn't find any credit transactions. Check that your CSV has a credit/deposit column and a date column.")
      return
    }

    const inputs: BankTransactionInput[] = txs.map((t) => ({
      date: t.date.toISOString().split('T')[0]!,
      amount: t.amount,
      description: t.description,
    }))

    setLoading(true)
    try {
      const res = await api.reconcileMatch(inputs)
      if (!res?.data) throw new Error('No response')
      const rows: MatchRow[] = res.data.matches.map((m) => ({
        ...m,
        selected: m.confidence === 'high' || m.confidence === 'medium',
        receivedAt: m.suggestedReceivedAt,
      }))
      setMatchRows(rows)
      setUnmatchedCount(res.data.unmatched.length)
      setStep('review')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to match transactions'
      setParseError(msg)
    } finally {
      setLoading(false)
    }
  }

  const selectedCount = matchRows.filter((r) => r.selected).length

  const handleApply = async () => {
    const approvals = matchRows
      .filter((r) => r.selected)
      .map((r) => ({ paymentId: r.paymentId, receivedAt: r.receivedAt }))

    if (approvals.length === 0) return

    setApplyLoading(true)
    try {
      const res = await api.reconcileApply(approvals)
      const updated = res?.data?.updated ?? approvals.length
      toast.success(`${updated} payment${updated !== 1 ? 's' : ''} marked received`)
      router.push('/attention')
    } catch {
      toast.error('Failed to apply reconciliation. Please try again.')
    } finally {
      setApplyLoading(false)
    }
  }

  const toggleAll = (checked: boolean) => {
    setMatchRows((prev) => prev.map((r) => ({ ...r, selected: checked })))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Mark payments as received
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Upload your bank or UPI CSV to automatically match payments.
          </p>
        </div>
        <Link
          href="/attention"
          className="text-sm text-stone-500 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-md"
        >
          ← Back
        </Link>
      </div>

      {step === 'input' && (
        <div className="rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex gap-1 p-1 bg-canvas rounded-xl border border-line/60 w-fit">
            {(['upload', 'paste'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t
                    ? 'bg-surface-raised text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
                aria-pressed={tab === t}
              >
                {t === 'upload' ? 'Upload CSV' : 'Paste CSV'}
              </button>
            ))}
          </div>

          {tab === 'upload' && (
            <div>
              <label
                htmlFor={fileInputId}
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Bank statement CSV
              </label>
              <input
                id={fileInputId}
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-line/60 file:text-sm file:font-medium file:bg-surface-raised file:text-stone-700 hover:file:bg-canvas cursor-pointer"
              />
              <p className="text-xs text-stone-400 mt-2">
                Supports HDFC, ICICI, SBI, and most Indian bank CSV formats.
              </p>
              {csvText && (
                <p className="text-xs text-green-700 mt-1">
                  File loaded — {csvText.split('\n').length - 1} rows
                </p>
              )}
            </div>
          )}

          {tab === 'paste' && (
            <div>
              <label
                htmlFor="csv-paste"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Paste CSV contents
              </label>
              <textarea
                id="csv-paste"
                value={csvText}
                onChange={(e) => { setCsvText(e.target.value); setParseError('') }}
                rows={8}
                placeholder="Date,Narration,Debit,Credit,Balance&#10;19/04/2026,UPI/Nike,,75000,..."
                className="w-full rounded-xl border border-line/80 bg-canvas px-3 py-2 text-sm font-mono text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-600 resize-y"
                aria-label="Paste CSV contents here"
              />
            </div>
          )}

          {parseError && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {parseError}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => void handleParse()}
              loading={loading}
              disabled={!csvText.trim() || loading}
            >
              Find matching payments
            </Button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          {matchRows.length === 0 ? (
            <div className="rounded-2xl border border-line/90 bg-surface-raised p-8 text-center shadow-card">
              <p className="text-stone-600 font-medium">No matching payments found.</p>
              <p className="text-sm text-stone-400 mt-1">
                Check that the credit amounts in your CSV match your pending payment values.
              </p>
              <Button variant="secondary" className="mt-4" onClick={() => setStep('input')}>
                Try again
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-line/90 bg-surface-raised shadow-card overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-line/60 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-stone-900">
                    {matchRows.length} match{matchRows.length !== 1 ? 'es' : ''} found
                  </h2>
                  {unmatchedCount > 0 && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {unmatchedCount} transaction{unmatchedCount !== 1 ? 's' : ''} had no matching payment
                    </p>
                  )}
                </div>
                <button
                  className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2"
                  onClick={() => toggleAll(selectedCount < matchRows.length)}
                >
                  {selectedCount < matchRows.length ? 'Select all' : 'Deselect all'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Payment matches">
                  <thead>
                    <tr className="bg-canvas border-b border-line/60 text-left">
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-stone-500 w-10">
                        <span className="sr-only">Select</span>
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-stone-500">Deal / Brand</th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-stone-500 text-right">Amount</th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-stone-500">Received on</th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-stone-500">Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40">
                    {matchRows.map((row, idx) => (
                      <tr
                        key={row.paymentId}
                        className={`transition-colors ${row.selected ? 'bg-surface-raised' : 'bg-canvas opacity-60'}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(e) =>
                              setMatchRows((prev) =>
                                prev.map((r, i) => i === idx ? { ...r, selected: e.target.checked } : r),
                              )
                            }
                            aria-label={`Select ${row.brandName} ₹${formatCurrency(row.paymentAmount, 'INR')}`}
                            className="w-4 h-4 rounded border-line-strong/60 text-brand-700 focus:ring-brand-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-stone-900">{row.brandName}</div>
                          <div className="text-xs text-stone-400 truncate max-w-[160px]">{row.dealTitle}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-stone-900 tabular-nums">
                          {formatCurrency(row.paymentAmount, 'INR')}
                          {row.transactionAmount !== row.paymentAmount && (
                            <div className="text-xs text-stone-400">
                              bank: {formatCurrency(row.transactionAmount, 'INR')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={row.receivedAt}
                            onChange={(e) =>
                              setMatchRows((prev) =>
                                prev.map((r, i) => i === idx ? { ...r, receivedAt: e.target.value } : r),
                              )
                            }
                            aria-label={`Received date for ${row.brandName} payment`}
                            className="rounded-lg border border-line/80 bg-canvas px-2 py-1 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ConfidenceBadge confidence={row.confidence} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 sm:p-6 border-t border-line/60 flex items-center gap-3">
                <Button
                  onClick={() => void handleApply()}
                  loading={applyLoading}
                  disabled={selectedCount === 0 || applyLoading}
                  aria-describedby={statusRegionId}
                >
                  Mark {selectedCount} payment{selectedCount !== 1 ? 's' : ''} received
                </Button>
                <Button variant="secondary" onClick={() => setStep('input')} disabled={applyLoading}>
                  Start over
                </Button>
                <div id={statusRegionId} className="sr-only" aria-live="polite">
                  {selectedCount} payment{selectedCount !== 1 ? 's' : ''} selected
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
