function SkeletonItem() {
  return (
    <div className="flex items-start gap-3 border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
      <div className="mt-1 size-4 shrink-0 animate-pulse rounded border border-zinc-200 bg-zinc-100" />
      <div className="min-w-0 flex-1">
        <div className="h-4 w-48 animate-pulse rounded bg-zinc-200" />
        <div className="mt-1 h-3 w-32 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  )
}

export default function RemindersLoading() {
  return (
    <div className="p-6">
      <div className="h-6 w-28 animate-pulse rounded bg-zinc-200" />
      <div className="mt-1 h-4 w-64 animate-pulse rounded bg-zinc-100" />
      <div className="mt-6 space-y-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="mb-3 h-4 w-16 animate-pulse rounded bg-zinc-200" />
          <div className="space-y-3">
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </div>
        </div>
      </div>
    </div>
  )
}
