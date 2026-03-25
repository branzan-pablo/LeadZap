# ARCHITECTURE — LeadZap

## Estrutura de Pastas

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              → Página de login (email+senha)
│   │   ├── signup/page.tsx             → Página de cadastro
│   │   ├── confirm/page.tsx            → Confirmação de email (callback)
│   │   ├── forgot-password/page.tsx    → Recuperação de senha
│   │   ├── reset-password/page.tsx     → Redefinir senha (via link)
│   │   ├── invite/[token]/page.tsx     → Aceitar convite de equipe
│   │   └── layout.tsx                  → Layout auth (centralizado, sem sidebar)
│   ├── (app)/
│   │   ├── layout.tsx                  → Layout principal (sidebar + header + notifications)
│   │   ├── onboarding/page.tsx         → Wizard de onboarding (3 passos)
│   │   ├── pipeline/page.tsx           → Pipeline visual (view principal)
│   │   ├── leads/page.tsx              → Lista de leads (visão tabela)
│   │   ├── leads/[id]/page.tsx         → Detalhe do lead (fallback se acessado diretamente)
│   │   ├── reminders/page.tsx          → Central de lembretes/tarefas
│   │   ├── settings/
│   │   │   ├── page.tsx                → Configurações gerais da organização
│   │   │   ├── team/page.tsx           → Gestão de equipe (convites, membros)
│   │   │   ├── pipeline/page.tsx       → Configuração do pipeline (renomear, adicionar colunas)
│   │   │   └── whatsapp/page.tsx       → Conexão WhatsApp (QR code, status)
│   │   └── notifications/page.tsx      → Histórico de notificações (fallback)
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── evolution/route.ts      → Webhook receiver da Evolution API
│   │   └── push/
│   │       ├── subscribe/route.ts      → Registrar push subscription
│   │       └── send/route.ts           → Disparar push notification (chamado por cron/trigger)
│   ├── layout.tsx                      → Root layout (providers, fonts, metadata)
│   ├── page.tsx                        → Landing page (pública)
│   └── manifest.ts                     → PWA manifest (dinâmico via Next.js)
├── components/
│   ├── ui/                             → Componentes shadcn/ui (button, input, dialog, etc.)
│   ├── pipeline/
│   │   ├── pipeline-board.tsx          → Board completo com colunas (Client Component)
│   │   ├── pipeline-column.tsx         → Coluna individual com droppable zone
│   │   ├── pipeline-card.tsx           → Card do lead no pipeline
│   │   └── pipeline-filters.tsx        → Barra de filtros (tag, responsável, estágio)
│   ├── leads/
│   │   ├── lead-drawer.tsx             → Drawer lateral de detalhe do lead
│   │   ├── lead-form.tsx               → Formulário de criação/edição de lead
│   │   ├── lead-messages.tsx           → Visualização de mensagens WhatsApp do lead
│   │   ├── lead-notes.tsx              → Seção de notas do lead
│   │   ├── lead-tags.tsx               → Gerenciador de tags do lead
│   │   ├── lead-attachments.tsx        → Upload e lista de anexos
│   │   └── lead-activity.tsx           → Log de atividades
│   ├── reminders/
│   │   ├── reminder-form.tsx           → Formulário de criação de lembrete
│   │   └── reminder-list.tsx           → Lista de lembretes (centro de notificações)
│   ├── onboarding/
│   │   ├── onboarding-wizard.tsx       → Wizard de 3 passos
│   │   ├── step-company.tsx            → Passo 1: nome da empresa
│   │   ├── step-whatsapp.tsx           → Passo 2: QR code WhatsApp
│   │   └── step-first-lead.tsx         → Passo 3: criar primeiro lead
│   ├── settings/
│   │   ├── team-members.tsx            → Lista de membros + convites
│   │   ├── invite-form.tsx             → Formulário de convite
│   │   ├── whatsapp-connection.tsx     → QR code + status de conexão
│   │   └── pipeline-config.tsx         → Renomear/adicionar colunas
│   ├── layout/
│   │   ├── sidebar.tsx                 → Sidebar de navegação
│   │   ├── header.tsx                  → Header com busca, notificações, perfil
│   │   ├── notification-bell.tsx       → Ícone de notificação com badge
│   │   └── whatsapp-status.tsx         → Indicador de conexão WhatsApp no header
│   └── landing/
│       └── [seções da landing page]    → Componentes da landing (ver LANDING-PAGE-SPEC.md)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   → createBrowserClient() para Client Components
│   │   ├── server.ts                   → createServerClient() para Server Components/Actions
│   │   ├── middleware.ts               → createServerClient() para middleware Next.js
│   │   └── admin.ts                    → createClient() com service_role key (webhooks, push)
│   ├── evolution/
│   │   ├── client.ts                   → Funções para interagir com Evolution API (criar instância, QR code, status)
│   │   └── webhook-handler.ts          → Lógica de processamento do webhook (parsear mensagem, vincular a lead)
│   ├── push/
│   │   ├── subscribe.ts                → Registrar push subscription no banco
│   │   ├── send.ts                     → Enviar push notification via web-push
│   │   └── vapid.ts                    → Gerar/gerenciar VAPID keys
│   ├── utils/
│   │   ├── formatters.ts               → Formatação de moeda (BRL), data, telefone
│   │   ├── validators.ts               → Validação de telefone BR, email
│   │   └── constants.ts                → Constantes (tags padrão, colunas padrão, limites)
│   └── hooks/
│       ├── use-realtime-leads.ts       → Hook para subscription Realtime em leads
│       ├── use-realtime-messages.ts    → Hook para subscription Realtime em messages
│       ├── use-pipeline.ts             → Hook de estado do pipeline (drag-and-drop, otimistic updates)
│       └── use-push-notification.ts    → Hook para solicitar permissão e registrar push
├── types/
│   ├── database.ts                     → Types gerados pelo Supabase CLI (supabase gen types)
│   ├── lead.ts                         → Types de domínio para leads
│   ├── pipeline.ts                     → Types para pipeline stages
│   └── evolution.ts                    → Types para payloads da Evolution API
├── public/
│   ├── sw.js                           → Service Worker para PWA e push notifications
│   ├── icons/                          → Ícones do PWA (192x192, 512x512)
│   └── og-image.png                    → Open Graph image para landing page
├── middleware.ts                        → Middleware Next.js (auth guard, redirects)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Rotas da Aplicação

