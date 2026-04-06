'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useCallback, useState, useTransition, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { postLoginDestination } from '@/lib/post-login-destination'

export interface LoginFormProps {
  /** Post-login path from `?from=` (passed from server page — avoids `useSearchParams` suspend/hydration gaps). */
  redirectFrom?: string | null
}

type LoginFormState = Record<string, never>

/**
 * Login uses a `role="form"` container plus `type="button"` — not a native `<form method="post">`.
 * Some automation browsers issue a full document POST to `/login` on native submit, which skips
 * `api.login` and reloads the page. Client-only submission keeps same-origin session flow intact.
 *
 * Email/password are **controlled** so tooling that fills inputs and dispatches `input` events
 * (e.g. Browser MCP) stays in sync with React; uncontrolled refs alone can miss those updates.
 */
export function LoginForm({ redirectFrom = null }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginAction = useCallback(
    async (_prevState: LoginFormState, formData: FormData): Promise<LoginFormState> => {
      const emailVal = String(formData.get('email') ?? '').trim()
      const passwordVal = String(formData.get('password') ?? '')
      if (!emailVal || !passwordVal) {
        toast.error('Enter your email and password.')
        return {}
      }
      try {
        await api.login({ email: emailVal, password: passwordVal })
        toast.success('Signed in')
        router.push(postLoginDestination(redirectFrom))
        router.refresh()
        return {}
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Sign-in failed')
        return {}
      }
    },
    [router, redirectFrom],
  )

  const [, formAction, isPending] = useActionState<LoginFormState, FormData>(loginAction, {})
  const [, startTransition] = useTransition()

  const runLogin = useCallback(() => {
    const fd = new FormData()
    fd.set('email', email)
    fd.set('password', password)
    startTransition(() => {
      formAction(fd)
    })
  }, [email, password, formAction, startTransition])

  const handleFieldKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return
      e.preventDefault()
      runLogin()
    },
    [runLogin],
  )

  return (
    <div role="form" aria-label="Sign in" className="space-y-5">
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
          onKeyDown={handleFieldKeyDown}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleFieldKeyDown}
          className="w-full rounded-xl border border-line/90 bg-white px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-600"
        />
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={runLogin}
        className="w-full rounded-xl bg-brand-700 text-white text-sm font-semibold py-3 shadow-sm border border-brand-800/20 hover:bg-brand-800 disabled:opacity-60 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </div>
  )
}
