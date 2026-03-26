import { redirect } from "next/navigation"

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("users")
    .select("organization_id, onboarding_completed, role")
    .eq("id", user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect("/pipeline")
  }

  const initialStep: 1 | 2 | 3 = profile?.organization_id ? 2 : 1

  const isAdmin = profile?.role === "admin"

  return <OnboardingWizard initialStep={initialStep} isAdmin={isAdmin} />
}
