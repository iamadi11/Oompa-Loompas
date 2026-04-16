'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import type {
  DealTemplate,
  CreateTemplateDeliverable,
  CreateTemplatePayment,
  Currency,
  DeliverablePlatform,
  DeliverableType,
} from '@oompa/types'
import { DeliverablePlatformSchema, DeliverableTypeSchema, CurrencySchema } from '@oompa/types'
import { api } from '@/lib/api'

interface Props {
  mode: 'create' | 'edit'
  template?: DealTemplate
}

type DeliverableRow = { title: string; platform: DeliverablePlatform; type: DeliverableType; notes: string }
type PaymentRow = { label: string; percentage: string; notes: string }

const PLATFORMS = DeliverablePlatformSchema.options
const TYPES = DeliverableTypeSchema.options
const CURRENCIES = CurrencySchema.options

const MAX_ROWS = 10

function emptyDeliverable(): DeliverableRow {
  return { title: '', platform: 'INSTAGRAM', type: 'POST', notes: '' }
}
function emptyPayment(): PaymentRow {
  return { label: '', percentage: '', notes: '' }
}

export function TemplateForm({ mode, template }: Props) {
  const router = useRouter()

  const [name, setName] = useState(template?.name ?? '')
  const [defaultValue, setDefaultValue] = useState(
    template?.defaultValue != null ? String(template.defaultValue) : '',
  )
  const [currency, setCurrency] = useState<Currency>(template?.currency ?? 'INR')
  const [notes, setNotes] = useState(template?.notes ?? '')
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>(
    template?.deliverables.map((d) => ({
      title: d.title,
      platform: d.platform,
      type: d.type,
      notes: d.notes ?? '',
    })) ?? [],
  )
  const [payments, setPayments] = useState<PaymentRow[]>(
    template?.payments.map((p) => ({
      label: p.label,
      percentage: String(p.percentage),
      notes: p.notes ?? '',
    })) ?? [],
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPct = payments.reduce((sum, p) => {
    const v = parseFloat(p.percentage)
    return sum + (isNaN(v) ? 0 : v)
  }, 0)
  const pctOk = Math.abs(totalPct - 100) < 0.01

  function updateDeliverable<K extends keyof DeliverableRow>(i: number, field: K, value: DeliverableRow[K]) {
    setDeliverables((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  function updatePayment(i: number, field: keyof PaymentRow, value: string) {
    setPayments((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  function removeDeliverable(i: number) {
    setDeliverables((rows) => rows.filter((_, idx) => idx !== i))
  }

  function removePayment(i: number) {
    setPayments((rows) => rows.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsedValue = defaultValue.trim() ? parseFloat(defaultValue) : undefined
    const deliverableData: CreateTemplateDeliverable[] = deliverables
      .filter((d) => d.title.trim())
      .map((d) => ({
        title: d.title.trim(),
        platform: d.platform,
        type: d.type,
        notes: d.notes.trim() || null,
      }))
    const paymentData: CreateTemplatePayment[] = payments
      .filter((p) => p.label.trim() && p.percentage.trim())
      .map((p) => ({
        label: p.label.trim(),
        percentage: parseFloat(p.percentage),
        notes: p.notes.trim() || null,
      }))

    const payload = {
      name: name.trim(),
      defaultValue: parsedValue ?? null,
      currency,
      notes: notes.trim() || null,
      deliverables: deliverableData,
      payments: paymentData,
    }

    setSubmitting(true)
    try {
      if (mode === 'create') {
        await api.createTemplate(payload)
      } else {
        await api.updateTemplate(template!.id, payload)
      }
      router.push('/deals/templates' as Route)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template. Please try again.')
      setSubmitting(false)
    }
  }

  const inputClass =
    'block w-full rounded-lg border border-line-strong bg-canvas px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1'

  const selectClass =
    'block rounded-lg border border-line-strong bg-canvas px-2 py-2 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1'

  const removeBtn =
    'text-xs font-medium text-red-600 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded'

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="tpl-name" className="block text-sm font-semibold text-stone-700 mb-1">
          Template name <span aria-hidden>*</span>
        </label>
        <input
          id="tpl-name"
          type="text"
          required
          maxLength={255}
          placeholder="e.g. YouTube Integration Standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Default value + currency */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tpl-value" className="block text-sm font-semibold text-stone-700 mb-1">
            Default value
          </label>
          <input
            id="tpl-value"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 50000"
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="tpl-currency" className="block text-sm font-semibold text-stone-700 mb-1">
            Currency
          </label>
          <select
            id="tpl-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className={`${selectClass} w-full`}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="tpl-notes" className="block text-sm font-semibold text-stone-700 mb-1">
          Notes
        </label>
        <textarea
          id="tpl-notes"
          rows={2}
          maxLength={5000}
          placeholder="Optional notes for this template"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Deliverables */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-stone-700">
            Deliverables{' '}
            <span className="text-xs font-normal text-stone-500">
              ({deliverables.length}/{MAX_ROWS})
            </span>
          </p>
          {deliverables.length < MAX_ROWS && (
            <button
              type="button"
              onClick={() => setDeliverables((d) => [...d, emptyDeliverable()])}
              className="text-xs font-semibold text-brand-800 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
            >
              + Add deliverable
            </button>
          )}
        </div>
        <div className="space-y-2">
          {deliverables.length === 0 && (
            <p className="text-xs text-stone-400 italic">No deliverables — add one above.</p>
          )}
          {deliverables.map((d, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-start rounded-lg border border-line/60 bg-canvas p-2">
              <input
                type="text"
                required
                placeholder="Title"
                maxLength={255}
                value={d.title}
                onChange={(e) => updateDeliverable(i, 'title', e.target.value)}
                aria-label={`Deliverable ${i + 1} title`}
                className={`${inputClass} flex-1 min-w-[120px]`}
              />
              <select
                value={d.platform}
                onChange={(e) => updateDeliverable(i, 'platform', e.target.value as DeliverablePlatform)}
                aria-label={`Deliverable ${i + 1} platform`}
                className={selectClass}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={d.type}
                onChange={(e) => updateDeliverable(i, 'type', e.target.value as DeliverableType)}
                aria-label={`Deliverable ${i + 1} type`}
                className={selectClass}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeDeliverable(i)}
                aria-label={`Remove deliverable ${i + 1}`}
                className={removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-stone-700">
            Payment milestones{' '}
            <span className="text-xs font-normal text-stone-500">
              ({payments.length}/{MAX_ROWS})
            </span>
          </p>
          {payments.length < MAX_ROWS && (
            <button
              type="button"
              onClick={() => setPayments((p) => [...p, emptyPayment()])}
              className="text-xs font-semibold text-brand-800 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
            >
              + Add payment
            </button>
          )}
        </div>
        {payments.length > 0 && (
          <p
            className={`text-xs mb-2 font-medium ${pctOk ? 'text-emerald-700' : 'text-amber-700'}`}
            aria-live="polite"
          >
            Total: {Math.round(totalPct * 100) / 100}%{pctOk ? ' ✓' : ' — does not add up to 100%'}
          </p>
        )}
        <div className="space-y-2">
          {payments.length === 0 && (
            <p className="text-xs text-stone-400 italic">No payment milestones — add one above.</p>
          )}
          {payments.map((p, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-start rounded-lg border border-line/60 bg-canvas p-2">
              <input
                type="text"
                required
                placeholder="Label (e.g. Advance)"
                maxLength={255}
                value={p.label}
                onChange={(e) => updatePayment(i, 'label', e.target.value)}
                aria-label={`Payment ${i + 1} label`}
                className={`${inputClass} flex-1 min-w-[120px]`}
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  required
                  min="0.01"
                  max="100"
                  step="0.01"
                  placeholder="%"
                  value={p.percentage}
                  onChange={(e) => updatePayment(i, 'percentage', e.target.value)}
                  aria-label={`Payment ${i + 1} percentage`}
                  aria-describedby="pct-total"
                  className={`${inputClass} w-20`}
                />
                <span className="text-sm text-stone-500">%</span>
              </div>
              <button
                type="button"
                onClick={() => removePayment(i)}
                aria-label={`Remove payment ${i + 1}`}
                className={removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

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
          {submitting ? 'Saving…' : mode === 'create' ? 'Create template' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
