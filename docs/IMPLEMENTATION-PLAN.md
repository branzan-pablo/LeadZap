# IMPLEMENTATION-PLAN — LeadZap

## Ordem de Implementação

```
Fase 1: Setup e infraestrutura
Fase 2: Auth e perfil de usuário
Fase 3: Onboarding e organização
Fase 4: Pipeline e gestão de leads
Fase 5: WhatsApp (Evolution API)
Fase 6: Lembretes e notificações (PWA + Push)
Fase 7: Uploads e atividades
Fase 8: Gestão de equipe
Fase 9: Landing page
Fase 10: Polish e deploy
```

---

## Fase 1: Setup e Infraestrutura

**Contexto para AI coding:** Estamos criando um SaaS Next.js 14+ (App Router) com Supabase, shadcn/ui e TailwindCSS. O app é uma PWA. Nesta fase, montamos a base do projeto, instalamos dependências, configuramos Supabase e criamos a estrutura de pastas. Nenhuma feature de negócio ainda — só alicerce.

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 1.1 | Criar projeto Next.js com TypeScript e App Router | `npx create-next-app@latest --typescript --app --tailwind` | Raiz do projeto |
| 1.2 | Instalar e configurar shadcn/ui | `npx shadcn-ui@latest init`. Theme: New York. Style: Default. | `components.json`, `tailwind.config.ts` |
| 1.3 | Instalar componentes shadcn necessários | Button, Input, Label, Form, Dialog, Sheet, Select, Badge, Dropdown Menu, Toast (Sonner), Card, Separator, Avatar, Tooltip, Popover, Calendar, Command | `components/ui/*` |
| 1.4 | Instalar dependências adicionais | `@supabase/ssr`, `@supabase/supabase-js`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `web-push`, `zod`, `date-fns`, `lucide-react` | `package.json` |
| 1.5 | Configurar Supabase clients | Três clients: browser, server, admin. Seguir padrão do `@supabase/ssr`. | `lib/supabase/client.ts`, `server.ts`, `admin.ts`, `middleware.ts` |
| 1.6 | Criar middleware Next.js | Auth guard, refresh de token, redirects (login ↔ app, onboarding check). | `middleware.ts` |
| 1.7 | Criar estrutura de pastas | Grupos `(auth)` e `(app)` com layouts. Pastas `lib/`, `types/`, `components/`. | Toda a árvore de diretórios |
| 1.8 | Configurar variáveis de ambiente | Criar `.env.local` com todas as vars necessárias (sem valores sensíveis no repo). | `.env.local`, `.env.example` |
| 1.9 | Executar SQL de criação no Supabase | Rodar o script completo do DATABASE-SCHEMA.md no SQL Editor. Verificar tabelas, triggers, RLS. | Supabase Dashboard |
| 1.10 | Gerar types do Supabase | `npx supabase gen types typescript --project-id <id> > types/database.ts` | `types/database.ts` |
| 1.11 | Configurar PWA básico | Criar `app/manifest.ts` (dynamic route handler) e `public/sw.js` (service worker mínimo). Adicionar meta tags no root layout. | `app/manifest.ts`, `public/sw.js`, `app/layout.tsx` |
| 1.12 | Criar layout root | Fonts (Inter), metadata, providers (Toaster do Sonner), registro do SW. | `app/layout.tsx` |

**Dependências:** Nenhuma — esta é a primeira fase.

---

## Fase 2: Auth e Perfil de Usuário

**Contexto para AI coding:** Com a infra pronta, agora implementamos autenticação com Supabase Auth (email+senha). O trigger `handle_new_user` já cria o perfil na tabela `users` automaticamente ao registrar. Precisamos de páginas de login, cadastro, recuperação de senha e o layout de auth (centralizado, sem sidebar). O middleware já cuida dos redirects.

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 2.1 | Criar layout de auth | Layout centralizado (card no meio da tela), sem sidebar. Logo no topo. | `app/(auth)/layout.tsx` |
| 2.2 | Página de cadastro | Formulário: nome completo, email, senha. Validação com Zod. `supabase.auth.signUp()` com `full_name` nos user_metadata. Redirect para página de confirmação. | `app/(auth)/signup/page.tsx` |
| 2.3 | Página de login | Formulário: email, senha. `supabase.auth.signInWithPassword()`. Redirect para `/pipeline` (ou `/onboarding` se primeira vez). | `app/(auth)/login/page.tsx` |
| 2.4 | Página de confirmação de email | Callback route que recebe o token de confirmação do Supabase. Exibe mensagem de sucesso e redirect para login. | `app/(auth)/confirm/page.tsx` |
| 2.5 | Página de recuperação de senha | Formulário com email. `supabase.auth.resetPasswordForEmail()`. | `app/(auth)/forgot-password/page.tsx` |
| 2.6 | Página de reset de senha | Formulário com nova senha. `supabase.auth.updateUser()`. | `app/(auth)/reset-password/page.tsx` |
| 2.7 | Testar fluxo completo | Cadastrar → confirmar email → login → verificar que perfil existe na tabela `users`. | Manual |

