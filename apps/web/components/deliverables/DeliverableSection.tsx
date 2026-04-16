'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { Deliverable } from '@oompa/types'
import { DeliverableRow } from './DeliverableRow'
import { AddDeliverableForm } from './AddDeliverableForm'
import { Button } from '@/components/ui/Button'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

interface DeliverableSectionProps {
  dealId: string
  dealTitle: string
  brandName: string
  initialDeliverables: Deliverable[]
}

export function DeliverableSection({
  dealId,
  dealTitle,
  brandName,
  initialDeliverables,
}: DeliverableSectionProps) {
  const router = useRouter()
  const prefersReduced = usePrefersReducedMotion()
  const listRef = useRef<HTMLDivElement>(null)

  /** From server; must not freeze initial props — router.refresh() supplies new data. */
  const deliverables = initialDeliverables
  const [showAddForm, setShowAddForm] = useState(false)

  const handleChange = useCallback(() => {
    router.refresh()
    setShowAddForm(false)
  }, [router])

  useGSAP(
    () => {
      if (prefersReduced || !listRef.current) return

      const rows = listRef.current.querySelectorAll('.deliverable-row-item')
      gsap.fromTo(
        rows,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.5,
          ease: 'power2.out',
          clearProps: 'all',
        },
      )
    },
    { dependencies: [deliverables, prefersReduced], scope: listRef },
  )

  const pendingCount = deliverables.filter((d) => d.status === 'PENDING').length
  const overdueCount = deliverables.filter((d) => d.isOverdue).length
  const completedCount = deliverables.filter((d) => d.status === 'COMPLETED').length

  return (
    <section aria-labelledby="deliverables-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2
            id="deliverables-heading"
            className="font-display text-lg font-semibold text-stone-900"
          >
            Deliverables
          </h2>
          {deliverables.length > 0 && (
            <span className="text-xs text-stone-500">
              {completedCount}/{deliverables.length} done
              {overdueCount > 0 && (
                <span className="ml-2 text-red-600 font-medium">· {overdueCount} overdue</span>
              )}
            </span>
          )}
        </div>
        {!showAddForm && (
          <Button variant="secondary" size="sm" onClick={() => setShowAddForm(true)}>
            + Add deliverable
          </Button>
        )}
      </div>

      {/* Progress indicator when there are deliverables */}
      {deliverables.length > 0 && (
        <div className="mb-4">
          <div className="w-full bg-line/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-600 h-1.5 rounded-full transition-all"
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
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-stone-500">
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
        <div className="flex flex-col items-center py-8 text-center rounded-xl border border-dashed border-line-strong/60 bg-surface/50">
          <p className="text-sm text-stone-600">No deliverables added.</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mt-3 text-sm font-semibold text-brand-800 hover:text-brand-900 underline underline-offset-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            aria-label="Add deliverable"
          >
            Add the content you have committed to deliver
          </button>
        </div>
      )}

      {/* Deliverable list */}
      {deliverables.length > 0 && (
        <div ref={listRef} className="flex flex-col gap-2 mb-4">
          {deliverables.map((deliverable) => (
            <div
              key={deliverable.id}
              className="deliverable-row-item"
              style={{ opacity: prefersReduced ? 1 : 0 }}
            >
              <DeliverableRow
                deliverable={deliverable}
                onUpdate={handleChange}
                dealTitle={dealTitle}
                brandName={brandName}
              />
            </div>
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
