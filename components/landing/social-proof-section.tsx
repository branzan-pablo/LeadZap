import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Carla S.',
    business: 'Clínica de Estética',
    initials: 'CS',
    quote:
      'Antes eu perdia cliente porque esquecia de responder. Agora cada mensagem vira um lead e eu sei exatamente em que pé está cada negociação.',
  },
  {
    name: 'Ricardo M.',
    business: 'Loja de Roupas',
    initials: 'RM',
    quote:
      'Minha equipe de 3 vendedores ficou muito mais organizada. Sei quem atendeu quem e consigo cobrar resultado de verdade.',
  },
  {
    name: 'Fernanda L.',
    business: 'Consultoria Financeira',
    initials: 'FL',
    quote:
      'Conectei o WhatsApp em 2 minutos e no mesmo dia já tinha todos os leads organizados. Simples assim.',
  },
]

export function SocialProofSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Quem usa, recomenda
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6"
            >
              <Quote className="size-5 text-zinc-300" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">
                {t.quote}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
