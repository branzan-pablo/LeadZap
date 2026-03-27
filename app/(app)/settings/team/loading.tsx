export default function TeamSettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <div className="h-6 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="mt-1 h-4 w-64 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
            <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-200" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-36 animate-pulse rounded bg-zinc-200" />
              <div className="h-3 w-48 animate-pulse rounded bg-zinc-100" />
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>
      <div className="h-9 w-36 animate-pulse rounded-lg bg-zinc-200" />
    </div>
  )
}
