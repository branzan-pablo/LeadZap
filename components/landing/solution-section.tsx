import { QrCode, Inbox, KanbanSquare } from 'lucide-react'

const steps = [
  {
    number: '1',
    icon: QrCode,
    title: 'Conecte seu WhatsApp',
    description:
      'Escaneie o QR code e pronto. Sem instalar nada, sem configuração complicada.',
  },
  {
    number: '2',
    icon: Inbox,
    title: 'Leads entram automaticamente',
    description:
      'Cada mensagem nova vira um lead no seu pipeline. Sem digitar nada.',
  },
  {
    number: '3',
    icon: KanbanSquare,
    title: 'Organize e não perca nenhum',
    description:
      'Mova leads no pipeline, crie lembretes e acompanhe cada negociação.',
  },
]

export function SolutionSection() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Simples como deveria ser
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-500 text-lg font-semibold text-white">
                {step.number}
              </div>
              <step.icon className="mt-5 size-8 text-zinc-400" />
              <h3 className="mt-4 text-base font-semibold text-zinc-900">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
