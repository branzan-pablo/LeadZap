# Fase 01 — Setup e infraestrutura

**Status:** concluída (baseline do repositório)  
**Referência:** `docs/IMPLEMENTATION-PLAN.md` (Fase 1), `docs/PROMPTS-IMPLEMENTACAO.md` (PROMPT 1)

## Objetivo

Estabelecer o alicerce do LeadZap: projeto Next.js (App Router), UI (shadcn/Tailwind), clientes Supabase, middleware de sessão, estrutura de pastas conforme `ARCHITECTURE.md`, PWA mínima e utilitários base — **sem** lógica de negócio completa nas áreas de produto.

## Entregas principais

### Projeto e tooling

- Next.js com TypeScript, App Router e Tailwind (versão alinhada ao `package.json` do repositório, ex.: Next 16.x).
- ESLint configurado (`npm run lint` / `eslint`).

### shadcn/ui e design system

- `components.json` e componentes em `components/ui/` (Button, Input, Label, Card, Sheet, Dialog, Select, Tabs, Table, Sonner, etc., conforme evolução do registry **base-nova**).
- Estilos em `app/globals.css` com variáveis de tema.

### Supabase

- `lib/supabase/client.ts` — `createBrowserClient` para Client Components.
- `lib/supabase/server.ts` — `createServerClient` com cookies (RSC / Server Actions).
- `lib/supabase/admin.ts` — client com service role (webhooks, operações privilegiadas).
- `lib/supabase/middleware.ts` — client para refresh de sessão no edge.

### Middleware da aplicação

- `middleware.ts` na raiz: refresh de token, proteção de rotas `(app)`, redirecionamentos login/signup ↔ app, checagem de `onboarding_completed`, restrição de `/settings/*` a admin.
- Exceções para rotas de API (webhooks, push send) que não devem exigir sessão de browser.

### Estrutura de rotas e placeholders

- `app/(auth)/` — layout e páginas (login, signup, confirm, forgot/reset password, invite) com placeholders até a Fase 2.
- `app/(app)/` — layout e páginas do app (pipeline, leads, onboarding, settings, reminders, etc.) com placeholders conforme fases seguintes.
- `app/api/webhooks/evolution`, `app/api/push/subscribe`, `app/api/push/send` — rotas esqueleto.

### PWA

- `app/manifest.ts` — manifest dinâmico.
- `public/sw.js` — service worker mínimo (instalação / placeholders para push).
- Registro do SW e meta tags no `app/layout.tsx` (conforme implementado).

### Tipos e utilitários

- `types/database.ts` — **placeholder** documentando substituição por `supabase gen types`.
- `types/lead.ts`, `types/pipeline.ts`, `types/evolution.ts` — tipos de domínio iniciais.
- `lib/utils/formatters.ts`, `validators.ts`, `constants.ts`.
- `lib/evolution/`, `lib/push/`, `lib/hooks/` — módulos esqueleto ou stubs alinhados à arquitetura.

### Componentes por feature

- Pastas `components/pipeline`, `leads`, `layout`, `onboarding`, `settings`, `reminders`, `landing` com componentes placeholder ou parciais, conforme escopo das fases posteriores.

## Decisões técnicas relevantes

1. **App Router exclusivo** — sem `pages/`; alinhado às regras do projeto.
2. **Três clientes Supabase** — separação explícita browser / server / admin para respeitar RLS no app e bypass controlado só onde necessário.
3. **Middleware amplo** — matcher cobre praticamente todas as rotas exceto assets estáticos, garantindo refresh de cookie de auth.
4. **shadcn “base-nova”** — o registry atual pode diferir do prompt original “New York”; os componentes seguem o que o CLI instalou, mantendo consistência interna.

## Pendências e verificações manuais

| Item | Notas |
|------|--------|
| SQL no Supabase | Executar script completo de `docs/DATABASE-SCHEMA.md` no projeto Supabase real (não versionado neste resumo). |
| `types/database.ts` | Substituir placeholder por tipos gerados: `npx supabase gen types typescript --project-id <ref> > types/database.ts`. |
| Variáveis de ambiente | Garantir `.env.local` (local) e documentação de vars em `.env.example` conforme `ARCHITECTURE.md` (verificar se o arquivo exemplo existe no repo e está atualizado). |
| Teste de build | `npm run build` deve passar após a fase. |

## Critérios de aceite (Fase 1)

- [x] Projeto compila e build de produção ok.
- [x] Estrutura de pastas alinhada ao `ARCHITECTURE.md`.
- [x] Clients Supabase e middleware implementados.
- [x] PWA mínima (manifest + SW) presente.
- [ ] Tipos do banco gerados no ambiente do desenvolvedor (ação manual + Supabase).

---

*Última atualização deste documento: revisão pós-criação da pasta `docs/fases/`.*
