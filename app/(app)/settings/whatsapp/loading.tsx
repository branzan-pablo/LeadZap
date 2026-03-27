export default function WhatsappSettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <div className="h-6 w-44 animate-pulse rounded bg-zinc-200" />
        <div className="mt-1 h-4 w-72 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="rounded-xl border border-zinc-200 p-6 space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="h-48 w-48 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-4 w-56 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  )
}
