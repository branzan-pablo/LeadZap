# Fase 03 — Onboarding e layout principal

**Status:** concluída (layout autenticado, wizard de onboarding, Server Actions de org/onboarding)  
**Referência:** `docs/IMPLEMENTATION-PLAN.md` (Fase 3), `docs/PROMPTS-IMPLEMENTACAO.md` (PROMPT 3)

## Objetivo

Entregar o shell do app (sidebar + header responsivo), o fluxo de onboarding em 3 passos com criação de organização e placeholders (WhatsApp / primeiro lead), e documentar decisões alinhadas ao `DATABASE-SCHEMA.md` e ao PRD.

## Escopo entregue

### Layout principal

- `app/(app)/layout.tsx` — Server Component: sessão Supabase, perfil em `public.users`, renderização do shell.
- `components/layout/app-shell.tsx` — Client: coluna sidebar 240px no desktop, `Sheet` à esquerda no mobile, coluna com header + `main`.

### Sidebar e header

- `components/layout/sidebar.tsx` — Navegação (Pipeline, Leads, Lembretes, Configurações só para `admin`), estados ativo/hover conforme PROMPT, logo LeadZap.
- `components/layout/header.tsx` — Altura 64px, menu mobile, status WhatsApp e sino de notificações (stubs), avatar com dropdown (nome, email, Sair via `signOut` + redirect `/login`).
- `components/layout/whatsapp-status.tsx` — Placeholder com indicador verde/vermelho.
- `components/layout/notification-bell.tsx` — Placeholder com badge numérico fixo.

### Server Actions (onboarding)

- `app/(app)/onboarding/actions.ts`:
  - **`createOrganization`** — Zod no nome; `slugify` + slug único; INSERT em `organizations` com **service role** (`createAdminClient`); UPDATE em `users` com `organization_id` e `role = 'admin'`. Se o usuário já tem `organization_id`, retorna a org existente (retomada do wizard).
  - **`createLeadPlaceholder`** — Valida nome + telefone (`phoneSchema`); sem persistência até a Fase 4.
  - **`completeOnboarding`** — `users.onboarding_completed = true` com cliente da sessão (RLS: perfil próprio).

### Validação e utilitários

- `lib/validations/onboarding.ts` — Schemas Zod reutilizáveis.
- `lib/utils/slug.ts` — Geração de slug URL-safe.

### Wizard de onboarding

- `components/onboarding/onboarding-wizard.tsx` — Estado dos passos, barra de progresso, Card `max-w-[480px]`.
- `components/onboarding/step-company.tsx`, `step-whatsapp.tsx`, `step-first-lead.tsx`.
- `app/(app)/onboarding/page.tsx` — Server: redireciona se onboarding já concluído; `initialStep` 2 se já existe `organization_id`, senão 1.

## Decisões técnicas

| Decisão | Motivo |
|--------|--------|
| **`users.onboarding_completed` só em `completeOnboarding` (fim do passo 3)** | O texto do PROMPT pedia marcar concluído em `createOrganization`, o que liberaria o middleware após só o passo 1 e quebraria os passos 2 e 3 em linha com o PRD (wizard completo). |
| **INSERT em `organizations` via service role** | Conforme `DATABASE-SCHEMA.md` (RLS: INSERT de org no onboarding via service role). |
| **UPDATE de `users` (org + role) via service role** | Garante vínculo e papel `admin` mesmo se a política RLS de UPDATE do próprio usuário não cobrir `organization_id`/`role`. |
| **`completeOnboarding` com cliente da sessão** | Atualização de flag no próprio usuário; esperado compatível com política “update own profile”. |
| **`router.refresh()` após criar org** | Atualiza o layout (ex.: item Configurações para o novo admin) sem sair da rota. |

## O que não entra nesta fase

- Pipeline, `createLead` real, board, drawer — **Fase 4**.
- Conexão real WhatsApp e notificações no header — placeholders apenas.

## Pendências e checklist operacional

- [ ] **`SUPABASE_SERVICE_ROLE_KEY`** definido no ambiente (obrigatório para `createOrganization`).
- [ ] **Supabase:** triggers `create_default_pipeline` e `create_default_tags` após INSERT em `organizations` (conforme schema documentado).
- [ ] Teste manual: primeiro login → onboarding → pipeline; usuário com org parcial retoma no passo 2.
- [ ] Opcional: alinhar texto do PROMPT/IMPLEMENTATION-PLAN 3.2 à decisão de quando setar `onboarding_completed`.

## Arquivos tocados (referência rápida)

- `app/(app)/layout.tsx`, `app/(app)/onboarding/page.tsx`, `app/(app)/onboarding/actions.ts`
- `components/layout/app-shell.tsx`, `sidebar.tsx`, `header.tsx`, `whatsapp-status.tsx`, `notification-bell.tsx`
- `components/onboarding/onboarding-wizard.tsx`, `step-company.tsx`, `step-whatsapp.tsx`, `step-first-lead.tsx`
- `lib/utils/slug.ts`, `lib/validations/onboarding.ts`

---

*Documento de rastreabilidade da Fase 3.*
