'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { readNamedInput } from '../../lib/forms/read-named-input'

export interface LoginFormProps {
  /** Post-login path from `?from=` (passed from server page — avoids `useSearchParams` suspend/hydration gaps). */
  redirectFrom?: string | null
}

export function LoginForm({ redirectFrom = null }: LoginFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const runLogin = useCallback(async () => {
    const form = formRef.current
    if (!form) return
    setError(null)
    const emailInput = readNamedInput(form, 'email')
    const passwordInput = readNamedInput(form, 'password')
    if (!emailInput || !passwordInput) {
      setError('Sign-in form is not ready. Refresh and try again.')
      return
    }
    const email = emailInput.value.trim()
    const password = passwordInput.value
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }
    setPending(true)
    try {
      await api.login({ email, password })
      const from = redirectFrom?.trim() || null
      const dest: Route =
        from && from.startsWith('/') && !from.startsWith('//') ? (from as Route) : '/dashboard'
      router.push(dest)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setPending(false)
    }
  }, [router, redirectFrom])

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void runLogin()
  }

  /** Separate path for button click: some automation tools fire click without a reliable `submit` event. */
  function onSignInClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    void runLogin()
  }

  return (
    <form
      ref={formRef}
      method="post"
      onSubmit={onFormSubmit}
      className="space-y-5"
    >
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
          className="w-full rounded-xl border border-line/90 bg-white px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-600"
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
          className="w-full rounded-xl border border-line/90 bg-white px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-600"
        />
      </div>
      {error ? (
        <p
          className="text-sm text-red-800 bg-red-50 border border-red-200/80 rounded-lg px-3 py-2"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={onSignInClick}
        className="w-full rounded-xl bg-brand-700 text-white text-sm font-semibold py-3 shadow-sm border border-brand-800/20 hover:bg-brand-800 disabled:opacity-60 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
