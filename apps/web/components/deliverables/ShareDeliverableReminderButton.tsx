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

      // Always copy to clipboard as primary action/fallback
      await navigator.clipboard.writeText(text)
      toast.success('Update copied to clipboard')

      // Attempt native share if available (won't block toast)
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: 'Deliverable Update',
            text: text,
          })
        } catch (shareErr) {
          // Ignore AbortError (user cancelled share sheet)
          if (shareErr instanceof Error && shareErr.name !== 'AbortError') {
            console.error('Share failed:', shareErr)
          }
        }
      }
    } catch (err) {
      toast.error('Could not copy update. Try again.')
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
