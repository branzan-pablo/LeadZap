import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PipelineMockup() {
  const columns = [
    {
      title: 'Novo',
      cards: [
        { name: 'Maria S.', value: 'R$ 1.200', color: 'bg-green-100' },
        { name: 'João P.', value: 'R$ 800', color: 'bg-zinc-100' },
      ],
    },
    {
      title: 'Em negociação',
      cards: [
        { name: 'Ana C.', value: 'R$ 3.500', color: 'bg-blue-100' },
      ],
    },
    {
      title: 'Proposta enviada',
      cards: [
        { name: 'Carlos M.', value: 'R$ 2.100', color: 'bg-amber-100' },
        { name: 'Fernanda L.', value: 'R$ 950', color: 'bg-zinc-100' },
      ],
    },
  ]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="size-2.5 rounded-full bg-green-500" />
        <span className="text-xs font-medium text-zinc-500">Pipeline de vendas</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                {col.title}
              </span>
              <span className="text-[10px] text-zinc-400">{col.cards.length}</span>
            </div>
            {col.cards.map((card) => (
              <div
                key={card.name}
                className={`rounded-lg ${card.color} p-2.5`}
              >
                <p className="text-[11px] font-medium text-zinc-800">{card.name}</p>
                <p className="text-[10px] text-zinc-500">{card.value}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-5 lg:gap-16 lg:px-12">
        {/* Text — 3 cols */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            Para quem vende pelo WhatsApp
          </span>

          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Pare de perder vendas no WhatsApp
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-zinc-600">
            Organize seus leads, acompanhe cada negociação e nunca mais esqueça
            de responder um cliente. Simples como deveria ser.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-11 gap-2 bg-green-500 px-5 text-white hover:bg-green-600"
              render={<Link href="/signup" />}
            >
              Começar grátis
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="ghost" size="lg" className="h-11 text-zinc-600" render={<a href="#como-funciona" />}>
              Ver como funciona
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-2 text-sm text-zinc-500">
            <Users className="size-4 text-zinc-400" />
            <span>
              Mais de <strong className="text-zinc-700">500 negócios</strong>{' '}
              organizando seus atendimentos
            </span>
          </div>
        </div>

        {/* Visual — 2 cols */}
        <div className="lg:col-span-2">
          <div className="relative">
            {/* Subtle glow behind */}
            <div className="absolute -inset-4 rounded-2xl bg-green-100/40 blur-2xl" />
            <div className="relative">
              <PipelineMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
