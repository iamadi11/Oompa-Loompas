'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { postLoginDestination } from '@/lib/post-login-destination'

export interface LoginFormProps {
  /** Post-login path from `?from=` (passed from server page — avoids `useSearchParams` suspend/hydration gaps). */
  redirectFrom?: string | null
}

/**
 * Client-side login: `onSubmit` always `preventDefault()` so the browser never performs a real navigation.
 * `method="post"` avoids accidental GET submissions putting fields in the query string before hydration.
 * Inputs omit `name` for the same reason; values come from controlled state only.
 * `noValidate` keeps empty submits in JS so we show the same toast as before (native `required` would block).
 */
export function LoginForm({ redirectFrom = null }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const emailVal = email.trim()
      const passwordVal = password
      if (!emailVal || !passwordVal) {
        toast.error('Enter your email and password.')
        return
      }
      setIsSubmitting(true)
      try {
        await api.login({ email: emailVal, password: passwordVal })
        toast.success('Signed in')
        router.push(postLoginDestination(redirectFrom))
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Sign-in failed')
      } finally {
        setIsSubmitting(false)
      }
    },
    [email, password, redirectFrom, router],
  )

  return (
    <form
      method="post"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Sign in"
      className="space-y-5"
    >
      <div className="space-y-2">
        <label htmlFor="login-email" className="block text-sm font-medium text-stone-800">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-line/90 bg-white px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-600"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-sm font-medium text-stone-800">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line/90 bg-white px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-600"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-700 text-white text-sm font-semibold py-3 shadow-sm border border-brand-800/20 hover:bg-brand-800 disabled:opacity-60 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
