import Link from 'next/link'
import {
  KanbanSquare,
  MessageCircle,
  Bell,
  Tag,
  Users,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: KanbanSquare,
    title: 'Pipeline visual',
    description:
      'Veja todos os seus negócios organizados por etapa. Mova com um toque.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp conectado',
    description:
      'Mensagens chegam automaticamente. Leia o histórico sem sair da ferramenta.',
  },
  {
    icon: Bell,
    title: 'Lembretes inteligentes',
    description:
      'Crie lembretes e receba notificação na hora certa. Nunca mais esqueça um follow-up.',
  },
  {
    icon: Tag,
    title: 'Etiquetas',
    description:
      'Classifique leads: quente, frio, VIP. Filtre e encontre rápido.',
  },
  {
    icon: Users,
    title: 'Equipe organizada',
    description:
      'Cada vendedor com seus leads. Gestor com visão de tudo.',
  },
  {
    icon: Smartphone,
    title: 'Funciona no celular',
    description:
      'Instale no seu celular como app. Use de qualquer lugar.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-zinc-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Tudo que você precisa para vender mais
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="rounded-xl border border-zinc-200 bg-white p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-50">
                <feat.icon className="size-5 text-green-600" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                {feat.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="h-11 bg-green-500 px-6 text-white hover:bg-green-600"
            render={<Link href="/signup" />}
          >
            Comece a organizar seus atendimentos
          </Button>
        </div>
      </div>
    </section>
  )
}
