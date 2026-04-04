'use client'

import { useState } from 'react'
import type { Payment } from '@oompa/types'
import { formatCurrency, formatDate } from '@oompa/utils'
import { api } from '../../lib/api'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { Button } from '../ui/Button'

interface PaymentRowProps {
  payment: Payment
  onUpdate: () => void
}

export function PaymentRow({ payment, onUpdate }: PaymentRowProps) {
  const [marking, setMarking] = useState(false)

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

  const canMarkReceived = payment.status === 'PENDING' || payment.status === 'PARTIAL' || payment.isOverdue

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg border ${
        payment.isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">
            {formatCurrency(payment.amount, payment.currency as 'INR' | 'USD' | 'EUR' | 'GBP')}
          </span>
          <PaymentStatusBadge status={payment.status} isOverdue={payment.isOverdue} />
        </div>
        <div className="mt-0.5 flex items-center gap-4 text-xs text-gray-500">
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
          {payment.notes && <span className="truncate max-w-xs">{payment.notes}</span>}
        </div>
      </div>

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
    </div>
  )
}