**Dependências:** Fase 1 completa. Trigger `handle_new_user` funcionando no Supabase.

---

## Fase 3: Onboarding e Organização

**Contexto para AI coding:** Após o primeiro login, o usuário precisa criar sua organização. O onboarding é um wizard de 3 passos: (1) nome da empresa, (2) conectar WhatsApp, (3) criar primeiro lead. O passo 2 (WhatsApp) será implementado na Fase 5 — por agora, crie o placeholder com botão "pular". Ao criar a organização, os triggers criam automaticamente o pipeline padrão e as tags padrão.

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 3.1 | Criar layout do app (sidebar + header) | Sidebar com navegação: Pipeline, Leads, Lembretes, Configurações. Header com notification bell (placeholder), avatar, status WhatsApp (placeholder). Responsivo: sidebar collapsa em mobile. | `app/(app)/layout.tsx`, `components/layout/sidebar.tsx`, `components/layout/header.tsx` |
| 3.2 | Criar Server Action `createOrganization` | Recebe nome da empresa. Gera slug. Cria org. Atualiza user com `organization_id` e `role='admin'`. Seta `onboarding_completed=true` no user. | `app/(app)/onboarding/actions.ts` |
| 3.3 | Página de onboarding (wizard) | 3 passos com estado local. Passo 1: nome da empresa → chama `createOrganization`. Passo 2: placeholder "Conectar WhatsApp" com skip. Passo 3: formulário de lead → chama `createLead` (placeholder, implementar na Fase 4). Barra de progresso. | `app/(app)/onboarding/page.tsx`, `components/onboarding/onboarding-wizard.tsx`, `step-company.tsx`, `step-whatsapp.tsx`, `step-first-lead.tsx` |
| 3.4 | Ajustar middleware para onboarding | Se user autenticado e `onboarding_completed=false`, redirect para `/onboarding`. Se `onboarding_completed=true`, redirect de `/onboarding` para `/pipeline`. | `middleware.ts` |

**Dependências:** Fase 2 completa.

---

## Fase 4: Pipeline e Gestão de Leads

