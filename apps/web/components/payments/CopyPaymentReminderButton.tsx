'use client'

import { useState } from 'react'
import type { Currency } from '@oompa/types'
import { buildPaymentReminderMessage } from '@oompa/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { paymentInvoiceAbsoluteUrl } from '@/lib/api'

export type CopyPaymentReminderButtonProps = {
  dealId: string
  paymentId: string
  dealTitle: string
  brandName: string
  amount: number
  currency: Currency
  dueDate: string | null
  shareToken?: string | null
}

export function SharePaymentReminderButton({
  dealId,
  paymentId,
  dealTitle,
  brandName,
  amount,
  currency,
  dueDate,
  shareToken,
}: CopyPaymentReminderButtonProps) {
  const [busy, setBusy] = useState(false)

  async function shareReminder() {
    setBusy(true)
    try {
      const invoiceUrl = paymentInvoiceAbsoluteUrl(dealId, paymentId, shareToken)
      const text = buildPaymentReminderMessage({
        dealTitle,
        brandName,
        amount,
        currency,
        dueDateIso: dueDate,
        invoiceUrl,
      })

      // Always copy to clipboard as primary action/fallback
      await navigator.clipboard.writeText(text)
      toast.success('Reminder copied to clipboard')

      // Attempt native share if available (won't block toast)
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: 'Payment Reminder',
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
      toast.error('Could not copy reminder. Try again.')
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
      aria-label="Share payment reminder message"
    >
      Share reminder
    </Button>
  )
}
