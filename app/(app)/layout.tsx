// TODO: Implement app layout (Phase 3)
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* TODO: Sidebar component */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