**Contexto para AI coding:** Esta é a feature core. O pipeline é um board visual com colunas (estágios) e cards (leads). Usa @dnd-kit para drag-and-drop. Cada card mostra: nome, telefone, tag principal, valor estimado, tempo desde última interação. O drawer lateral abre ao clicar em um card e mostra todos os detalhes do lead. Há também uma visão de lista (tabela). Os dados vêm via Server Component e atualizações via Supabase Realtime.

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 4.1 | Criar Server Actions de leads | `createLead`, `updateLead`, `moveLead`, `deleteLead` (soft delete). Cada ação valida input com Zod, verifica permissão, e registra atividade. `moveLead` atualiza `pipeline_stage_id` e `position`. | `app/(app)/pipeline/actions.ts` |
| 4.2 | Criar componente pipeline-board | Client Component. Busca leads e stages como props do Server Component pai. Renderiza colunas com `useDroppable`. Implementa `DndContext` com `onDragEnd`. | `components/pipeline/pipeline-board.tsx` |
| 4.3 | Criar componente pipeline-column | Recebe stage + leads. Renderiza header (nome, contadores de valor e quantidade), e lista de cards. `useDroppable` zone. | `components/pipeline/pipeline-column.tsx` |
| 4.4 | Criar componente pipeline-card | `useSortable`. Exibe: nome, telefone, tag principal (badge colorido), valor estimado (R$), indicador de tempo desde última interação. Click abre drawer. | `components/pipeline/pipeline-card.tsx` |
| 4.5 | Implementar drag-and-drop | Configurar sensors (pointer + touch). `onDragEnd`: atualizar estado local (otimista), chamar `moveLead` Server Action, reverter se erro. `DragOverlay` para visual de arraste. | `components/pipeline/pipeline-board.tsx` |
| 4.6 | Criar lead-drawer (detalhe do lead) | Sheet/Drawer lateral. Tabs: Dados, Mensagens (placeholder), Notas, Atividades. Formulário de edição inline. Botão de criar lembrete. | `components/leads/lead-drawer.tsx` |
| 4.7 | Criar lead-form | Formulário reutilizável para criar e editar lead. Campos: nome, telefone, email, empresa, origem (select), valor estimado, notas. Validação com Zod. | `components/leads/lead-form.tsx` |
| 4.8 | Criar lead-tags | Componente de gerenciamento de tags no drawer. Listar tags atuais, adicionar nova (select das tags da org), remover. Server Actions para add/remove tag. | `components/leads/lead-tags.tsx` |
| 4.9 | Criar lead-notes | Seção de notas no drawer. Campo de texto + botão salvar. Histórico de notas como parte das atividades. | `components/leads/lead-notes.tsx` |
| 4.10 | Criar pipeline-filters | Barra de filtros acima do pipeline. Filtros: tag (multi-select), responsável (select, admin only), status do pipeline (multi-select). Filtro atualiza query local. | `components/pipeline/pipeline-filters.tsx` |
| 4.11 | Página do pipeline | Server Component que busca stages e leads da org. Passa dados para pipeline-board. | `app/(app)/pipeline/page.tsx` |
| 4.12 | Página de lista de leads | Visão alternativa em tabela. Colunas: nome, telefone, estágio, responsável, tags, valor, última interação. Filtros e ordenação. | `app/(app)/leads/page.tsx` |
| 4.13 | Hook use-realtime-leads | Subscription Realtime na tabela `leads` filtrada por org. Ao receber INSERT/UPDATE/DELETE, atualiza o estado do pipeline. | `lib/hooks/use-realtime-leads.ts` |
| 4.14 | Contadores de valor por coluna | No header de cada coluna: "X leads · R$ Y.YYY". Atualiza ao mover lead. | `components/pipeline/pipeline-column.tsx` |
| 4.15 | Completar passo 3 do onboarding | O `step-first-lead.tsx` agora usa `createLead` real. Ao criar, redireciona para `/pipeline`. | `components/onboarding/step-first-lead.tsx` |

**Dependências:** Fase 3 completa. Tabelas `leads`, `pipeline_stages`, `tags`, `lead_tags`, `activities` com RLS funcionando.

---

## Fase 5: WhatsApp (Evolution API)

**Contexto para AI coding:** Integração com Evolution API para receber mensagens do WhatsApp. A Evolution API é self-hosted e expõe uma REST API. Precisamos: (1) criar instância para a org, (2) gerar QR code para o admin conectar, (3) receber webhooks com mensagens, (4) vincular mensagens a leads pelo telefone. Modo LEITURA apenas — o sistema não envia mensagens. As mensagens aparecem no drawer do lead, na aba "Mensagens".

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 5.1 | Criar Evolution API client | Funções: `createInstance(orgId)`, `getQRCode(instanceName)`, `getConnectionStatus(instanceName)`, `logoutInstance(instanceName)`. Usa `fetch` para a REST API. Autenticação via `EVOLUTION_API_KEY`. | `lib/evolution/client.ts` |
| 5.2 | Criar types da Evolution API | Types para payloads de webhook, respostas da API, status de conexão. | `types/evolution.ts` |
| 5.3 | Criar webhook handler | Lógica: validar token → parsear payload → identificar org pelo instanceName → buscar lead por telefone → criar lead se novo → inserir mensagem → atualizar `last_interaction_at`. Usa Supabase admin client. | `lib/evolution/webhook-handler.ts` |
| 5.4 | Criar API route do webhook | `POST /api/webhooks/evolution`. Recebe payload da Evolution API, chama webhook handler. Responde 200 OK. | `app/api/webhooks/evolution/route.ts` |
| 5.5 | Página de config WhatsApp | Tela admin com: botão "Conectar WhatsApp" → chama createInstance + exibe QR code. Status de conexão (polling a cada 10s). Botão "Desconectar". | `app/(app)/settings/whatsapp/page.tsx`, `components/settings/whatsapp-connection.tsx` |
| 5.6 | Completar passo 2 do onboarding | `step-whatsapp.tsx` agora mostra QR code real via Evolution API. Polling de status. Skip ainda disponível. | `components/onboarding/step-whatsapp.tsx` |
| 5.7 | Criar lead-messages | Componente que exibe mensagens do WhatsApp no drawer do lead. Formato de chat (balões). Texto + indicadores de mídia. Ordered by `received_at`. | `components/leads/lead-messages.tsx` |
| 5.8 | Hook use-realtime-messages | Subscription Realtime na tabela `messages` filtrada por `lead_id`. Atualiza lista de mensagens sem refresh. | `lib/hooks/use-realtime-messages.ts` |
| 5.9 | Indicador WhatsApp no header | Badge no header mostrando status da conexão WhatsApp (verde=conectado, vermelho=desconectado). Polling ou Realtime na tabela `whatsapp_instances`. | `components/layout/whatsapp-status.tsx` |
| 5.10 | Badge de nova mensagem no pipeline card | Ao receber mensagem nova, card do lead no pipeline mostra dot/badge indicando mensagem não lida. | `components/pipeline/pipeline-card.tsx` |
| 5.11 | Botão "Abrir no WhatsApp" | No drawer do lead, botão que abre `https://wa.me/{phone}` — deep link para WhatsApp. Vendedor responde pelo WhatsApp. | `components/leads/lead-drawer.tsx` |

