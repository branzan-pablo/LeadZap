import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCTA() {
  return (
    <section className="bg-zinc-900 py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center lg:px-12">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Pronto para parar de perder vendas?
        </h2>
        <p className="text-base text-zinc-400">
          Configure em 2 minutos. Sem cartão de crédito.
        </p>
        <Button
          size="lg"
          className="mt-2 h-12 gap-2 bg-white px-6 text-zinc-900 hover:bg-zinc-100"
          render={<Link href="/signup" />}
        >
          Criar minha conta grátis
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  )
}
