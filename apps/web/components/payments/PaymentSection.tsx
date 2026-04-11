'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Payment, Currency } from '@oompa/types'
import { computePaymentSummary } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { PaymentRow } from './PaymentRow'
import { AddPaymentForm } from './AddPaymentForm'
import { Button } from '@/components/ui/Button'

interface PaymentSectionProps {
  dealId: string
  dealTitle: string
  brandName: string
  dealValue: number
  dealCurrency: Currency
  initialPayments: Payment[]
  shareToken?: string | null
}

export function PaymentSection({
  dealId,
  dealTitle,
  brandName,
  dealValue,
  dealCurrency,
  initialPayments,
  shareToken,
}: PaymentSectionProps) {
  const router = useRouter()
  const payments = initialPayments
  const [showAddForm, setShowAddForm] = useState(false)

  const summary = computePaymentSummary(
    dealValue,
    payments.map((p) => ({
      amount: p.amount,
      status: p.status,
      dueDate: p.dueDate ? new Date(p.dueDate) : null,
    })),
  )

  const handlePaymentChange = useCallback(() => {
    router.refresh()
    setShowAddForm(false)
  }, [router])

  return (
    <section aria-labelledby="payments-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 id="payments-heading" className="font-display text-lg font-semibold text-stone-900">
          Payments
        </h2>
        {!showAddForm && (
          <Button variant="secondary" size="sm" onClick={() => setShowAddForm(true)}>
            + Add payment
          </Button>
        )}
      </div>

      {/* Summary row */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 p-4 sm:p-5 rounded-2xl border shadow-sm ${
          summary.hasOverdue ? 'border-red-200/90 bg-red-50/80' : 'border-line/80 bg-surface/80'
        }`}
      >
        <div>
          <p className="text-[0.65rem] text-stone-500 font-semibold uppercase tracking-[0.12em]">
            Contracted
          </p>
          <p className="text-lg font-bold tabular-nums text-stone-900 mt-1">
            {formatCurrency(summary.totalContracted, dealCurrency)}
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] text-stone-500 font-semibold uppercase tracking-[0.12em]">
            Received
          </p>
          <p className="text-lg font-bold tabular-nums text-emerald-800 mt-1">
            {formatCurrency(summary.totalReceived, dealCurrency)}
          </p>
        </div>
        <div>
          <p
            className={`text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${
              summary.hasOverdue ? 'text-red-700' : 'text-stone-500'
            }`}
          >
            {summary.hasOverdue ? 'Overdue' : 'Outstanding'}
          </p>
          <p
            className={`text-lg font-bold tabular-nums mt-1 ${
              summary.hasOverdue ? 'text-red-800' : 'text-stone-900'
            }`}
          >
            {formatCurrency(summary.totalOutstanding, dealCurrency)}
          </p>
        </div>
      </div>

      {/* Payment list */}
      {payments.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center py-8 text-center rounded-xl border border-dashed border-line-strong/60 bg-surface/50">
          <p className="text-sm text-stone-600">No payment milestones recorded yet.</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mt-3 text-sm font-semibold text-brand-800 hover:text-brand-900 underline underline-offset-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Add your first payment milestone
          </button>
        </div>
      )}

      {payments.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {payments.map((payment) => (
            <PaymentRow
              key={payment.id}
              dealId={dealId}
              dealTitle={dealTitle}
              brandName={brandName}
              payment={payment}
              shareToken={shareToken}
              onUpdate={handlePaymentChange}
            />
          ))}
        </div>
      )}

      {showAddForm && (
        <AddPaymentForm
          dealId={dealId}
          dealCurrency={dealCurrency}
          onSuccess={handlePaymentChange}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </section>
  )
}
