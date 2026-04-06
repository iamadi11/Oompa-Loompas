import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '../../components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Log in',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-mesh-page bg-canvas">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block font-display text-2xl font-semibold tracking-tight text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-md"
          >
            Revenue
          </Link>
          <p className="text-sm text-stone-600">Sign in to your workspace</p>
        </div>
        <div className="rounded-2xl border border-line/90 bg-surface-raised p-6 sm:p-8 shadow-card">
          <Suspense fallback={<p className="text-sm text-stone-500 text-center">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-xs text-stone-500">
          <Link href="/" className="text-brand-800 hover:text-brand-900 font-medium">
            Back to product page
          </Link>
        </p>
      </div>
    </div>
  )
}
