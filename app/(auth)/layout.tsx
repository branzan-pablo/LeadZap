export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-[400px] px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">LeadZap</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
