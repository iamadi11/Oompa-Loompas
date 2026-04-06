'use client'

import { useRouter } from 'next/navigation'
import {
  useActionState,
  useCallback,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { postLoginDestination } from '@/lib/post-login-destination'

export interface LoginFormProps {
  /** Post-login path from `?from=` (passed from server page — avoids `useSearchParams` suspend/hydration gaps). */
  redirectFrom?: string | null
}

type LoginFormState = Record<string, never>

function LoginSubmitButton({
  pending,
  onPress,
}: {
  pending: boolean
  onPress: (form: HTMLFormElement) => void
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        const form = e.currentTarget.form
        if (form) onPress(form)
      }}
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
        toast.error('Enter your email and password.')
        return {}
      }
      try {
        await api.login({ email, password })
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

  const [, formAction, isPending] = useActionState(loginAction, {})
  const [, startTransition] = useTransition()

  const runLogin = useCallback(
    (formEl: HTMLFormElement) => {
      const fd = new FormData(formEl)
      startTransition(() => {
        formAction(fd)
      })
    },
    [formAction, startTransition],
  )

  /** `method="post"` avoids default GET putting credentials in the query string on accidental native submit. */
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      runLogin(e.currentTarget)
    },
    [runLogin],
  )

  const handleFormKeyDown = useCallback(
    (e: KeyboardEvent<HTMLFormElement>) => {
      if (e.key !== 'Enter') return
      if (!(e.target instanceof HTMLInputElement)) return
      e.preventDefault()
      runLogin(e.currentTarget)
    },
    [runLogin],
  )

  return (
    <form method="post" onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-5">
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
      <LoginSubmitButton pending={isPending} onPress={runLogin} />
    </form>
  )
}
