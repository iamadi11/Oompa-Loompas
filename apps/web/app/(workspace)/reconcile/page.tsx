import type { Metadata } from 'next'
import { ReconcilePage } from '@/components/reconcile/ReconcilePage'

export const metadata: Metadata = {
  title: 'Reconcile Payments',
}

export default function Page() {
  return <ReconcilePage />
}
