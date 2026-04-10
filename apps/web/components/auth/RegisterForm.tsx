'use client'

import { useCallback, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { navigateAfterLogin } from '@/lib/post-login-destination'

/**
 * Registration form — same conventions as LoginForm:
 * - Uncontrolled inputs with refs (stable across re-renders)
 * - type="button" primary submit to avoid native form navigation
 * - noValidate — validation in JS, same error UX
 * - Password confirm is client-side only; server only receives email + password
 */
export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const inFlightRef = useRef(false)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmInputRef = useRef<HTMLInputElement>(null)

  const runRegister = useCallback(async () => {
    if (inFlightRef.current) return
    const email = (emailInputRef.current?.value ?? '').trim()
    const password = passwordInputRef.current?.value ?? ''
    const confirm = confirmInputRef.current?.value ?? ''

    if (!email || !password || !confirm) {
      const msg = 'All fields are required.'
      setFormError(msg)
      toast.error(msg)
      return
    }
    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters.'
      setFormError(msg)
      toast.error(msg)
      return
    }
    if (password !== confirm) {
      const msg = 'Passwords do not match.'
      setFormError(msg)
      toast.error(msg)
      return
    }

    inFlightRef.current = true
    setIsSubmitting(true)
    setFormError(null)
    try {
      await api.register({ email, password })
      toast.success('Account created — welcome!')
      navigateAfterLogin(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setFormError(msg)
      toast.error(msg)
    } finally {
      inFlightRef.current = false
      setIsSubmitting(false)
    }
  }, [])

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void runRegister()
  }, [runRegister])

  const inputClass =
    'w-full rounded-xl border border-line/90 bg-surface-raised px-3 py-2.5 text-stone-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 focus:shadow-[0_0_0_3px_rgba(225,43,43,0.18)]'

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Create account" className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="reg-email" className="block text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="reg-email"
          ref={emailInputRef}
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(formError)}
          defaultValue=""
          onInput={() => setFormError(null)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); passwordInputRef.current?.focus() } }}
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="reg-password" className="block text-sm font-medium text-stone-700">
          Password <span className="text-stone-500 font-normal">(min 8 characters)</span>
        </label>
        <input
          id="reg-password"
          ref={passwordInputRef}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={Boolean(formError)}
          defaultValue=""
          onInput={() => setFormError(null)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmInputRef.current?.focus() } }}
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="reg-confirm" className="block text-sm font-medium text-stone-700">
          Confirm password
        </label>
        <input
          id="reg-confirm"
          ref={confirmInputRef}
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(formError)}
          defaultValue=""
          onInput={() => setFormError(null)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void runRegister() } }}
          className={inputClass}
        />
      </div>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => void runRegister()}
        className="w-full rounded-xl bg-brand-700 text-white text-sm font-semibold py-3 shadow-sm border border-brand-800/20 hover:bg-brand-800 hover:shadow-glow-sm disabled:opacity-60 transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
      {formError ? (
        <p role="alert" aria-live="polite" className="text-sm text-red-400">
          {formError}
        </p>
      ) : null}
    </form>
  )
}
