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
}

export function CopyPaymentReminderButton({
  dealId,
  paymentId,
  dealTitle,
  brandName,
  amount,
  currency,
  dueDate,
}: CopyPaymentReminderButtonProps) {
  const [busy, setBusy] = useState(false)

  async function copy() {
    setBusy(true)
    try {
      const invoiceUrl = paymentInvoiceAbsoluteUrl(dealId, paymentId)
      const text = buildPaymentReminderMessage({
        dealTitle,
        brandName,
        amount,
        currency,
        dueDateIso: dueDate,
        invoiceUrl,
      })
      await navigator.clipboard.writeText(text)
      toast.success('Reminder copied to clipboard')
    } catch {
      toast.error('Could not copy. Try again or copy manually.')
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
      onClick={() => void copy()}
      aria-label="Copy payment reminder message to clipboard"
    >
      Copy reminder
    </Button>
  )
}
