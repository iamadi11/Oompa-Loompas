'use client'

import { useState } from 'react'
import type { Currency } from '@oompa/types'
import { CreatePaymentSchema } from '@oompa/types'
import { validate } from '@oompa/utils'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface AddPaymentFormProps {
  dealId: string
  dealCurrency: Currency
  onSuccess: () => void
  onCancel: () => void
}

export function AddPaymentForm({ dealId, dealCurrency, onSuccess, onCancel }: AddPaymentFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    amount: '',
    dueDate: '',
    notes: '',
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
      amount: parseFloat(form.amount),
      currency: dealCurrency,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      notes: form.notes.trim() || null,
    }

    const parsed = validate(CreatePaymentSchema, payload)
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
      await api.createPayment(dealId, parsed.data)
      onSuccess()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to add payment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      noValidate
      className="flex flex-col gap-4 pt-4 border-t border-line/70"
    >
      <h3 className="text-sm font-semibold text-stone-800">Add payment milestone</h3>

      {serverError && (
        <div
          className="rounded-xl bg-red-50 border border-red-200/90 px-4 py-3 text-sm text-red-800 shadow-sm"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="deal-payment-amount"
          label="Amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          value={form.amount}
          onChange={(e) => setField('amount', e.target.value)}
          placeholder="40000"
          required
          error={fieldErrors['amount']}
        />
        <Input
          id="deal-payment-due-date"
          label="Due date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={(e) => setField('dueDate', e.target.value)}
          error={fieldErrors['dueDate']}
        />
      </div>
      <Input
        id="deal-payment-notes"
        label="Notes (optional)"
        name="notes"
        value={form.notes}
        onChange={(e) => setField('notes', e.target.value)}
        placeholder="e.g. First instalment, 50% upfront"
      />

      <div className="flex items-center gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={submitting}>
          Add payment
        </Button>
      </div>
    </form>
  )
}
