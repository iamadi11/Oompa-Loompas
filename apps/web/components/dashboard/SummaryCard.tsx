interface SummaryCardProps {
  label: string
  value: string
  accent?: 'default' | 'green' | 'red' | 'yellow' | undefined
  subtext?: string | undefined
}

const ACCENT_STYLES = {
  default: 'bg-surface-raised border-line/90 shadow-card',
  green: 'bg-surface-raised border-emerald-200/80 shadow-card',
  red: 'bg-red-50/90 border-red-200/90 shadow-card',
  yellow: 'bg-amber-50/80 border-amber-200/80 shadow-card',
}

const VALUE_STYLES = {
  default: 'text-stone-900',
  green: 'text-emerald-800',
  red: 'text-red-800',
  yellow: 'text-amber-900',
}

export function SummaryCard({ label, value, accent = 'default', subtext }: SummaryCardProps) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${ACCENT_STYLES[accent]}`}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className={`mt-2 text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${VALUE_STYLES[accent]}`}>
        {value}
      </p>
      {subtext && (
        <p className="mt-1.5 text-xs text-stone-500 leading-snug">{subtext}</p>
      )}
    </div>
  )
}
