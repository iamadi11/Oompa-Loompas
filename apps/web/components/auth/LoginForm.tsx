'use client'

import type { Route } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { api } from '../../lib/api'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await api.login({ email, password })
      const from = searchParams.get('from')
      const dest: Route =
        from && from.startsWith('/') && !from.startsWith('//') ? (from as Route) : '/dashboard'
      router.push(dest)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="login-email" className="block text-sm font-medium text-stone-800">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-line/90 bg-white px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-sm font-medium text-stone-800">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line/90 bg-white px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-500"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200/80 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-700 text-white text-sm font-semibold py-3 shadow-sm border border-brand-800/20 hover:bg-brand-800 disabled:opacity-60 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
