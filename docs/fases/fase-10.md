# Fase 10 — Polish e Deploy

**Data:** 2026-03-26
**Status:** Concluída

---

## Entregas

### 1. Loading States

- **Pipeline loading** (`app/(app)/pipeline/loading.tsx`): Skeleton com 5 colunas, cada uma com 3 cards placeholder animados. Reproduz a estrutura visual do pipeline real.
- **Leads loading** (`app/(app)/leads/loading.tsx`): Skeleton de tabela com header e 6 rows placeholder animados.
- **Reminders loading** (`app/(app)/reminders/loading.tsx`): Skeleton com grupo de 3 itens de lembrete placeholder.
- **Settings loading** (`app/(app)/settings/loading.tsx`): Skeleton com 3 cards de configuração placeholder.
- Componentes internos (lead-messages, lead-activity, lead-notes) já possuíam loading states inline com Loader2Icon/texto — mantidos e aprimorados com skeletons no lead-messages.

### 2. Error Boundaries

- **Global** (`app/error.tsx`): Error boundary raiz com mensagem amigável, botões "Tentar novamente" (unstable_retry) e "Recarregar página".
- **App** (`app/(app)/error.tsx`): Error boundary do grupo (app) com ícone AlertCircle e botão de retry. Layout integrado ao shell do app.
- Usa API `unstable_retry` do Next.js 16 (substituiu `reset` de versões anteriores).

### 3. Empty States

- **Pipeline sem leads**: Mensagem contextual "Seu pipeline está vazio. Crie um lead para começar." Filtros ocultos quando não há leads.
- **Pipeline coluna vazia**: Área tracejada (dashed border) já existente mantida.
- **Lista de leads vazia**: Diferencia entre "nenhum lead cadastrado" e "nenhum lead encontrado com esses filtros".
- **Mensagens WhatsApp**: Ícone MessageCircle + texto "Nenhuma mensagem do WhatsApp" + explicação de que mensagens aparecerão automaticamente. Skeletons de balão de mensagem no loading.
- **Lembretes vazios**: Já existia texto "Nenhum lembrete pendente".
- **Atividades vazias**: Já existia texto "Nenhuma atividade registrada".
- **Notas vazias**: Já existia texto "Nenhuma nota ainda".

### 4. Responsividade

Verificação confirmou que a responsividade já estava implementada nas fases anteriores:
- **Sidebar**: Hidden em mobile, abre via Sheet (hamburger no header).
- **Pipeline**: Scroll horizontal com colunas de 280px fixas.
- **Lead drawer**: Fullscreen em mobile (`w-full`), 480px em desktop (`sm:max-w-[480px]`).
- **Tabelas**: Wrapper `overflow-x-auto` com `rounded-lg border`.
- **Header**: Hamburger button visível apenas em mobile (`md:hidden`).
- **Touch targets**: Cards do pipeline são `<button>` com padding p-3 (>44px); checkboxes de lembretes com size-4 e margin adequado.

### 5. SEO

- **`app/sitemap.ts`**: Sitemap XML com 3 URLs públicas (landing, login, signup). Usa `NEXT_PUBLIC_APP_URL` como base.
- **`app/robots.ts`**: Permite crawling de `/`, bloqueia `/pipeline`, `/leads`, `/reminders`, `/settings`, `/onboarding`, `/api/`. Aponta para sitemap.
- Metadata da landing page já configurada na Fase 9 (title, description, OG).

### 6. Performance

- **Dynamic import do PipelineBoard**: `next/dynamic` com `ssr: false` em `pipeline-workspace.tsx`. Reduz bundle inicial da página de pipeline.
- **Dynamic import do LeadDrawer**: Lazy loaded em ambos `pipeline-workspace.tsx` e `leads-workspace.tsx`. Drawer só carrega quando o usuário clica em um lead.

### 7. Vercel Config

- `vercel.json` já existia com cron configurado: `{ "path": "/api/cron/reminders", "schedule": "* * * * *" }` (a cada minuto).

### 8. Auditoria de Segurança

Todas as verificações passaram:
- **RLS**: `SUPABASE_SERVICE_ROLE_KEY` e `@/lib/supabase/admin` nunca importados em Client Components.
- **Webhook**: `EVOLUTION_WEBHOOK_SECRET` validado no header em `app/api/webhooks/evolution/route.ts`.
- **Server Actions**: Todas as 15+ actions verificam autenticação via `supabase.auth.getUser()` com helpers `requireOrgContext()` / `requireAdminContext()`.
- **Upload**: Validação server-side de MIME type (whitelist: jpeg, png, webp, pdf), tamanho (5MB), contagem (max 5 por lead).
- **Client/Server boundary**: Nenhum componente `"use client"` importa o admin client.

---

## Decisões Técnicas

1. **`unstable_retry` em error boundaries**: Next.js 16 renomeou `reset` para `unstable_retry` nos error boundaries. Seguido conforme documentação em `node_modules/next/dist/docs/`.
2. **Skeletons server-rendered**: Os `loading.tsx` são Server Components (sem "use client") — renderizam os skeletons no servidor, sem JS adicional no client.
3. **Dynamic imports com `ssr: false`**: Pipeline board e lead drawer desabilitam SSR pois dependem fortemente de APIs do browser (drag-and-drop, Sheet/Dialog).
4. **Filtros condicionais no pipeline**: Quando não há leads, o componente `PipelineFilters` não é renderizado para evitar confusão.

---

## Pendências para Deploy

- [ ] Configurar variáveis de ambiente na Vercel (todas listadas em ARCHITECTURE.md)
- [ ] Configurar domínio e SSL na Vercel
- [ ] Executar SQL de criação no Supabase (se não feito)
- [ ] Criar bucket `attachments` no Supabase Storage
- [ ] Gerar VAPID keys e configurar
- [ ] Configurar Evolution API para enviar webhooks para URL de produção
- [ ] Configurar `metadataBase` no root layout para eliminar warning de OG images
- [ ] Testar fluxo completo end-to-end em produção
- [ ] Verificar Lighthouse score > 80
- [ ] Testar RLS com duas orgs diferentes

---

## Build

```
✓ Compiled successfully (Turbopack)
✓ TypeScript — sem erros
✓ 25 rotas geradas (13 static, 12 dynamic)
✓ Sitemap e robots.txt gerados
```
