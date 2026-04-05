'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Payment, Currency } from '@oompa/types'
import { computePaymentSummary } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { PaymentRow } from './PaymentRow'
import { AddPaymentForm } from './AddPaymentForm'
import { Button } from '../ui/Button'

interface PaymentSectionProps {
  dealId: string
  dealValue: number
  dealCurrency: Currency
  initialPayments: Payment[]
}

export function PaymentSection({
  dealId,
  dealValue,
  dealCurrency,
  initialPayments,
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
      <div className="flex items-center justify-between mb-4">
        <h2 id="payments-heading" className="text-base font-semibold text-gray-900">
          Payments
        </h2>
        {!showAddForm && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            + Add payment
          </Button>
        )}
      </div>

      {/* Summary row */}
      <div
        className={`grid grid-cols-3 gap-3 mb-5 p-4 rounded-xl border ${
          summary.hasOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'
        }`}
      >
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Contracted</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">
            {formatCurrency(summary.totalContracted, dealCurrency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Received</p>
          <p className="text-lg font-bold text-green-700 mt-0.5">
            {formatCurrency(summary.totalReceived, dealCurrency)}
          </p>
        </div>
        <div>
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              summary.hasOverdue ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {summary.hasOverdue ? 'Overdue' : 'Outstanding'}
          </p>
          <p
            className={`text-lg font-bold mt-0.5 ${
              summary.hasOverdue ? 'text-red-700' : 'text-gray-900'
            }`}
          >
            {formatCurrency(summary.totalOutstanding, dealCurrency)}
          </p>
        </div>
      </div>

      {/* Payment list */}
      {payments.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-sm text-gray-500">No payment milestones recorded yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium underline underline-offset-2"
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
              payment={payment}
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
