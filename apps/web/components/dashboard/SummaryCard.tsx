interface SummaryCardProps {
  label: string
  value: string
  accent?: 'default' | 'green' | 'red' | 'yellow' | undefined
  subtext?: string | undefined
}

const ACCENT_STYLES = {
  default: 'bg-white border-gray-100',
  green: 'bg-white border-gray-100',
  red: 'bg-red-50 border-red-200',
  yellow: 'bg-yellow-50 border-yellow-200',
}

const VALUE_STYLES = {
  default: 'text-gray-900',
  green: 'text-green-700',
  red: 'text-red-700',
  yellow: 'text-yellow-700',
}

export function SummaryCard({ label, value, accent = 'default', subtext }: SummaryCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${ACCENT_STYLES[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${VALUE_STYLES[accent]}`}>
        {value}
      </p>
      {subtext && (
        <p className="mt-1 text-xs text-gray-400">{subtext}</p>
      )}
    </div>
  )
}
