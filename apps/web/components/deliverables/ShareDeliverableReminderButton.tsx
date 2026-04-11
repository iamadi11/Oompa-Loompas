'use client'

import { useState } from 'react'
import { buildDeliverableReminderMessage } from '@oompa/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'

export type ShareDeliverableReminderButtonProps = {
  dealTitle: string
  brandName: string
  deliverableTitle: string
  dueDate: string | null
}

export function ShareDeliverableReminderButton({
  dealTitle,
  brandName,
  deliverableTitle,
  dueDate,
}: ShareDeliverableReminderButtonProps) {
  const [busy, setBusy] = useState(false)

  async function shareReminder() {
    setBusy(true)
    try {
      const text = buildDeliverableReminderMessage({
        dealTitle,
        brandName,
        deliverableTitle,
        dueDateIso: dueDate,
      })

      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Deliverable Update',
          text: text,
        })
        return
      }

      await navigator.clipboard.writeText(text)
      toast.info('Update copied to clipboard')
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Could not share. Try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      loading={busy}
      onClick={() => void shareReminder()}
      aria-label="Share deliverable reminder message"
    >
      Share update
    </Button>
  )
}
