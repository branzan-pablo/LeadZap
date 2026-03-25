import { redirect } from "next/navigation"

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { createClient } from "@/lib/supabase/server"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id, onboarding_completed")
    .eq("id", user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect("/pipeline")
  }

  const initialStep: 1 | 2 | 3 = profile?.organization_id ? 2 : 1

  return <OnboardingWizard initialStep={initialStep} />
}