**Dependências:** Fase 4 completa. Evolution API self-hosted e acessível. Tabelas `messages`, `whatsapp_instances` com RLS funcionando.

---

## Fase 6: Lembretes e Notificações (PWA + Push)

**Contexto para AI coding:** Lembretes são criados manualmente pelo vendedor, vinculados a um lead, com data e hora de vencimento. Quando o lembrete vence, o sistema envia push notification via Web Push API (funciona com PWA instalada). Há um centro de notificações in-app acessível pelo header. O Service Worker (criado na Fase 1) precisa ser expandido para lidar com push events.

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 6.1 | Criar Server Actions de lembretes | `createReminder`, `completeReminder`, `deleteReminder`. Validação com Zod (data futura ou passada aceita, texto obrigatório). | `app/(app)/reminders/actions.ts` |
| 6.2 | Criar reminder-form | Formulário: texto, data (Calendar do shadcn), hora (time input). Vinculado a um lead (passado como prop). | `components/reminders/reminder-form.tsx` |
| 6.3 | Criar reminder-list | Lista de lembretes agrupada por: atrasados, hoje, próximos. Checkbox para completar. Link para abrir lead. | `components/reminders/reminder-list.tsx` |
| 6.4 | Página de lembretes | Centro de tarefas. Exibe reminder-list do usuário logado. | `app/(app)/reminders/page.tsx` |
| 6.5 | Integrar reminder-form no lead-drawer | Botão "Criar lembrete" no drawer do lead abre dialog com reminder-form. | `components/leads/lead-drawer.tsx` |
| 6.6 | Implementar push subscription | Hook `use-push-notification`: verifica suporte → solicita permissão → registra SW → obtém PushSubscription → envia para `/api/push/subscribe`. | `lib/hooks/use-push-notification.ts` |
| 6.7 | API route de push subscribe | `POST /api/push/subscribe`. Recebe subscription (endpoint, p256dh, auth). Salva na tabela `push_subscriptions`. | `app/api/push/subscribe/route.ts` |
| 6.8 | API route de push send | `POST /api/push/send`. Recebe `user_id`, `title`, `body`, `url`. Busca subscriptions do user. Envia via `web-push`. Protegida por secret (chamada internamente). | `app/api/push/send/route.ts` |
| 6.9 | Expandir Service Worker | Lidar com `push` event: exibir notificação nativa. Lidar com `notificationclick`: abrir URL do lead. | `public/sw.js` |
| 6.10 | Cron de lembretes | Opção A: Vercel Cron Job (a cada 1 minuto). Busca lembretes com `due_at <= now()` e `push_sent = false` e `completed_at IS NULL`. Dispara push para cada um. Marca `push_sent = true`. Opção B: Supabase Edge Function com pg_cron. | `app/api/cron/reminders/route.ts` (ou Supabase Edge Function) |
| 6.11 | Notification bell no header | Badge com contador de lembretes pendentes + mensagens não lidas. Dropdown com lista rápida. Link para `/reminders`. Realtime update. | `components/layout/notification-bell.tsx` |

**Dependências:** Fase 4 completa (leads existem para vincular lembretes). PWA básico da Fase 1. VAPID keys geradas.

---

## Fase 7: Uploads e Atividades

