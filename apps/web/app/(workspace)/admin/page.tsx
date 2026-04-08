import type { Metadata } from 'next'
import Link from 'next/link'
import { serverApiFetch } from '@/lib/server-api-fetch'

export const metadata: Metadata = {
  title: 'Admin',
}

export default async function AdminPage() {
  const res = await serverApiFetch('/api/v1/admin/ping')

  if (res.status === 403) {
    return (
      <div className="max-w-lg space-y-4 py-4">
        <h1 className="font-display text-2xl font-semibold text-stone-900">Admin</h1>
        <p className="text-stone-600">Your account does not have admin access.</p>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-brand-800 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-md"
        >
          Back to overview
        </Link>
      </div>
    )
  }

  if (!res.ok) {
    return (
      <div className="max-w-lg space-y-4 py-4">
        <h1 className="font-display text-2xl font-semibold text-stone-900">Admin</h1>
        <p className="text-stone-600">Could not verify admin status (HTTP {res.status}).</p>
      </div>
    )
  }

  const body = (await res.json()) as { data: { ok: boolean; scope: string } }

  return (
    <div className="max-w-lg space-y-4 py-4">
      <h1 className="font-display text-2xl font-semibold text-stone-900">Admin</h1>
      <p className="text-stone-600 text-sm">
        RBAC probe succeeded (<span className="font-mono text-stone-800">{body.data.scope}</span>).
      </p>
      <p className="text-xs text-stone-500">
        Extend this area with operational tools as the product grows; keep permissions enforced on
        the API.
      </p>
    </div>
  )
}
