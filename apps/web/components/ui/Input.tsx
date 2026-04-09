import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | undefined
  hint?: string | undefined
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
        {label}
        {props.required && (
          <span className="text-red-500 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        aria-invalid={error ? true : undefined}
        className={`
          block w-full rounded-xl border px-3 py-2.5 text-sm shadow-sm
          placeholder-stone-400 transition-colors bg-surface-raised
          focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600
          focus:shadow-[0_0_0_3px_rgba(225,43,43,0.18)]
          disabled:bg-surface disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-line-strong/60'}
          ${className}
        `.trim()}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-stone-500">
          {hint}
        </p>
      )}
    </div>
  )
}
