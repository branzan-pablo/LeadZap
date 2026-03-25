import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const sp = await searchParams
  const confirmed = sp.confirmed === "1"
  const sessionExpired = sp.session === "expired"

  return (
    <LoginForm
      emailConfirmed={confirmed}
      sessionExpired={sessionExpired}
    />
  )
}
