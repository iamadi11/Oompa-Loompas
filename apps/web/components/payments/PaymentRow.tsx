'use client'

import { useState } from 'react'
import type { Payment } from '@oompa/types'
import { formatCurrency, formatDate } from '@oompa/utils'
import { api, paymentInvoiceHref } from '@/lib/api'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { SharePaymentReminderButton } from './CopyPaymentReminderButton'
import { Button } from '@/components/ui/Button'

interface PaymentRowProps {
  dealId: string
  dealTitle: string
  brandName: string
  payment: Payment
  shareToken?: string | null
  onUpdate: () => void
}

export function PaymentRow({
  dealId,
  dealTitle,
  brandName,
  payment,
  shareToken,
  onUpdate,
}: PaymentRowProps) {
  const [marking, setMarking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [remindLoading, setRemindLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  async function markReceived() {
    setMarking(true)
    try {
      await api.updatePayment(payment.id, {
        status: 'RECEIVED',
        receivedAt: new Date().toISOString(),
      })
      onUpdate()
    } catch {
      // Silently reset — the server error will appear if the parent re-fetches
    } finally {
      setMarking(false)
    }
  }

  async function removePayment() {
    const label = formatCurrency(payment.amount, payment.currency as 'INR' | 'USD' | 'EUR' | 'GBP')
    if (!window.confirm(`Remove this ${label} payment milestone? This cannot be undone.`)) {
      return
    }
    setDeleting(true)
    try {
      await api.deletePayment(payment.id)
      onUpdate()
    } catch {
      // Parent refresh will surface persisted state; avoid silent success
    } finally {
      setDeleting(false)
    }
  }

  async function updateReminder(remindAt: string | null) {
    setRemindLoading(true)
    try {
      // Store midnight UTC of the chosen date (server cron runs in UTC)
      await api.updatePayment(payment.id, {
        remindAt: remindAt ? new Date(remindAt).toISOString() : null,
      })
      onUpdate()
    } catch {
      // Parent re-fetch will show persisted state
    } finally {
      setRemindLoading(false)
      setShowDatePicker(false)
    }
  }

  const canMarkReceived =
    payment.status === 'PENDING' || payment.status === 'PARTIAL' || payment.isOverdue
  const canShareReminder = payment.status !== 'RECEIVED' && payment.status !== 'REFUNDED'

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div
      className={`scroll-mt-28 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-4 py-3 rounded-xl border shadow-sm ${
        payment.isOverdue ? 'border-red-200/90 bg-red-50/80' : 'border-line/70 bg-surface-raised'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-stone-900 text-sm tabular-nums">
            {formatCurrency(payment.amount, payment.currency as 'INR' | 'USD' | 'EUR' | 'GBP')}
          </span>
          <PaymentStatusBadge status={payment.status} isOverdue={payment.isOverdue} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          {payment.dueDate && (
            <span>
              Due {formatDate(payment.dueDate, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {payment.receivedAt && (
            <span>
              Received {formatDate(payment.receivedAt, { day: 'numeric', month: 'short' })}
            </span>
          )}
          {payment.remindAt && (
            <span className="flex items-center gap-1 text-brand-700 font-medium">
              Reminder:{' '}
              {formatDate(payment.remindAt, { day: 'numeric', month: 'short' })}
              <button
                type="button"
                onClick={() => void updateReminder(null)}
                disabled={remindLoading}
                className="ml-0.5 text-stone-400 hover:text-red-500 transition-colors duration-150 motion-reduce:transition-none disabled:opacity-40 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                aria-label="Clear scheduled reminder"
              >
                ×
              </button>
            </span>
          )}
          {payment.notes && <span className="truncate max-w-xs">{payment.notes}</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 border-t border-line/50 sm:border-0 pt-2 sm:pt-0">
        <a
          href={paymentInvoiceHref(dealId, payment.id, shareToken)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md text-sm font-semibold text-brand-800 underline underline-offset-2 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          aria-label={`View printable invoice for ${formatCurrency(payment.amount, payment.currency as 'INR' | 'USD' | 'EUR' | 'GBP')} payment`}
        >
          View invoice
        </a>
        {canShareReminder ? (
          <SharePaymentReminderButton
            dealId={dealId}
            paymentId={payment.id}
            dealTitle={dealTitle}
            brandName={brandName}
            amount={payment.amount}
            currency={payment.currency as 'INR' | 'USD' | 'EUR' | 'GBP'}
            dueDate={payment.dueDate}
            shareToken={shareToken}
          />
        ) : null}
        {canShareReminder && !payment.remindAt && (
          showDatePicker ? (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                min={todayStr}
                disabled={remindLoading}
                className="text-xs rounded-md border border-line px-2 py-1 bg-canvas text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:opacity-40"
                aria-label="Select reminder date"
                onChange={(e) => {
                  if (e.target.value) void updateReminder(e.target.value)
                }}
              />
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400"
                aria-label="Cancel reminder"
              >
                ✕
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={remindLoading}
              onClick={() => setShowDatePicker(true)}
              aria-label="Schedule a push reminder for this payment"
            >
              Remind me
            </Button>
          )
        )}
        {canMarkReceived && (
          <Button
            variant="secondary"
            size="sm"
            loading={marking}
            onClick={() => void markReceived()}
            aria-label={`Mark payment of ${formatCurrency(payment.amount, payment.currency as 'INR' | 'USD' | 'EUR' | 'GBP')} as received`}
          >
            Mark received
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          loading={deleting}
          disabled={marking}
          onClick={() => void removePayment()}
          aria-label={`Delete payment milestone of ${formatCurrency(payment.amount, payment.currency as 'INR' | 'USD' | 'EUR' | 'GBP')}`}
          className="!text-red-700 hover:!bg-red-50 focus-visible:!ring-red-500"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
