'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Deliverable } from '@oompa/types'
import { DeliverableRow } from './DeliverableRow'
import { AddDeliverableForm } from './AddDeliverableForm'
import { Button } from '../ui/Button'

interface DeliverableSectionProps {
  dealId: string
  initialDeliverables: Deliverable[]
}

export function DeliverableSection({ dealId, initialDeliverables }: DeliverableSectionProps) {
  const router = useRouter()
  /** From server; must not freeze initial props — router.refresh() supplies new data. */
  const deliverables = initialDeliverables
  const [showAddForm, setShowAddForm] = useState(false)

  const handleChange = useCallback(() => {
    router.refresh()
    setShowAddForm(false)
  }, [router])

  const pendingCount = deliverables.filter((d) => d.status === 'PENDING').length
  const overdueCount = deliverables.filter((d) => d.isOverdue).length
  const completedCount = deliverables.filter((d) => d.status === 'COMPLETED').length

  return (
    <section aria-labelledby="deliverables-heading">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 id="deliverables-heading" className="text-base font-semibold text-gray-900">
            Deliverables
          </h2>
          {deliverables.length > 0 && (
            <span className="text-xs text-gray-500">
              {completedCount}/{deliverables.length} done
              {overdueCount > 0 && (
                <span className="ml-2 text-red-600 font-medium">
                  · {overdueCount} overdue
                </span>
              )}
            </span>
          )}
        </div>
        {!showAddForm && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            + Add deliverable
          </Button>
        )}
      </div>

      {/* Progress indicator when there are deliverables */}
      {deliverables.length > 0 && (
        <div className="mb-4">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{
                width: `${deliverables.length > 0 ? (completedCount / deliverables.length) * 100 : 0}%`,
              }}
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={deliverables.length}
              aria-label={`${completedCount} of ${deliverables.length} deliverables completed`}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{pendingCount} pending</span>
            <span>{completedCount} completed</span>
            {overdueCount > 0 && (
              <span className="text-red-600 font-medium">{overdueCount} overdue</span>
            )}
          </div>
        </div>
      )}

      {/* Zero state */}
      {deliverables.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-sm text-gray-500">No deliverables added.</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium underline underline-offset-2"
            aria-label="Add deliverable"
          >
            Add the content you have committed to deliver
          </button>
        </div>
      )}

      {/* Deliverable list */}
      {deliverables.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {deliverables.map((deliverable) => (
            <DeliverableRow
              key={deliverable.id}
              deliverable={deliverable}
              onUpdate={handleChange}
            />
          ))}
        </div>
      )}

      {showAddForm && (
        <AddDeliverableForm
          dealId={dealId}
          onSuccess={handleChange}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </section>
  )
}