**Contexto para AI coding:** Upload de arquivos (imagens e PDFs, até 5MB, máx 5 por lead) usando Supabase Storage. Cada org tem seus arquivos em um path prefixado `org_{id}/`. O log de atividades registra todas as ações feitas em um lead (movimentação, notas, tags, etc.) e é exibido como timeline no drawer.

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 7.1 | Configurar Supabase Storage | Criar bucket `attachments` via Dashboard. Configurar: privado, 5MB limit, MIME types permitidos. Policies de acesso (RLS). | Supabase Dashboard |
| 7.2 | Criar Server Action de upload | `uploadAttachment`: valida tipo MIME e tamanho no servidor, verifica limite de 5 por lead, faz upload para Storage, cria registro em `attachments`, registra atividade. | `app/(app)/pipeline/actions.ts` |
| 7.3 | Criar lead-attachments | Componente no drawer: lista de arquivos (nome, tipo, data), upload via input file ou drag-and-drop na área. Validação de tipo e tamanho no client. Botão de download. Botão de remover (para quem fez upload ou admin). | `components/leads/lead-attachments.tsx` |
| 7.4 | Criar lead-activity | Timeline de atividades no drawer. Cada entrada: ícone por tipo, descrição, timestamp, autor. Tipos: lead criado, movido, nota adicionada, tag, lembrete, upload, mensagem recebida. | `components/leads/lead-activity.tsx` |
| 7.5 | Garantir que todas as Server Actions registram atividades | Revisar todas as actions das fases anteriores. Cada mutação em lead deve criar registro em `activities` com tipo e metadata corretos. | Múltiplos arquivos de actions |

**Dependências:** Fase 4 completa. Supabase Storage configurado.

---

## Fase 8: Gestão de Equipe

**Contexto para AI coding:** Admin pode convidar membros por email, ver membros ativos e revogar convites. O convite gera um link com token que leva para uma página de aceite. O convidado cria senha (ou faz login se já tiver conta) e é vinculado à organização. Admin também pode configurar o pipeline (renomear colunas, adicionar até 2 extras).

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 8.1 | Criar Server Actions de equipe | `inviteMember` (cria invite + envia email via Supabase), `removeMember`, `revokeInvite`. Validar limite de usuários do plano. | `app/(app)/settings/team/actions.ts` |
| 8.2 | Página de convite `/invite/[token]` | Busca convite pelo token. Se expirado, mensagem de erro. Se válido: se user já tem conta → vincular à org. Se não tem conta → formulário de cadastro → vincular à org. Marca convite como aceito. | `app/(auth)/invite/[token]/page.tsx` |
| 8.3 | Página de gestão de equipe | Lista de membros (nome, email, role, data de entrada). Lista de convites pendentes (email, data, botão revogar). Botão "Convidar membro" abre dialog. | `app/(app)/settings/team/page.tsx`, `components/settings/team-members.tsx`, `components/settings/invite-form.tsx` |
| 8.4 | Server Actions de pipeline config | `updateStageName`, `addStage` (max 7 total), `reorderStages`. Validar limites. | `app/(app)/settings/pipeline/actions.ts` |
| 8.5 | Página de config pipeline | Lista de colunas com input de nome editável. Drag para reordenar. Botão "Adicionar etapa" (disabled se 7 já existem). | `app/(app)/settings/pipeline/page.tsx`, `components/settings/pipeline-config.tsx` |
| 8.6 | Página de configurações gerais | Nome da empresa, plano atual. Info apenas no MVP (edição de plano será billing futuro). | `app/(app)/settings/page.tsx` |

**Dependências:** Fase 2 completa (auth funcional). Tabela `invites` com RLS.

---

## Fase 9: Landing Page

**Contexto para AI coding:** Landing page pública otimizada para SEO. Foco em conversão para cadastro. Estilo: clean, moderno, light mode. Referências: Linear, Vercel. Sem a palavra "CRM" — posicionamento como "pare de perder vendas no WhatsApp". Server Component (SSR). Ver LANDING-PAGE-SPEC.md para estrutura detalhada de seções.

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 9.1 | Criar componentes de cada seção | Hero, Problema, Solução, Features, Prova social (placeholder), Pricing, CTA final, Footer. Seguir LANDING-PAGE-SPEC.md. | `components/landing/*` |
| 9.2 | Montar página | Server Component. Composição de seções. Metadata para SEO (title, description, og:image). | `app/page.tsx` |
| 9.3 | Responsividade | Testar e ajustar todas as seções em mobile (375px), tablet (768px) e desktop (1280px+). | `components/landing/*` |
| 9.4 | Open Graph image | Criar imagem estática para compartilhamento (1200x630). | `public/og-image.png` |

