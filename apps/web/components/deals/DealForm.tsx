'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Deal, DealBrandSummary, CreateDeal, DealStatus, UpdateDeal } from '@oompa/types'
import { CreateDealSchema, DEAL_STATUS_TRANSITIONS, UpdateDealSchema } from '@oompa/types'
import { validate, parseDealFromText } from '@oompa/utils'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface DealFormProps {
  deal?: Deal
  mode: 'create' | 'edit'
}

const CURRENCY_OPTIONS = [
  { value: 'INR', label: '₹ INR' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
]

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'NEGOTIATING', label: 'Negotiating' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'PAID', label: 'Paid' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

function statusSelectOptions(
  mode: 'create' | 'edit',
  currentStatus: string,
): typeof STATUS_OPTIONS {
  if (mode === 'create') return STATUS_OPTIONS
  const cur = currentStatus as DealStatus
  const allowed = new Set<DealStatus>([cur, ...DEAL_STATUS_TRANSITIONS[cur]])
  return STATUS_OPTIONS.filter((o) => allowed.has(o.value as DealStatus))
}

export function DealForm({ deal, mode }: DealFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [brandSuggestions, setBrandSuggestions] = useState<DealBrandSummary[]>([])
  const [parseOpen, setParseOpen] = useState(false)
  const [parseText, setParseText] = useState('')
  const [parseHint, setParseHint] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: deal?.title ?? '',
    brandName: deal?.brandName ?? '',
    value: deal?.value?.toString() ?? '',
    currency: deal?.currency ?? 'INR',
    status: deal?.status ?? 'DRAFT',
    notes: deal?.notes ?? '',
  })

  const editStatusOptions = useMemo(
    () => statusSelectOptions(mode, form.status),
    [mode, form.status],
  )

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await api.listDealBrands()
        if (!cancelled && res.data) {
          setBrandSuggestions(res.data)
        }
      } catch {
        // Form stays usable without suggestions (network/offline).
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function setField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  function handleParse() {
    const parsed = parseDealFromText(parseText)
    const filled: string[] = []
    setForm((prev) => {
      const next = { ...prev }
      if (parsed.title && !prev.title) { next.title = parsed.title; filled.push('title') }
      if (parsed.brandName && !prev.brandName) { next.brandName = parsed.brandName; filled.push('brand') }
      if (parsed.value !== undefined && !prev.value) { next.value = String(parsed.value); filled.push('value') }
      if (parsed.currency && prev.currency === 'INR') { next.currency = parsed.currency; filled.push('currency') }
      if (parsed.notes && !prev.notes) { next.notes = parsed.notes; filled.push('notes') }
      return next
    })
    if (filled.length > 0) {
      setParseHint(`Pre-filled: ${filled.join(', ')}. Review and edit before saving.`)
    } else {
      setParseHint("Couldn't extract deal details. Try pasting the full email body.")
    }
    setParseText('')
    setParseOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const valRaw = form.value.trim()
    const valueNum = valRaw === '' ? 0 : parseFloat(valRaw)

    const payload = {
      title: form.title.trim(),
      brandName: form.brandName.trim(),
      value: isNaN(valueNum) ? 0 : valueNum,
      currency: form.currency,
      status: form.status,
      notes: form.notes.trim() || null,
    }

    const schema = mode === 'create' ? CreateDealSchema : UpdateDealSchema
    const parsed = validate(schema, payload)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      parsed.errors.forEach((e) => {
        errors[e.path] = e.message
      })
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'create') {
        const result = await api.createDeal(parsed.data as CreateDeal)
        const id = result?.data?.id
        if (!id) {
          setServerError(
            'Deal was created but the server response was incomplete. Check the deals list or try again.',
          )
          return
        }
        router.push(`/deals/${id}`)
        router.refresh()
      } else if (deal) {
        await api.updateDeal(deal.id, parsed.data as UpdateDeal)
        router.push(`/deals/${deal.id}`)
        router.refresh()
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteDeal() {
    if (!deal) return
    if (
      !window.confirm(
        `Permanently delete deal "${deal.title}"? All payments and deliverables for this deal will be removed. This cannot be undone.`,
      )
    ) {
      return
    }
    setServerError(null)
    setDeleting(true)
    try {
      await api.deleteDeal(deal.id)
      router.push('/deals')
      router.refresh()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      noValidate
      className="flex flex-col gap-6"
      autoComplete={mode === 'create' ? 'off' : undefined}
    >
      {serverError && (
        <div
          className="rounded-xl bg-red-50 border border-red-200/90 px-4 py-3 text-sm text-red-800 shadow-sm"
          role="alert"
          aria-live="assertive"
        >
          {serverError}
        </div>
      )}

      {mode === 'create' && (
        <div className="rounded-xl border border-line/70 bg-surface-raised/60">
          <button
            type="button"
            aria-expanded={parseOpen}
            aria-controls="parse-from-email-panel"
            onClick={() => { setParseOpen((v) => !v); setParseHint(null) }}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-stone-700 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-xl"
          >
            <span>Parse from email or brief</span>
            <span aria-hidden="true" className={`transition-transform duration-200 ${parseOpen ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {parseOpen && (
            <div id="parse-from-email-panel" className="px-4 pb-4 flex flex-col gap-3">
              <p className="text-xs text-stone-500 leading-relaxed">
                Paste a brand email or deal brief. The form will be pre-filled — you can edit everything before saving.
              </p>
              <textarea
                aria-label="Paste email or brief text"
                rows={6}
                value={parseText}
                onChange={(e) => setParseText(e.target.value)}
                placeholder="Hi, I'm Priya from Nike. We'd love to do a YouTube integration for ₹75,000…"
                className="block w-full rounded-xl border border-line-strong/80 bg-white px-3 py-2.5 text-sm shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-500 resize-y"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!parseText.trim()}
                onClick={handleParse}
              >
                Pre-fill form
              </Button>
            </div>
          )}
        </div>
      )}

      {parseHint && (
        <p role="status" aria-live="polite" className="text-xs text-stone-600 bg-stone-100 rounded-lg px-3 py-2">
          {parseHint}
        </p>
      )}

      <datalist id="deal-brand-suggestions">
        {brandSuggestions.map((b) => (
          <option key={b.brandName} value={b.brandName} />
        ))}
      </datalist>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Deal title"
          name="title"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder="e.g. Nike Reel Campaign – April"
          required
          error={fieldErrors['title']}
        />
        <Input
          label="Brand name"
          name="brandName"
          value={form.brandName}
          onChange={(e) => setField('brandName', e.target.value)}
          placeholder="e.g. Nike"
          list="deal-brand-suggestions"
          autoComplete="off"
          hint={
            brandSuggestions.length > 0
              ? 'Pick a brand you used before or type a new one.'
              : undefined
          }
          required
          error={fieldErrors['brandName']}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Input
          label="Deal value"
          name="value"
          type="number"
          min="0"
          step="1"
          value={form.value}
          onChange={(e) => setField('value', e.target.value)}
          placeholder="80000"
          required
          error={fieldErrors['value']}
          autoComplete="off"
          inputMode="decimal"
        />
        <Select
          label="Currency"
          name="currency"
          value={form.currency}
          onChange={(e) => setField('currency', e.target.value)}
          options={CURRENCY_OPTIONS}
        />
        {mode === 'edit' && (
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => setField('status', e.target.value)}
            options={editStatusOptions}
          />
        )}
      </div>

      <div>
        <label htmlFor="deal-notes" className="block text-sm font-medium text-stone-700 mb-1.5">
          Notes
          <span className="text-stone-500 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          id="deal-notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="Deliverables, payment terms, or anything else..."
          className="block w-full rounded-xl border border-line-strong/80 bg-surface-raised px-3 py-2.5 text-sm shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-500"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-line/70">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={submitting || deleting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={deleting}>
          {mode === 'create' ? 'Create deal' : 'Save changes'}
        </Button>
      </div>

      {mode === 'edit' && deal && (
        <div className="pt-8 mt-2 border-t border-red-100 rounded-b-xl">
          <h3 className="text-sm font-semibold text-red-900">Danger zone</h3>
          <p className="text-sm text-stone-600 mt-1 mb-4 leading-relaxed">
            Delete this deal and all of its payment milestones and deliverables. This cannot be
            undone.
          </p>
          <Button
            type="button"
            variant="danger"
            size="md"
            loading={deleting}
            disabled={submitting}
            onClick={() => void handleDeleteDeal()}
          >
            Delete deal
          </Button>
        </div>
      )}
    </form>
  )
}
