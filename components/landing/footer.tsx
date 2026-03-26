import { Zap } from 'lucide-react'

const footerLinks = {
  produto: [
    { label: 'Features', href: '#features' },
    { label: 'Preços', href: '#precos' },
  ],
  empresa: [
    { label: 'Sobre', href: '#' },
    { label: 'Contato', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  legal: [
    { label: 'Termos de Uso', href: '#' },
    { label: 'Política de Privacidade', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 sm:grid-cols-4 lg:px-12">
        {/* Logo column */}
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5">
            <Zap className="size-5 fill-green-500 text-green-500" />
            <span className="text-lg font-semibold text-zinc-900">LeadZap</span>
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            Organize seus atendimentos e feche mais vendas.
          </p>
        </div>

        {/* Produto */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Produto
          </h4>
          <ul className="mt-3 flex flex-col gap-2">
            {footerLinks.produto.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Empresa */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Empresa
          </h4>
          <ul className="mt-3 flex flex-col gap-2">
            {footerLinks.empresa.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Legal
          </h4>
          <ul className="mt-3 flex flex-col gap-2">
            {footerLinks.legal.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-zinc-100 px-6 pt-6 lg:px-12">
        <p className="text-center text-xs text-zinc-400">
          &copy; 2026 LeadZap. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
