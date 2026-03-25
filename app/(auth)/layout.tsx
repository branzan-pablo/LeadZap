import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8">
      <Card className="w-full max-w-[400px] border-zinc-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
            LeadZap
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">{children}</CardContent>
      </Card>
    </div>
  )
}