### Páginas Públicas (sem autenticação)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Landing page | Página de marketing com CTA de cadastro. SSR para SEO. |
| `/login` | Login | Email + senha. Redirect para `/pipeline` se já autenticado. |
| `/signup` | Cadastro | Formulário de criação de conta. Redirect para `/onboarding` após confirmar email. |
| `/confirm` | Confirmação | Callback do link de confirmação de email do Supabase. |
| `/forgot-password` | Recuperação | Solicitar link de reset de senha. |
| `/reset-password` | Reset | Formulário de nova senha (via link do email). |
| `/invite/[token]` | Convite | Aceitar convite de equipe. Cria conta se necessário, vincula à org. |

### Páginas Autenticadas (protegidas por middleware)

| Rota | Página | Acesso |
|------|--------|--------|
| `/onboarding` | Wizard | Todos (aparece apenas na primeira vez, redirect se já completou). |
| `/pipeline` | Pipeline visual | Todos. Usuário vê seus leads; Admin vê todos. |
| `/leads` | Lista de leads | Todos. Mesma lógica de permissão. |
| `/leads/[id]` | Detalhe do lead | Todos (se tiver acesso ao lead). |
| `/reminders` | Central de lembretes | Todos (vê apenas seus lembretes). |
| `/settings` | Configurações gerais | Admin only. |
| `/settings/team` | Equipe | Admin only. |
| `/settings/pipeline` | Config pipeline | Admin only. |
| `/settings/whatsapp` | Conexão WhatsApp | Admin only. |

---

## Server Components vs. Client Components

### Server Components (SC)
- **Landing page (`/page.tsx`):** Conteúdo estático, precisa de SSR para SEO.
- **Layout principal (`/(app)/layout.tsx`):** Busca dados de sessão e organização no servidor, passa como props.
- **Páginas de auth:** Formulários simples, renderização no servidor.