**Dependências:** Fase 1 (projeto existe). Design Guidelines definidas.

---

## Fase 10: Polish e Deploy

**Contexto para AI coding:** Revisão final, ajustes de UX, testes de fluxos críticos e deploy para produção na Vercel.

| # | Tarefa | Contexto técnico | Arquivo(s) |
|---|--------|-----------------|------------|
| 10.1 | Loading states | Adicionar skeletons/spinners em: pipeline, drawer, listas, formulários. Usar Suspense boundaries onde aplicável. | Múltiplos componentes |
| 10.2 | Error boundaries | Tratar erros em: webhook, Server Actions, Realtime. Exibir fallback UI amigável. | `app/error.tsx`, `app/(app)/error.tsx` |
| 10.3 | Empty states | Estados vazios para: pipeline sem leads, lista sem resultados, lembretes vazios, mensagens vazias. Ilustrações ou textos guiando o usuário. | Múltiplos componentes |
| 10.4 | Toasts de feedback | Garantir que toda ação do usuário tem feedback visual: toast de sucesso (lead criado, movido, lembrete criado) e toast de erro. | Múltiplos componentes |
| 10.5 | Mobile polish | Testar todos os fluxos em mobile. Pipeline com scroll horizontal. Drawer em fullscreen no mobile. Touch targets mínimos 44x44px. | Múltiplos componentes |
| 10.6 | SEO final | Verificar metadata, sitemap.xml, robots.txt. Apenas landing page indexável. App em `/pipeline/*` com noindex. | `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` |
| 10.7 | Segurança review | Verificar RLS em todas as tabelas (tentar acessar dados de outra org). Validar webhook token. Verificar que `SUPABASE_SERVICE_ROLE_KEY` nunca é exposta no client. | Manual |
| 10.8 | Performance check | Lighthouse score. Bundle size. Lazy loading de componentes pesados (pipeline, drawer). | `next.config.js` |
| 10.9 | Deploy na Vercel | Conectar repo ao Vercel. Configurar env vars de produção. Configurar domínio. Testar fluxo completo em produção. | Vercel Dashboard |
| 10.10 | Configurar Vercel Cron | Cron job para verificar lembretes a cada 1 minuto. Configurar em `vercel.json`. | `vercel.json` |

**Dependências:** Todas as fases anteriores completas.

---

## Dependências entre Fases

```
Fase 1 ──→ Fase 2 ──→ Fase 3 ──→ Fase 4 ──→ Fase 5
                                     │          │
                                     ├──→ Fase 6 (pode iniciar junto com 5)
                                     ├──→ Fase 7 (pode iniciar junto com 5)
                                     └──→ Fase 8 (pode iniciar junto com 5)
                                     
Fase 1 ──→ Fase 9 (pode ser desenvolvida em paralelo desde a Fase 1)

Todas ──→ Fase 10
```

Fases 5, 6, 7 e 8 podem ser desenvolvidas em paralelo após a Fase 4. A Fase 9 (landing page) pode ser desenvolvida em paralelo desde o início, pois não depende de lógica de negócio.

---

## Checklist de Deploy

Antes de ir ao ar, verificar:

- [ ] Todas as tabelas criadas no Supabase com RLS habilitado
- [ ] Trigger `handle_new_user` funcionando (cadastrar user cria perfil)
- [ ] Trigger de pipeline e tags padrão funcionando (criar org cria stages e tags)
- [ ] Supabase Storage bucket `attachments` criado e configurado
- [ ] Variáveis de ambiente configuradas na Vercel (todas listadas no ARCHITECTURE.md)
- [ ] Evolution API acessível e configurada para enviar webhooks para o endpoint de produção
- [ ] VAPID keys geradas e configuradas
- [ ] Vercel Cron configurado para verificar lembretes
- [ ] Domínio configurado e SSL ativo
- [ ] Fluxo de cadastro → onboarding → pipeline testado end-to-end
- [ ] Fluxo de WhatsApp → mensagem chega → lead criado/atualizado testado
- [ ] Fluxo de lembrete → push notification recebida testado (com PWA instalada)
- [ ] RLS testado: criar duas orgs e verificar que dados não vazam
- [ ] Responsividade testada em mobile (Chrome DevTools + device real)
- [ ] Landing page indexável, app com noindex
- [ ] Lighthouse performance score > 80
