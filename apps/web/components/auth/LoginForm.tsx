'use client'

import { useCallback, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { navigateAfterLogin } from '@/lib/post-login-destination'

export interface LoginFormProps {
  /** Post-login path from `?from=` (passed from server page — avoids `useSearchParams` suspend/hydration gaps). */
  redirectFrom?: string | null
}

/**
 * Client-side login: `onSubmit` always `preventDefault()` so the browser never performs a document navigation.
 * The primary sign-in control is **`type="button"` + `onClick`**, not `type="submit"`, so automation tools that
 * synthesize clicks hit the same handler as users (some runners fire a native `submit` that bypasses React).
 * Inputs omit `name` so an accidental native submit does not put credentials in the URL. **Uncontrolled** inputs
 * (`defaultValue` + refs) keep DOM/automation-filled values stable through re-renders.
 * `noValidate` keeps empty submits in JS so we show the same toast as before (native `required` would block).
 */
export function LoginForm({ redirectFrom = null }: LoginFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const loginInFlightRef = useRef(false)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const runLogin = useCallback(async () => {
    if (loginInFlightRef.current) return
    const emailVal = (emailInputRef.current?.value.trim() || '').trim()
    const passwordVal = passwordInputRef.current?.value || ''
    if (!emailVal || !passwordVal) {
      const msg = 'Enter your email and password.'
      setFormError(msg)
      toast.error(msg)
      return
    }
    loginInFlightRef.current = true
    setIsSubmitting(true)
    setFormError(null)
    try {
      await api.login({ email: emailVal, password: passwordVal })
      toast.success('Signed in')
      navigateAfterLogin(redirectFrom)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed'
      setFormError(msg)
      toast.error(msg)
    } finally {
      loginInFlightRef.current = false
      setIsSubmitting(false)
    }
  }, [redirectFrom])

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void runLogin()
    },
    [runLogin],
  )

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Sign in" className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="login-email" className="block text-sm font-medium text-stone-800">
          Email
        </label>
        <input
          id="login-email"
          ref={emailInputRef}
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(formError)}
          defaultValue=""
          onInput={() => setFormError(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              passwordInputRef.current?.focus()
            }
          }}
          className="w-full rounded-xl border border-line/90 bg-white px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-600"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-sm font-medium text-stone-800">
          Password
        </label>
        <input
          id="login-password"
          ref={passwordInputRef}
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(formError)}
          defaultValue=""
          onInput={() => setFormError(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void runLogin()
            }
          }}
          className="w-full rounded-xl border border-line/90 bg-white px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-600"
        />
      </div>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => void runLogin()}
        className="w-full rounded-xl bg-brand-700 text-white text-sm font-semibold py-3 shadow-sm border border-brand-800/20 hover:bg-brand-800 disabled:opacity-60 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
      {formError ? (
        <p role="alert" aria-live="polite" className="text-sm text-red-700">
          {formError}
        </p>
      ) : null}
    </form>
  )
}
