import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-mesh-page bg-canvas">
      <main id="main-content" className="max-w-md text-center space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-800/90">404</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          This page does not exist
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          The link may be broken or the page was removed. If you were signed out, sign in again from the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold bg-brand-700 text-white border border-brand-800/20 shadow-sm hover:bg-brand-800 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold border border-line/90 bg-surface-raised text-stone-800 hover:bg-surface transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Log in
          </Link>
        </div>
      </main>
    </div>
  )
}
