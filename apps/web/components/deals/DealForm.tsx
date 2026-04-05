'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Deal, CreateDeal, UpdateDeal } from '@oompa/types'
import { CreateDealSchema, UpdateDealSchema } from '@oompa/types'
import { validate } from '@oompa/utils'
import { api } from '../../lib/api'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

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

export function DealForm({ deal, mode }: DealFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    title: deal?.title ?? '',
    brandName: deal?.brandName ?? '',
    value: deal?.value?.toString() ?? '',
    currency: deal?.currency ?? 'INR',
    status: deal?.status ?? 'DRAFT',
    notes: deal?.notes ?? '',
  })

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const payload = {
      title: form.title,
      brandName: form.brandName,
      value: parseFloat(form.value),
      currency: form.currency,
      status: form.status,
      notes: form.notes.trim() || null,
    }

    const schema = mode === 'create' ? CreateDealSchema : UpdateDealSchema
    const parsed = validate(schema, payload)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      parsed.errors.forEach((e) => { errors[e.path] = e.message })
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'create') {
        const result = await api.createDeal(parsed.data as CreateDeal)
        const id = result?.data?.id
        if (!id) {
          setServerError('Deal was created but the server response was incomplete. Check the deals list or try again.')
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

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-6">
      {serverError && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {serverError}
        </div>
      )}

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
            options={STATUS_OPTIONS}
          />
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">
          Notes
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="Deliverables, payment terms, or anything else..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Create deal' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
