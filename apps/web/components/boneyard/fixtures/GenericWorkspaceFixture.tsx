/** Shared placeholder for simpler workspace routes (attention, admin, new deal form shell). */
export function GenericWorkspaceFixture() {
  return (
    <div className="w-full max-w-2xl space-y-6 py-2">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-stone-400/35" />
        <div className="h-8 w-56 max-w-full rounded bg-stone-400/45" />
        <div className="h-4 w-full max-w-lg rounded bg-stone-400/30" />
      </div>
      <div className="rounded-2xl border border-line/90 bg-surface-raised p-6 shadow-card space-y-4">
        <div className="h-10 w-full rounded-lg bg-stone-400/25" />
        <div className="h-10 w-full rounded-lg bg-stone-400/25" />
        <div className="h-11 w-40 rounded-xl bg-brand-700/45" />
      </div>
    </div>
  )
}
