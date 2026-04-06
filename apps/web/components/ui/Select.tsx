import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string | undefined
  placeholder?: string
}

export function Select({
  label,
  options,
  error,
  placeholder,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-stone-700">
        {label}
        {props.required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <select
        id={selectId}
        aria-describedby={error ? `${selectId}-error` : undefined}
        aria-invalid={error ? true : undefined}
        className={`
          block w-full rounded-xl border px-3 py-2.5 text-sm shadow-sm
          transition-colors bg-surface-raised
          focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-500
          disabled:bg-surface disabled:cursor-not-allowed
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-line-strong/80'}
          ${className}
        `.trim()}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
