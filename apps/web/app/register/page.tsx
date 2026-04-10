import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { APP_DISPLAY_NAME } from '@/lib/product-meta'

export const metadata: Metadata = {
  title: 'Create account',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-mesh-page bg-canvas">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block font-display text-2xl font-semibold tracking-tight text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-md"
          >
            {APP_DISPLAY_NAME}
          </Link>
          <p className="text-sm text-stone-500">Create your workspace</p>
        </div>
        <div className="rounded-2xl border border-line/90 bg-surface-raised p-6 sm:p-8 shadow-card">
          <RegisterForm />
        </div>
        <p className="text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-brand-400 hover:text-brand-300 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
