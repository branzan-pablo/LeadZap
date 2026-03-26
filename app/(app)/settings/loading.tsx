export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <div className="h-6 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="mt-1 h-4 w-48 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-4">
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
