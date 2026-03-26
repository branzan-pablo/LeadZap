import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Plan {
  name: string
  price: string
  description: string
  features: string[]
  highlighted: boolean
}

const plans: Plan[] = [
  {
    name: 'Starter',
    price: 'R$ 29',
    description: 'Para quem está começando a organizar seus atendimentos.',
    features: [
      '1 usuário',
      'Pipeline visual',
      'WhatsApp conectado',
      'Lembretes',
      'Até 50 leads',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$ 59',
    description: 'Para equipes pequenas que querem crescer com controle.',
    features: [
      'Até 3 usuários',
      'Tudo do Starter',
      'Sem limite de leads',
      'Filtros avançados',
      'Etiquetas personalizadas',
    ],
    highlighted: true,
  },
  {
    name: 'Business',
    price: 'R$ 99',
    description: 'Para negócios que precisam de escala e suporte.',
    features: [
      'Usuários ilimitados',
      'Tudo do Pro',
      'Prioridade no suporte',
      'Relatórios (em breve)',
    ],
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="precos" className="bg-zinc-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Planos simples e transparentes
        </h2>

        <div className="mt-12 grid grid-cols-1 items-start gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-xl border bg-white p-6',
                plan.highlighted
                  ? 'border-2 border-green-500 shadow-md'
                  : 'border-zinc-200'
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-0.5 text-xs font-medium text-white">
                  Mais popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-zinc-900">
                {plan.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-zinc-900">
                  {plan.price}
                </span>
                <span className="text-sm text-zinc-500">/mês</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">{plan.description}</p>

              <ul className="mt-6 flex flex-col gap-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-zinc-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  'mt-8',
                  plan.highlighted
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                )}
                render={<Link href="/signup" />}
              >
                Começar grátis
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Teste grátis por 7 dias. Sem cartão de crédito.
        </p>
      </div>
    </section>
  )
}
