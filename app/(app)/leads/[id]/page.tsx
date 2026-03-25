// TODO: Implement lead detail page (Phase 4)
export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-zinc-900">Detalhe do Lead</h1>
      <p className="text-sm text-zinc-600">Detalhe será implementado na Fase 4.</p>
    </div>
  )
}
