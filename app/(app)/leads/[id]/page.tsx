import { redirect } from "next/navigation"

/**
 * Detalhe direto por URL: por ora redireciona para a lista.
 * O drawer de detalhes abre a partir de /leads ou /pipeline.
 */
export default async function LeadDetailPage() {
  redirect("/leads")
}
