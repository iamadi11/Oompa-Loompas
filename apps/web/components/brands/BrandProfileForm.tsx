'use client'

import { useState } from 'react'
import type { BrandProfile, UpsertBrandProfile } from '@oompa/types'
import { UpsertBrandProfileSchema } from '@oompa/types'
import { validate } from '@oompa/utils'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Props {
  brandName: string
  initial: BrandProfile | null
}

const panelClass = 'rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card'

export function BrandProfileForm({ brandName, initial }: Props) {
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState<BrandProfile | null>(initial)
  const [form, setForm] = useState<UpsertBrandProfile>({
    contactEmail: null,
    contactPhone: null,
    notes: null,
  })

  function startEditing(profile: BrandProfile | null) {
    setForm({
      contactEmail: profile?.contactEmail ?? null,
      contactPhone: profile?.contactPhone ?? null,
      notes: profile?.notes ?? null,
    })
    setServerError(null)
    setEditing(true)
  }

  function handleCancel() {
    setEditing(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload: UpsertBrandProfile = {
      contactEmail: form.contactEmail || null,
      contactPhone: form.contactPhone || null,
      notes: form.notes || null,
    }

    const parsed = validate(UpsertBrandProfileSchema, payload)
    if (!parsed.success) {
      setServerError(parsed.errors.map((err) => err.message).join(', '))
      return
    }

    setSubmitting(true)
    setServerError(null)
    try {
      const res = await api.upsertBrandProfile(brandName, payload)
      setSaved(res.data)
      setEditing(false)
    } catch {
      setServerError('Could not save profile. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const hasProfile = !!(saved?.contactEmail || saved?.contactPhone || saved?.notes)

  return (
    <section aria-label="Brand contact information">
      <div className={panelClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-900">Contact</h2>
          {!editing && (
            <button
              onClick={() => startEditing(saved)}
              className="text-sm font-medium text-brand-700 hover:text-brand-900 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              {hasProfile ? 'Edit' : 'Add contact info'}
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              value={form.contactEmail ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value || null }))}
              placeholder="brand@example.com"
              maxLength={500}
              autoComplete="off"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.contactPhone ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value || null }))}
              placeholder="+91 98765 43210"
              maxLength={50}
              autoComplete="off"
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="brand-notes" className="text-sm font-medium text-stone-700">
                Notes
              </label>
              <textarea
                id="brand-notes"
                value={form.notes ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
                placeholder="Payment terms, contact preferences, deal history…"
                rows={4}
                maxLength={5000}
                className="block w-full rounded-xl border border-line-strong/60 px-3 py-2.5 text-sm shadow-sm placeholder-stone-400 bg-surface-raised focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 resize-y"
              />
              <p className="text-xs text-stone-500 text-right">{(form.notes ?? '').length}/5000</p>
            </div>

            {serverError && (
              <p className="text-sm text-red-600" role="alert">
                {serverError}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" loading={submitting} size="sm">
                Save
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        ) : hasProfile ? (
          <dl className="space-y-3 text-sm">
            {saved?.contactEmail && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Email
                </dt>
                <dd className="mt-0.5 text-stone-900">
                  <a
                    href={`mailto:${saved.contactEmail}`}
                    className="text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
                  >
                    {saved.contactEmail}
                  </a>
                </dd>
              </div>
            )}
            {saved?.contactPhone && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Phone
                </dt>
                <dd className="mt-0.5 text-stone-900">
                  <a
                    href={`tel:${saved.contactPhone}`}
                    className="text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
                  >
                    {saved.contactPhone}
                  </a>
                </dd>
              </div>
            )}
            {saved?.notes && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Notes
                </dt>
                <dd className="mt-0.5 text-stone-700 whitespace-pre-wrap leading-relaxed">
                  {saved.notes}
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-stone-500">
            No contact info yet. Add email, phone, or notes to keep everything in one place.
          </p>
        )}
      </div>
    </section>
  )
}
