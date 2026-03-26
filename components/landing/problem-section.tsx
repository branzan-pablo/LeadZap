import { MessageSquareOff, Send, BarChart3, UserX } from 'lucide-react'

const problems = [
  {
    icon: MessageSquareOff,
    title: 'Lead mandou mensagem e ninguém respondeu',
    description:
      'O cliente esperou, desistiu e foi comprar do concorrente.',
  },
  {
    icon: Send,
    title: 'Proposta enviada mas ninguém fez follow-up',
    description:
      'A venda esfriou porque ninguém lembrou de acompanhar.',
  },
  {
    icon: BarChart3,
    title: 'Não sabe quantos negócios estão abertos agora',
    description:
      'Sem visão clara, é impossível saber onde focar energia.',
  },
  {
    icon: UserX,
    title: 'Vendedor diz que atendeu, mas não tem como verificar',
    description:
      'Sem registro, fica na palavra. Gestão no escuro.',
  },
]

export function ProblemSection() {
  return (
    <section className="bg-zinc-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Isso acontece no seu negócio?
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-200 bg-white p-6"
            >
              <item.icon className="size-6 text-zinc-400" />
              <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-base font-medium text-zinc-600 italic">
          &quot;Cada cliente esquecido é dinheiro que você deixou na mesa.&quot;
        </p>
      </div>
    </section>
  )
}