### Client Components (CC)
- **Pipeline board (`pipeline-board.tsx`):** Drag-and-drop exige interatividade total. Usa @dnd-kit.
- **Lead drawer (`lead-drawer.tsx`):** Tabs, formulários, estado local.
- **Mensagens WhatsApp (`lead-messages.tsx`):** Atualiza via Realtime subscription.
- **Onboarding wizard:** Navegação entre passos com estado.
- **Notification bell (`notification-bell.tsx`):** Badge atualizado via Realtime.
- **WhatsApp status (`whatsapp-status.tsx`):** Polling ou Realtime para status de conexão.
- **Todos os formulários e componentes interativos.**

### Regra geral
A página (page.tsx) é Server Component — busca dados iniciais. Os componentes filhos interativos são Client Components com `"use client"`. Dados iniciais são passados como props do SC para o CC. O CC usa hooks de Realtime para atualizações subsequentes.

---

## Server Actions

Mutações críticas que usam Server Actions (em vez de API routes):

| Action | Arquivo | Descrição |
|--------|---------|-----------|
| `createLead` | `app/(app)/pipeline/actions.ts` | Criar novo lead com dados do formulário. Valida duplicata por telefone. |
| `updateLead` | `app/(app)/pipeline/actions.ts` | Atualizar dados do lead (nome, valor, notas, tags). |
| `moveLead` | `app/(app)/pipeline/actions.ts` | Mover lead para outro estágio. Registra atividade. |
| `deleteLead` | `app/(app)/pipeline/actions.ts` | Soft delete do lead (set deleted_at). Admin only. |
| `createReminder` | `app/(app)/reminders/actions.ts` | Criar lembrete vinculado a lead. |
| `completeReminder` | `app/(app)/reminders/actions.ts` | Marcar lembrete como concluído. |
| `inviteMember` | `app/(app)/settings/team/actions.ts` | Enviar convite por email. Cria registro na tabela invites. |
| `removeMember` | `app/(app)/settings/team/actions.ts` | Remover membro da organização. Admin only. |
| `updatePipelineStage` | `app/(app)/settings/pipeline/actions.ts` | Renomear coluna ou adicionar nova. |
| `uploadAttachment` | `app/(app)/pipeline/actions.ts` | Upload de arquivo para Supabase Storage, cria registro em attachments. |
| `createOrganization` | `app/(app)/onboarding/actions.ts` | Criar organização + pipeline padrão no onboarding. |

---

## Middleware

Arquivo: `middleware.ts` na raiz do projeto.

Responsabilidades:

1. **Verificar sessão do Supabase** em todas as rotas sob `/(app)/*`.
2. **Redirect para `/login`** se não autenticado e tentando acessar rota protegida.
3. **Redirect para `/pipeline`** se autenticado e tentando acessar `/login` ou `/signup`.
4. **Redirect para `/onboarding`** se autenticado mas organização não configurada (flag `onboarding_completed` no user profile).
5. **Verificar role admin** para rotas `/settings/*` — redirect para `/pipeline` se não for admin.
6. **Refresh do token** de autenticação do Supabase (necessário para manter sessão ativa).

```typescript
// Matcher — rotas que o middleware intercepta
export const config = {
  matcher: [
    '/(app)/:path*',
    '/login',
    '/signup',
    '/onboarding',
    '/settings/:path*',
  ],
};
```

---

## Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=              # URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=         # Chave anônima (pública, usada no client)
SUPABASE_SERVICE_ROLE_KEY=             # Chave de serviço (server-side only, nunca expor no client)

# Evolution API
EVOLUTION_API_URL=                     # URL base da instância Evolution API
EVOLUTION_API_KEY=                     # API key para autenticação nas requisições
EVOLUTION_WEBHOOK_SECRET=              # Token para validar webhooks recebidos

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=          # Chave pública VAPID (usada no client para subscription)
VAPID_PRIVATE_KEY=                     # Chave privada VAPID (server-side only)
VAPID_SUBJECT=                        # Email de contato para VAPID (ex: mailto:admin@leadzap.com)

# App
NEXT_PUBLIC_APP_URL=                   # URL base da aplicação (ex: https://app.leadzap.com)
```

---

## Integrações Técnicas

### Supabase Client

Três clients para diferentes contextos:

| Client | Arquivo | Uso |
|--------|---------|-----|
| Browser client | `/lib/supabase/client.ts` | Client Components. Usa `createBrowserClient()` do `@supabase/ssr`. Inicializado com `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| Server client | `/lib/supabase/server.ts` | Server Components e Server Actions. Usa `createServerClient()` com cookies do request. Respeita RLS do usuário logado. |
| Admin client | `/lib/supabase/admin.ts` | Webhooks e operações de sistema. Usa `createClient()` com `SUPABASE_SERVICE_ROLE_KEY`. Bypassa RLS — usar com cuidado. |

