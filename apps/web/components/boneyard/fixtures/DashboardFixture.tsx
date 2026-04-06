/** Static layout mirror for `npx boneyard-js build` — not shown in production routes. */
export function DashboardFixture() {
  return (
    <div className="w-full space-y-8 sm:space-y-10 py-2 sm:py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-stone-400/40" />
          <div className="h-8 w-48 max-w-full rounded bg-stone-400/45" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-brand-700/50" />
      </div>

      <section className="rounded-2xl border border-line/80 bg-surface-raised/60 p-4 sm:p-5">
        <div className="h-4 w-40 rounded bg-stone-400/35 mb-3" />
        <div className="h-4 w-full max-w-md rounded bg-stone-400/30" />
      </section>

      <section>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-line/90 bg-surface-raised p-4 sm:p-5 shadow-card min-h-[88px]"
            >
              <div className="h-3 w-20 rounded bg-stone-400/35 mb-3" />
              <div className="h-7 w-28 rounded bg-stone-400/45" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="h-6 w-36 rounded bg-stone-400/40" />
          <div className="h-4 w-16 rounded bg-stone-400/35" />
        </div>
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-line/80 bg-surface-raised p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="h-4 flex-1 max-w-xs rounded bg-stone-400/40" />
              <div className="h-4 w-24 rounded bg-stone-400/35" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
