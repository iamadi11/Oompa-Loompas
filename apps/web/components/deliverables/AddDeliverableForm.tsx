'use client'

import { useState } from 'react'
import { CreateDeliverableSchema } from '@oompa/types'
import { validate } from '@oompa/utils'
import { api } from '../../lib/api'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

interface AddDeliverableFormProps {
  dealId: string
  onSuccess: () => void
  onCancel: () => void
}

const PLATFORM_OPTIONS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'PODCAST', label: 'Podcast' },
  { value: 'BLOG', label: 'Blog' },
  { value: 'OTHER', label: 'Other' },
]

const TYPE_OPTIONS = [
  { value: 'POST', label: 'Post' },
  { value: 'REEL', label: 'Reel' },
  { value: 'STORY', label: 'Story' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'INTEGRATION', label: 'Integration' },
  { value: 'MENTION', label: 'Mention' },
  { value: 'ARTICLE', label: 'Article' },
  { value: 'OTHER', label: 'Other' },
]

export function AddDeliverableForm({ dealId, onSuccess, onCancel }: AddDeliverableFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    title: '',
    platform: '',
    type: '',
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
      title: form.title.trim(),
      platform: form.platform,
      type: form.type,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      notes: form.notes.trim() || null,
    }

    const parsed = validate(CreateDeliverableSchema, payload)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      parsed.errors.forEach((e) => { errors[e.path] = e.message })
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      await api.createDeliverable(dealId, parsed.data)
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setServerError(
        msg && msg.trim().length > 0 ? msg : 'Failed to add deliverable. Try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      noValidate
      className="flex flex-col gap-4 pt-4 border-t border-gray-100"
    >
      <h3 className="text-sm font-semibold text-gray-700">Add deliverable</h3>

      {serverError && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {serverError}
        </div>
      )}

      <Input
        id="deal-deliverable-title"
        label="Title"
        name="title"
        type="text"
        value={form.title}
        onChange={(e) => setField('title', e.target.value)}
        placeholder="e.g. 3x Instagram Reels"
        required
        error={fieldErrors['title']}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="deal-deliverable-platform"
          label="Platform"
          name="platform"
          value={form.platform}
          onChange={(e) => setField('platform', e.target.value)}
          options={PLATFORM_OPTIONS}
          placeholder="Select platform"
          required
          error={fieldErrors['platform']}
        />
        <Select
          id="deal-deliverable-type"
          label="Type"
          name="type"
          value={form.type}
          onChange={(e) => setField('type', e.target.value)}
          options={TYPE_OPTIONS}
          placeholder="Select type"
          required
          error={fieldErrors['type']}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="deal-deliverable-due-date"
          label="Due date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={(e) => setField('dueDate', e.target.value)}
          error={fieldErrors['dueDate']}
        />
        <Input
          id="deal-deliverable-notes"
          label="Notes (optional)"
          name="notes"
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="Any internal notes"
        />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={submitting}>
          Add deliverable
        </Button>
      </div>
    </form>
  )
}
