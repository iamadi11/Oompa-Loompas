import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { APP_DISPLAY_NAME } from '@/lib/product-meta'

export const metadata: Metadata = {
  title: 'Log in',
}

interface LoginPageProps {
  searchParams: Promise<{ from?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams
  const rawFrom = sp['from']
  const redirectFrom = typeof rawFrom === 'string' ? rawFrom : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-mesh-page bg-canvas">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block font-display text-2xl font-semibold tracking-tight text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded-md"
          >
            {APP_DISPLAY_NAME}
          </Link>
          <p className="text-sm text-stone-600">Sign in to your workspace</p>
        </div>
        <div className="rounded-2xl border border-line/90 bg-surface-raised p-6 sm:p-8 shadow-card">
          <LoginForm redirectFrom={redirectFrom} />
        </div>
        <p className="text-center text-xs text-stone-500">
          <Link href="/" className="text-brand-400 hover:text-brand-300 font-medium">
            Back to product page
          </Link>
        </p>
      </div>
    </div>
  )
}
