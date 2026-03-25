// TODO: Implement invite acceptance (Phase 8)
export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900">Aceitar Convite</h2>
      <p className="text-sm text-zinc-600">Convites serão implementados na Fase 8.</p>
    </div>
  )
}
