const panelClass =
  'rounded-2xl border border-line/90 bg-surface-raised p-5 sm:p-6 shadow-card w-full'

/** Static layout mirror for boneyard capture — deal detail inside workspace main. */
export function DealDetailFixture() {
  return (
    <div className="max-w-2xl space-y-6 pb-8 w-full">
      <div className="mb-2 space-y-3">
        <div className="h-3 w-28 rounded bg-stone-400/35" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="h-9 flex-1 max-w-md rounded bg-stone-400/45" />
          <div className="h-7 w-24 rounded-full bg-stone-400/35" />
        </div>
        <div className="h-10 w-44 rounded bg-stone-400/40 mt-4" />
      </div>

      <div className={panelClass}>
        <div className="h-5 w-40 rounded bg-stone-400/40 mb-4" />
        <div className="h-4 w-full rounded bg-stone-400/30 mb-2" />
        <div className="h-4 w-4/5 max-w-md rounded bg-stone-400/25" />
      </div>

      <div className={panelClass}>
        <div className="h-5 w-36 rounded bg-stone-400/40 mb-4" />
        <div className="h-12 w-full rounded-xl bg-stone-400/20" />
      </div>

      <div className={panelClass}>
        <div className="h-5 w-28 rounded bg-stone-400/40 mb-5" />
        <div className="space-y-3">
          <div className="h-10 w-full rounded-lg bg-stone-400/25" />
          <div className="h-10 w-full rounded-lg bg-stone-400/25" />
        </div>
      </div>
    </div>
  )
}
