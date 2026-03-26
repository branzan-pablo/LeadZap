function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-100">
      <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-zinc-200" /></td>
      <td className="px-4 py-3"><div className="h-4 w-28 animate-pulse rounded bg-zinc-100" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-zinc-100" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-zinc-100" /></td>
      <td className="px-4 py-3"><div className="h-5 w-14 animate-pulse rounded-md bg-zinc-100" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-zinc-100" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-zinc-100" /></td>
    </tr>
  )
}

export default function LeadsLoading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-6 w-16 animate-pulse rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-4 py-3 text-left"><div className="h-4 w-12 rounded bg-zinc-200" /></th>
              <th className="px-4 py-3 text-left"><div className="h-4 w-16 rounded bg-zinc-200" /></th>
              <th className="px-4 py-3 text-left"><div className="h-4 w-14 rounded bg-zinc-200" /></th>
              <th className="px-4 py-3 text-left"><div className="h-4 w-20 rounded bg-zinc-200" /></th>
              <th className="px-4 py-3 text-left"><div className="h-4 w-10 rounded bg-zinc-200" /></th>
              <th className="px-4 py-3 text-left"><div className="h-4 w-12 rounded bg-zinc-200" /></th>
              <th className="px-4 py-3 text-left"><div className="h-4 w-24 rounded bg-zinc-200" /></th>
            </tr>
          </thead>
          <tbody>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </tbody>
        </table>
      </div>
    </div>
  )
}
