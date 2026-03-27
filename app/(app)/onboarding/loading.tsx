export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-zinc-100" />
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
        </div>
        <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
      </div>
    </div>
  )
}
