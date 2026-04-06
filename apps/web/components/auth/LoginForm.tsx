'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useCallback } from 'react'
import { useFormStatus } from 'react-dom'
import { api } from '../../lib/api'
import { postLoginDestination } from '../../lib/post-login-destination'

export interface LoginFormProps {
  /** Post-login path from `?from=` (passed from server page — avoids `useSearchParams` suspend/hydration gaps). */
  redirectFrom?: string | null
}

type LoginFormState = {
  error: string | null
}

function LoginSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-700 text-white text-sm font-semibold py-3 shadow-sm border border-brand-800/20 hover:bg-brand-800 disabled:opacity-60 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  )
}

export function LoginForm({ redirectFrom = null }: LoginFormProps) {
  const router = useRouter()

  const loginAction = useCallback(
    async (_prevState: LoginFormState, formData: FormData): Promise<LoginFormState> => {
      const email = String(formData.get('email') ?? '').trim()
      const password = String(formData.get('password') ?? '')
      if (!email || !password) {
        return { error: 'Enter your email and password.' }
      }
      try {
        await api.login({ email, password })
        router.push(postLoginDestination(redirectFrom))
        router.refresh()
        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Sign-in failed' }
      }
    },
    [router, redirectFrom],
  )

  const [state, formAction] = useActionState(loginAction, { error: null })

  return (
    <form action={formAction} className="space-y-5">
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
      {state.error ? (
        <p
          className="text-sm text-red-800 bg-red-50 border border-red-200/80 rounded-lg px-3 py-2"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <LoginSubmitButton />
    </form>
  )
}