O middleware (`/lib/supabase/middleware.ts`) também cria um server client específico para refresh de tokens.

### Evolution API

Comunicação bidirecional:

**Sistema → Evolution API (requisições HTTP):**
- `POST /instance/create` — Criar instância WhatsApp para uma organização.
- `GET /instance/connect/{instanceName}` — Obter QR code para conectar.
- `GET /instance/connectionState/{instanceName}` — Verificar status da conexão.
- `DELETE /instance/logout/{instanceName}` — Desconectar instância.

Implementado em `/lib/evolution/client.ts`. Cada organização tem uma instância nomeada `org_{organizationId}`.

**Evolution API → Sistema (webhooks):**
- Evolution API envia POST para `/api/webhooks/evolution` quando recebe mensagem.
- Webhook handler em `/lib/evolution/webhook-handler.ts`:
  1. Valida token do header (`EVOLUTION_WEBHOOK_SECRET`).
  2. Parseia payload (extrai: instanceName, sender number, message content, timestamp, media type).
  3. Identifica organização pelo instanceName.
  4. Busca lead pelo telefone do remetente.
  5. Se lead existe: cria registro em `messages`, atualiza `last_interaction_at` do lead.
  6. Se lead não existe: cria lead + mensagem.
  7. Cria notificação para o responsável do lead (ou admin se lead novo).
- Usa admin client do Supabase (bypassa RLS porque webhook é operação de sistema).

### PWA e Push Notifications

**Setup:**
- `app/manifest.ts` — Gera manifest JSON dinâmico via Next.js Route Handler. Inclui: name, short_name, icons, start_url, display: standalone, theme_color.
- `public/sw.js` — Service Worker estático. Responsável por: receber push events, exibir notificação, lidar com click na notificação (abrir URL do lead).

**Fluxo de registro:**
1. Ao carregar o app, hook `use-push-notification.ts` verifica se push é suportado.
2. Se suportado, solicita permissão ao usuário.
3. Se permitido, registra Service Worker e obtém PushSubscription.
4. Envia subscription (endpoint + keys) para `POST /api/push/subscribe`.
5. Backend armazena subscription na tabela `push_subscriptions`, vinculada ao user.

**Fluxo de envio:**
1. Trigger: lembrete venceu OU nova mensagem WhatsApp chegou.
2. Backend busca push subscriptions do usuário alvo.
3. Usa biblioteca `web-push` para enviar notificação via Web Push Protocol.
4. Payload: `{ title, body, url, tag }`.
5. Service Worker recebe `push` event, exibe notificação nativa.
6. Ao clicar, abre a URL do lead no app.

### Supabase Realtime

Subscriptions ativas nos Client Components:

| Canal | Tabela | Filtro | Componente | Propósito |
|-------|--------|--------|------------|-----------|
| leads | `leads` | `organization_id=eq.{orgId}` | pipeline-board | Atualizar pipeline quando outro usuário move ou cria lead. |
| messages | `messages` | `lead_id=eq.{leadId}` | lead-messages | Novas mensagens WhatsApp aparecem sem refresh. |
| reminders | `reminders` | `user_id=eq.{userId}` | reminder-list, notification-bell | Badge de notificação atualiza em tempo real. |

Subscriptions são estabelecidas no mount do componente e cleaned up no unmount. Usam o browser client do Supabase.

---

## Drag-and-Drop

Biblioteca: **@dnd-kit/core** + **@dnd-kit/sortable**.

Motivo: leve, acessível (keyboard support nativo), funciona com touch, API composable.

Implementação:
- `DndContext` no `pipeline-board.tsx`.
- Cada `pipeline-column.tsx` é um `useDroppable`.
- Cada `pipeline-card.tsx` é um `useSortable` (permite reordenar dentro da coluna também).
- `onDragEnd`: chamada otimista — atualiza estado local imediatamente, chama Server Action `moveLead` em background. Se falhar, reverte estado e exibe toast.
- Sensor de pointer + touch para compatibilidade mobile.
