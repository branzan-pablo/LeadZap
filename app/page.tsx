import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { ProblemSection } from '@/components/landing/problem-section'
import { SolutionSection } from '@/components/landing/solution-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { SocialProofSection } from '@/components/landing/social-proof-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { FinalCTA } from '@/components/landing/final-cta'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'LeadZap — Pare de perder vendas no WhatsApp',
  description:
    'Organize seus atendimentos, acompanhe negociações e feche mais vendas. Simples como deveria ser.',
  openGraph: {
    title: 'LeadZap — Pare de perder vendas no WhatsApp',
    description:
      'Organize seus atendimentos, acompanhe negociações e feche mais vendas. Simples como deveria ser.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadZap — Pare de perder vendas no WhatsApp',
    description:
      'Organize seus atendimentos, acompanhe negociações e feche mais vendas. Simples como deveria ser.',
  },
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </>
  )
}
