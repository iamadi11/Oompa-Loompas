import type { Metadata } from 'next'
import type { DeliverableApprovalView } from '@oompa/types'
import { getServerApiBaseUrl } from '@/lib/get-server-api-base-url'
import { ApprovalAction } from './ApprovalAction'

interface Props {
  params: Promise<{ token: string }>
}

async function loadApprovalView(token: string): Promise<DeliverableApprovalView | null> {
  try {
    const res = await fetch(`${getServerApiBaseUrl()}/api/v1/approvals/${token}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const body = (await res.json()) as { data: DeliverableApprovalView }
    return body.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const view = await loadApprovalView(token)
  if (!view) return { title: 'Approval link not found' }
  return {
    title: `Approve: ${view.title} — ${view.dealBrandName}`,
    description: `Review and approve this deliverable for ${view.dealBrandName}.`,
  }
}

export default async function ApprovalPage({ params }: Props) {
  const { token } = await params
  const view = await loadApprovalView(token)

  if (!view) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-xl font-semibold text-stone-900">
            This link is no longer valid
          </h1>
          <p className="mt-3 text-sm text-stone-500">
            The approval link has been revoked or does not exist.
          </p>
        </div>
      </div>
    )
  }

  return <ApprovalAction token={token} initial={view} />
}
