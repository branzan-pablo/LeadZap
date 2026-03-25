"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  completeOnboarding,
  createLeadPlaceholder,
  createOrganization,
} from "@/app/(app)/onboarding/actions"

import { StepCompany } from "./step-company"
import { StepFirstLead } from "./step-first-lead"
import { StepWhatsApp } from "./step-whatsapp"

const STEP_TITLES = [
  "Nome da empresa",
  "Conectar WhatsApp",
  "Primeiro lead",
] as const

export type OnboardingWizardProps = {
  /** 1-based step when user already has an organization */
  initialStep: 1 | 2 | 3
}

export function OnboardingWizard({ initialStep }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(initialStep)
  const [companyName, setCompanyName] = useState("")
  const [leadName, setLeadName] = useState("")
  const [leadPhone, setLeadPhone] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function runCompleteAndRedirect() {
    const result = await completeOnboarding()
    if (!result.ok) {
      setFormError(result.message)
      return
    }
    router.push("/pipeline")
    router.refresh()
  }

  function handleCompanyContinue() {
    setFormError(null)
    startTransition(async () => {
      const result = await createOrganization(companyName)
      if (!result.ok) {
        setFormError(result.message)
        return
      }
      router.refresh()
      setStep(2)
    })
  }

  function handleCreateLead() {
    setFormError(null)
    startTransition(async () => {
      const result = await createLeadPlaceholder({
        name: leadName,
        phone: leadPhone,
      })
      if (!result.ok) {
        setFormError(result.message)
        return
      }
      await runCompleteAndRedirect()
    })
  }

  function handleSkipLead() {
    setFormError(null)
    startTransition(async () => {
      await runCompleteAndRedirect()
    })
  }

  const progressPercent = (step / 3) * 100

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-[480px] border-zinc-200 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500">
              Passo {step} de 3
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-zinc-900 transition-[width] duration-200 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <CardTitle className="text-xl text-zinc-900">
            {STEP_TITLES[step - 1]}
          </CardTitle>
          <CardDescription className="text-zinc-600">
            Configure sua conta em poucos passos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <StepCompany
              companyName={companyName}
              onCompanyNameChange={setCompanyName}
              error={formError}
              pending={pending}
              onContinue={handleCompanyContinue}
            />
          ) : null}
          {step === 2 ? (
            <StepWhatsApp
              onSkip={() => setStep(3)}
              onContinue={() => setStep(3)}
            />
          ) : null}
          {step === 3 ? (
            <StepFirstLead
              leadName={leadName}
              leadPhone={leadPhone}
              onLeadNameChange={setLeadName}
              onLeadPhoneChange={setLeadPhone}
              error={formError}
              pending={pending}
              onCreateLead={handleCreateLead}
              onSkip={handleSkipLead}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
