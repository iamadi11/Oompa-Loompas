import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { DealProposalView } from '@oompa/types'
import { formatCurrency } from '@oompa/utils'
import { StatusBadge } from '@/components/ui/Badge'
import { getServerApiBaseUrl } from '@/lib/get-server-api-base-url'

interface Props {
  params: Promise<{ token: string }>
}

async function loadProposal(token: string): Promise<DealProposalView | null> {
  try {
    const res = await fetch(`${getServerApiBaseUrl()}/api/v1/share/${token}`, {
      cache: 'no-store',
    })
    if (res.status === 404) return null
    if (!res.ok) return null
    const body = (await res.json()) as { data: DealProposalView }
    return body.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const proposal = await loadProposal(token)
  if (!proposal) return { title: 'Proposal not found' }
  return {
    title: `${proposal.title} — ${proposal.brandName}`,
    description: `Deal proposal for ${proposal.brandName}. Value: ${formatCurrency(proposal.value, proposal.currency)}.`,
  }
}

const sectionClass = 'rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm'

export default async function ProposalPage({ params }: Props) {
  const { token } = await params
  const proposal = await loadProposal(token)

  if (!proposal) {
    notFound()
  }

  const hasDeliverables = proposal.deliverables.length > 0
  const hasPayments = proposal.payments.length > 0

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[0.65rem] font-semibold text-stone-500 uppercase tracking-[0.14em]">
            {proposal.brandName}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mt-2">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 flex-1 leading-tight">
              {proposal.title}
            </h1>
            <StatusBadge status={proposal.status} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold tabular-nums text-stone-900 mt-4 tracking-tight">
            {formatCurrency(proposal.value, proposal.currency)}
          </p>
          {proposal.notes && (
            <p className="mt-4 text-sm text-stone-600 whitespace-pre-wrap">{proposal.notes}</p>
          )}
        </div>

        {/* Deliverables */}
        {hasDeliverables && (
          <div className={`${sectionClass} mb-4`}>
            <h2 className="font-display text-base font-semibold text-stone-900 mb-4">
              Deliverables
            </h2>
            <ul className="divide-y divide-stone-100">
              {proposal.deliverables.map((d) => (
                <li key={d.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{d.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {d.platform} · {d.type}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-stone-600 capitalize">
                        {d.status.toLowerCase()}
                      </span>
                      {d.dueDate && (
                        <p className="text-xs text-stone-400 mt-0.5">
                          Due {new Date(d.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payments */}
        {hasPayments && (
          <div className={sectionClass}>
            <h2 className="font-display text-base font-semibold text-stone-900 mb-4">Payments</h2>
            <ul className="divide-y divide-stone-100">
              {proposal.payments.map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        {formatCurrency(p.amount, p.currency)}
                      </p>
                      {p.dueDate && (
                        <p className="text-xs text-stone-400 mt-0.5">
                          Due {new Date(p.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-stone-600 capitalize">
                      {p.status.toLowerCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hasDeliverables && !hasPayments && (
          <p className="text-sm text-stone-500 text-center py-8">
            No deliverables or payments have been added to this proposal yet.
          </p>
        )}

        <p className="mt-8 text-center text-xs text-stone-400">
          Shared via Oompa · View only
        </p>
      </div>
    </div>
  )
}
