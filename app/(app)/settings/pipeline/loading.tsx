export default function PipelineSettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="mt-1 h-4 w-56 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
            <div className="h-5 w-5 animate-pulse rounded bg-zinc-200" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
            </div>
            <div className="h-8 w-8 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>
      <div className="h-9 w-36 animate-pulse rounded-lg bg-zinc-200" />
    </div>
  )
}
