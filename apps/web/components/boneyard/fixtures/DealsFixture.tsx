/** Static layout mirror for boneyard capture — matches deals list chrome inside workspace main. */
export function DealsFixture() {
  return (
    <div className="w-full py-1 sm:py-2">
      <nav className="flex flex-wrap items-center gap-2 mb-5" aria-hidden>
        <div className="h-10 w-28 rounded-xl bg-brand-900/40" />
        <div className="h-10 w-36 rounded-xl bg-surface-raised border border-line/90" />
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-stone-400/35" />
          <div className="h-8 w-32 rounded bg-stone-400/45" />
          <div className="h-4 w-24 rounded bg-stone-400/30" />
        </div>
        <div className="h-11 w-32 rounded-xl bg-brand-700/50" />
      </div>

      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-line/90 bg-surface-raised p-5 shadow-card flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 max-w-full rounded bg-stone-400/40" />
              <div className="h-3 w-32 rounded bg-stone-400/30" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-stone-400/35" />
          </div>
        ))}
      </div>
    </div>
  )
}
