function SkeletonCard() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
      <div className="mt-3 flex items-center gap-2">
        <div className="h-5 w-12 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-100" />
      </div>
    </div>
  )
}

function SkeletonColumn() {
  return (
    <div className="flex w-[280px] shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50">
      <div className="border-b border-zinc-200 px-3 py-2">
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
        <div className="mt-1 h-3 w-16 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="flex flex-col gap-2 p-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export default function PipelineLoading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-6 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        <SkeletonColumn />
        <SkeletonColumn />
        <SkeletonColumn />
        <SkeletonColumn />
        <SkeletonColumn />
      </div>
    </div>
  )
}
