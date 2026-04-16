'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import type { DealTemplate, Currency } from '@oompa/types'
import { CurrencySchema } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { api } from '@/lib/api'

interface Props {
  template: DealTemplate
}

export function DealFromTemplateForm({ template }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [brandName, setBrandName] = useState('')
  const [value, setValue] = useState(
    template.defaultValue != null ? String(template.defaultValue) : '',
  )
  const [currency, setCurrency] = useState<Currency>(template.currency)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState(template.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dealValue = parseFloat(value) || 0

  function computePaymentAmount(pct: number): number {
    return Math.round((pct / 100) * dealValue * 100) / 100
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !brandName.trim() || dealValue <= 0) {
      setError('Title, brand name, and a positive deal value are required.')
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      const dealRes = await api.createDeal({
        title: title.trim(),
        brandName: brandName.trim(),
        value: dealValue,
        currency,
        status: 'DRAFT',
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        notes: notes.trim() || null,
      })

      const dealId = dealRes.data.id

      // Fire deliverables and payments in parallel — best-effort
      await Promise.allSettled([
        ...template.deliverables.map((d) =>
          api.createDeliverable(dealId, {
            title: d.title,
            platform: d.platform as Parameters<typeof api.createDeliverable>[1]['platform'],
            type: d.type as Parameters<typeof api.createDeliverable>[1]['type'],
            notes: d.notes ?? null,
          }),
        ),
        ...template.payments.map((p) =>
          api.createPayment(dealId, {
            amount: computePaymentAmount(p.percentage),
            currency,
            notes: p.label,
          }),
        ),
      ])

      router.push(`/deals/${dealId}` as Route)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal. Please try again.')
      setSubmitting(false)
    }
  }

  const inputClass =
    'block w-full rounded-lg border border-line-strong bg-canvas px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1'

  const labelClass = 'block text-sm font-semibold text-stone-700 mb-1'

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {/* Required deal-specific fields */}
      <div>
        <label htmlFor="dft-title" className={labelClass}>
          Deal title <span aria-hidden>*</span>
        </label>
        <input
          id="dft-title"
          type="text"
          required
          maxLength={255}
          placeholder="e.g. Q2 YouTube Campaign"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="dft-brand" className={labelClass}>
          Brand name <span aria-hidden>*</span>
        </label>
        <input
          id="dft-brand"
          type="text"
          required
          maxLength={255}
          placeholder="e.g. Nike"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Pre-filled from template but editable */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dft-value" className={labelClass}>
            Deal value <span aria-hidden>*</span>
          </label>
          <input
            id="dft-value"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="dft-currency" className={labelClass}>
            Currency
          </label>
          <select
            id="dft-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="block w-full rounded-lg border border-line-strong bg-canvas px-3 py-2 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
          >
            {CurrencySchema.options.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dft-start" className={labelClass}>
            Start date
          </label>
          <input
            id="dft-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="dft-end" className={labelClass}>
            End date
          </label>
          <input
            id="dft-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="dft-notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="dft-notes"
          rows={3}
          maxLength={5000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Preview: what will be created */}
      {(template.deliverables.length > 0 || template.payments.length > 0) && (
        <div className="rounded-xl border border-line/70 bg-surface p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            Will create
          </p>

          {template.deliverables.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-600 mb-1.5">
                {template.deliverables.length}{' '}
                {template.deliverables.length === 1 ? 'deliverable' : 'deliverables'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {template.deliverables.map((d) => (
                  <span
                    key={d.id}
                    className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700"
                    title={d.title}
                  >
                    {d.title.length > 20 ? `${d.title.slice(0, 20)}…` : d.title} · {d.platform} ·{' '}
                    {d.type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {template.payments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-600 mb-1.5">
                {template.payments.length} payment{template.payments.length !== 1 && 's'}
              </p>
              <div className="space-y-1">
                {template.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs text-stone-700">
                    <span>{p.label}</span>
                    <span className="font-semibold tabular-nums">
                      {dealValue > 0
                        ? formatCurrency(computePaymentAmount(p.percentage), currency)
                        : `${p.percentage}%`}
                    </span>
                  </div>
                ))}
              </div>
              {dealValue <= 0 && (
                <p className="mt-1 text-xs text-stone-400 italic">
                  Enter a deal value above to see computed amounts.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-line/70">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex justify-center items-center rounded-xl border border-line-strong bg-surface-raised px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-surface shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex justify-center items-center rounded-xl bg-brand-700 border border-brand-800/20 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {submitting ? 'Creating…' : 'Create deal'}
        </button>
      </div>
    </form>
  )
}
