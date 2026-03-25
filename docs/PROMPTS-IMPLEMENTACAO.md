# PROMPTS DE IMPLEMENTAÇÃO — LeadZap

## Estratégia de Uso

**NÃO despeje todos os 8 documentos de uma vez.** O AI coder vai se perder, inventar coisas e tomar decisões inconsistentes.

A abordagem correta é:

1. **Uma sessão por fase** (ou por grupo de tarefas dentro de uma fase).
2. **Cada sessão recebe apenas os documentos relevantes** para aquela fase.
3. **O prompt de cada sessão tem 3 partes:** contexto do projeto → documentação relevante → tarefa específica.
4. **Ao final de cada sessão**, revise o código antes de iniciar a próxima.

### Onde usar esses prompts

- **Claude Code (terminal):** Ideal. Cole o prompt e anexe os arquivos .md como contexto.
- **Cursor / Windsurf:** Use o prompt como instrução e adicione os .md relevantes no contexto do chat ou como docs do projeto.
- **Claude.ai:** Funciona, mas sessões longas perdem contexto. Prefira sessões curtas e focadas.

### Dica crítica

Antes de cada sessão, adicione os documentos relevantes ao contexto. No Claude Code, use o comando `/add-file`. No Cursor, arraste os arquivos para o chat. Nunca assuma que o AI coder "lembra" de sessões anteriores.

---

## PROMPT 0 — System Prompt (usar em TODAS as sessões)

> Cole este bloco como instrução de sistema ou no início de toda sessão. Ele define o comportamento base do AI coder.

```
Você é um engenheiro fullstack sênior implementando o LeadZap — um SaaS de gestão de leads e pipeline de vendas, WhatsApp-first, para pequenos negócios no Brasil.

Stack obrigatória:
- Next.js 14+ (App Router)
- Supabase (Auth, Postgres, Storage, Realtime)
- shadcn/ui (components)
- TailwindCSS
- TypeScript (strict)
- PWA (service worker + manifest)

Regras inegociáveis:
1. NUNCA invente funcionalidades que não estão na documentação.
2. NUNCA use `pages/` router — apenas App Router com `app/` directory.
3. NUNCA use `any` em TypeScript. Type tudo.
4. NUNCA instale bibliotecas que não foram especificadas sem perguntar antes.
5. Use Server Components por padrão. Client Components ("use client") apenas quando houver interatividade (estado, eventos, hooks de browser).
6. Server Actions para mutações. API Routes apenas para webhooks e endpoints externos.
7. Validação com Zod em toda entrada de dados (forms e server actions).
8. Supabase RLS é obrigatório — nunca confie apenas em validação client-side.
9. Siga a estrutura de pastas definida no ARCHITECTURE.md — não crie pastas ou arquivos em locais diferentes.
10. Use os componentes shadcn/ui mapeados no DESIGN-GUIDELINES.md — não crie componentes UI do zero se existe equivalente no shadcn.

Quando terminar uma tarefa, liste:
- Arquivos criados/modificados
- O que foi implementado
- O que falta para completar a fase
- Qualquer decisão que você tomou que não estava explícita na documentação
```

---

## PROMPT 1 — Fase 1: Setup e Infraestrutura

**Documentos para anexar:** `ARCHITECTURE.md`, `DESIGN-GUIDELINES.md`, `DATABASE-SCHEMA.md`

```
## Tarefa: Setup inicial do projeto LeadZap

Contexto: Estou iniciando o desenvolvimento do LeadZap do zero. Preciso que você configure toda a base do projeto seguindo exatamente a arquitetura documentada.

Faça na ordem:

### 1. Criar projeto Next.js
- `npx create-next-app@latest leadzap --typescript --app --tailwind --eslint --src-dir=false --import-alias="@/*"`

### 2. Instalar e configurar shadcn/ui
- Inicializar shadcn com estilo "New York"
- Instalar os componentes: Button, Input, Label, Form, Dialog, Sheet, Select, Textarea, Badge, DropdownMenu, Card, Separator, Avatar, Tooltip, Popover, Calendar, Command, Tabs, Table
- Configurar Sonner (toast)

### 3. Instalar dependências
```bash
npm install @supabase/ssr @supabase/supabase-js @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities web-push zod date-fns lucide-react
npm install -D @types/web-push
```

### 4. Criar estrutura de pastas
Seguir EXATAMENTE o que está em ARCHITECTURE.md. Criar os diretórios e arquivos placeholder (com `// TODO` onde necessário):
- `app/(auth)/` com layout e páginas
- `app/(app)/` com layout e páginas
- `app/api/webhooks/evolution/route.ts`
- `app/api/push/subscribe/route.ts`
- `app/api/push/send/route.ts`
- `components/` com subpastas por feature
- `lib/supabase/` com client.ts, server.ts, admin.ts, middleware.ts
- `lib/evolution/`
- `lib/push/`
- `lib/utils/`
- `lib/hooks/`
- `types/`

### 5. Configurar Supabase clients
Implementar os 3 clients seguindo o padrão oficial do @supabase/ssr:
- `lib/supabase/client.ts` → createBrowserClient (para Client Components)
- `lib/supabase/server.ts` → createServerClient (para Server Components e Server Actions, usando cookies)
- `lib/supabase/admin.ts` → createClient com service_role (para webhooks)
- `lib/supabase/middleware.ts` → createServerClient para middleware

### 6. Criar middleware Next.js
Arquivo `middleware.ts` na raiz. Responsabilidades:
- Refresh de token Supabase
- Redirect /login e /signup → /pipeline se autenticado
- Redirect rotas /(app)/* → /login se não autenticado
- Redirect → /onboarding se onboarding_completed=false
- Redirect /settings/* → /pipeline se não admin

Matcher: ['/(app)/:path*', '/login', '/signup', '/onboarding', '/settings/:path*']

### 7. Configurar PWA
- `app/manifest.ts` → Route handler que retorna JSON do manifest (name: "LeadZap", display: "standalone", theme_color, icons)
- `public/sw.js` → Service worker mínimo (install, activate, push event handler placeholder, notificationclick handler placeholder)
- Registrar SW no root layout

### 8. Configurar .env
Criar `.env.local` e `.env.example` com todas as variáveis listadas em ARCHITECTURE.md (sem valores reais no .example)

### 9. Root layout
- Font Inter via next/font/google
- Metadata (title, description)
- Toaster do Sonner
- Script de registro do Service Worker

### 10. Types base
- `types/database.ts` → placeholder (será gerado pelo Supabase CLI depois)
- `types/lead.ts`, `types/pipeline.ts`, `types/evolution.ts` → types de domínio básicos

### 11. Utilitários
- `lib/utils/formatters.ts` → formatCurrency (BRL), formatPhone (BR), formatDate, formatRelativeTime
- `lib/utils/validators.ts` → schemas Zod para telefone BR, email
- `lib/utils/constants.ts` → DEFAULT_PIPELINE_STAGES, DEFAULT_TAGS, FILE_LIMITS, PLANS

NÃO implemente lógica de negócio ainda. Apenas a estrutura, configuração e utilitários base. O projeto deve compilar sem erros ao final.
```

---

## PROMPT 2 — Fase 2: Auth

**Documentos para anexar:** `ARCHITECTURE.md`, `PRD.md` (seção de Auth), `DESIGN-GUIDELINES.md`

```
## Tarefa: Implementar autenticação completa

Contexto: O projeto LeadZap já tem a estrutura base configurada (Fase 1 completa). Agora preciso implementar o fluxo de autenticação com Supabase Auth.

Pré-requisitos já configurados:
- Supabase clients em lib/supabase/ (browser, server, admin)
- Middleware com redirects de auth
- Layout de auth em app/(auth)/layout.tsx (precisa ser implementado)

Implementar:

### 1. Layout de auth — `app/(auth)/layout.tsx`
- Centralizado na tela (flexbox center)
- Card com max-width 400px
- Logo "LeadZap" no topo (texto por enquanto, sem imagem)
- Background branco, clean

### 2. Página de cadastro — `app/(auth)/signup/page.tsx`
- Formulário com: nome completo, email, senha (mín. 8 chars), confirmar senha
- Validação com Zod
- Usar supabase.auth.signUp() com options.data: { full_name }
- Após sucesso: mostrar mensagem "Verifique seu email para confirmar sua conta"
- Link para login: "Já tem conta? Entrar"
- Usar componentes shadcn: Form, Input, Label, Button

### 3. Página de login — `app/(auth)/login/page.tsx`
- Formulário com: email, senha
- Usar supabase.auth.signInWithPassword()
- Erro: "Email ou senha incorretos"
- Sucesso: redirect para /pipeline (middleware faz redirect para /onboarding se necessário)
- Link para cadastro: "Não tem conta? Criar conta"
- Link para recuperação: "Esqueceu a senha?"

### 4. Confirmação de email — `app/(auth)/confirm/page.tsx`
- Route que recebe o token de confirmação do Supabase (via URL params)
- Troca o token por sessão usando supabase.auth.exchangeCodeForSession()
- Sucesso: redirect para /login com mensagem
- Erro: mensagem amigável

### 5. Recuperação de senha — `app/(auth)/forgot-password/page.tsx`
- Formulário com email
- supabase.auth.resetPasswordForEmail()
- Mensagem: "Se esse email estiver cadastrado, você receberá um link para redefinir sua senha"

### 6. Reset de senha — `app/(auth)/reset-password/page.tsx`
- Formulário: nova senha, confirmar nova senha
- supabase.auth.updateUser({ password })
- Sucesso: redirect para /login

### Regras de design:
- Todos os inputs com variant default do shadcn
- Botão primary: "Cadastrar" / "Entrar"
- Espaçamento conforme DESIGN-GUIDELINES (base 4px)
- Border radius dos inputs: 8px (rounded-lg)
- Tipografia: Inter, conforme escala definida
- Feedback de erro: texto vermelho abaixo do campo
- Loading state: botão disabled com spinner durante requisição

IMPORTANTE: O trigger handle_new_user no Supabase já cria o registro na tabela users automaticamente. Não crie o user manualmente no client.
```

---

## PROMPT 3 — Fase 3: Onboarding e Layout

**Documentos para anexar:** `ARCHITECTURE.md`, `PRD.md` (seção de Onboarding), `DESIGN-GUIDELINES.md`, `DATABASE-SCHEMA.md` (tabela organizations)

```
## Tarefa: Implementar layout principal e onboarding

Contexto: Auth está funcionando (Fase 2 completa). Após o primeiro login, o usuário precisa criar sua organização via onboarding wizard. Também preciso do layout principal do app (sidebar + header).

### 1. Layout principal — `app/(app)/layout.tsx`
- Server Component que busca sessão e dados do user/org
- Sidebar à esquerda (240px desktop, drawer em mobile)
- Header no topo
- Área de conteúdo principal

### 2. Sidebar — `components/layout/sidebar.tsx`
- Client Component (interativo)
- Logo "LeadZap" no topo
- Navegação:
  - Pipeline (ícone: LayoutGrid) — /pipeline
  - Leads (ícone: Users) — /leads
  - Lembretes (ícone: Bell) — /reminders
  - Configurações (ícone: Settings) — /settings (apenas admin)
- Item ativo: background zinc-100, texto zinc-900
- Item hover: background zinc-50
- Em mobile: hamburger menu que abre como Sheet (shadcn) pela esquerda

### 3. Header — `components/layout/header.tsx`
- Status do WhatsApp (placeholder por agora — dot verde/vermelho + texto)
- Notification bell com badge de contador (placeholder — só UI)
- Avatar do usuário com dropdown (Nome, Email, Sair)
- Logout: supabase.auth.signOut() → redirect /login

### 4. Server Action createOrganization — `app/(app)/onboarding/actions.ts`
- Recebe: name (string)
- Gera slug a partir do nome (slugify: lowercase, remove acentos, replace espaços por hifens)
- Cria organização na tabela organizations
- Atualiza user com organization_id e role='admin'
- Seta onboarding_completed=true no user
- Os triggers do Supabase automaticamente criam pipeline_stages e tags padrão
- Retorna org criada

### 5. Página de onboarding — `app/(app)/onboarding/page.tsx`
- Client Component (wizard com estado)
- Barra de progresso (3 passos)
- Passo 1 — Nome da empresa:
  - Input para nome
  - Botão "Continuar"
  - Chama createOrganization
- Passo 2 — Conectar WhatsApp:
  - Por agora: placeholder com texto "Conecte seu WhatsApp para receber mensagens automaticamente"
  - Botão "Configurar depois" (skip)
  - Botão "Continuar"
- Passo 3 — Criar primeiro lead:
  - Formulário simplificado: nome + telefone
  - Botão "Criar lead" → chama createLead (placeholder action por agora, retorna sucesso fake)
  - Botão "Pular"
- Ao completar: redirect para /pipeline

### Regras:
- Sidebar segue DESIGN-GUIDELINES: background zinc-50, border-right zinc-200
- Header: background branco, border-bottom zinc-200, height 64px
- Wizard: card centralizado, max-width 480px
- Transições suaves entre passos (não precisa de animação complexa — apenas conditional rendering)
```

---

## PROMPT 4 — Fase 4: Pipeline e Leads (CORE)

**Documentos para anexar:** `ARCHITECTURE.md`, `PRD.md` (módulos Pipeline e Leads), `DATABASE-SCHEMA.md`, `DESIGN-GUIDELINES.md`

> **ATENÇÃO:** Esta é a fase mais complexa. Divida em 2-3 sessões se necessário.

### Sessão 4a: Server Actions + Pipeline Board

```
## Tarefa: Implementar Server Actions de leads e pipeline visual

Contexto: Onboarding funciona, organização é criada com pipeline padrão (5 colunas). Agora preciso do pipeline visual com drag-and-drop — a feature core do produto.

### 1. Server Actions de leads — `app/(app)/pipeline/actions.ts`

Implementar com validação Zod em cada action:

**createLead:**
- Input: { name, phone, email?, company?, source, estimated_value?, notes? }
- Valida telefone BR (formato +55...)
- Verifica duplicata por telefone na org (leads_org_phone_unique)
- Busca primeiro stage do pipeline (position=0) para definir pipeline_stage_id
- Atribui ao usuário atual (assigned_to = auth.uid())
- Registra atividade type='lead_created'
- Retorna lead criado

**updateLead:**
- Input: { id, ...campos parciais }
- Verifica que o lead pertence à org e o user tem acesso
- Registra atividade type='lead_updated'

**moveLead:**
- Input: { leadId, newStageId, newPosition }
- Atualiza pipeline_stage_id e position
- Atualiza last_interaction_at
- Registra atividade type='lead_moved' com metadata: { from_stage, to_stage }
- Retorna lead atualizado

**deleteLead:**
- Soft delete: SET deleted_at = now()
- Apenas admin
- Registra atividade type='lead_deleted'

### 2. Pipeline page — `app/(app)/pipeline/page.tsx`
- Server Component
- Busca pipeline_stages da org (ordenadas por position)
- Busca leads da org (com RLS, filtro deleted_at IS NULL)
- Busca tags da org
- Passa tudo como props para pipeline-board

### 3. Pipeline board — `components/pipeline/pipeline-board.tsx`
- Client Component ("use client")
- DndContext do @dnd-kit com sensors: PointerSensor + TouchSensor
- Estado local dos leads (para otimistic updates)
- onDragEnd: atualiza estado local → chama moveLead → se erro, reverte + toast
- DragOverlay com cópia visual do card sendo arrastado (sombra lg)

### 4. Pipeline column — `components/pipeline/pipeline-column.tsx`
- useDroppable do @dnd-kit
- Header: nome da coluna, contador de leads, soma de valores (R$)
- Lista de pipeline-cards
- Se coluna tem 50+ leads: scroll interno com overflow-y-auto

### 5. Pipeline card — `components/pipeline/pipeline-card.tsx`
- useSortable do @dnd-kit
- Exibe: nome (semibold), telefone (muted), tag principal (Badge), valor estimado, indicador de tempo desde última interação
- onClick: abre lead drawer (via callback prop)
- Estilo: background branco, border zinc-200, rounded-lg, shadow-sm, hover: border zinc-300
- No drag: shadow-lg, opacity 0.9

### 6. Hook use-realtime-leads — `lib/hooks/use-realtime-leads.ts`
- Subscription Supabase Realtime na tabela leads filtrada por organization_id
- On INSERT: adicionar lead ao estado
- On UPDATE: atualizar lead no estado
- On DELETE: remover lead do estado
- Cleanup no unmount

### Regras de design:
- Pipeline: horizontal scroll em mobile, gap de 16px entre colunas
- Colunas: width 280px, min-height calc(100vh - header - padding)
- Cards: padding 12px, gap de 8px entre cards
- Contadores: texto sm, muted, semibold para valores em R$
- Formatar valores com formatCurrency (R$ 1.234,56)
- Formatar tempo relativo: "há 2h", "há 3 dias", "agora"
```

### Sessão 4b: Lead Drawer + Tags + Filtros

```
## Tarefa: Implementar drawer de detalhes do lead, tags e filtros

Contexto: Pipeline visual está funcionando com drag-and-drop. Agora preciso do drawer lateral que abre ao clicar em um card, o sistema de tags, e os filtros do pipeline.

### 1. Lead drawer — `components/leads/lead-drawer.tsx`
- Usa Sheet do shadcn (side="right")
- Width: 480px em desktop, fullscreen em mobile
- Tabs (shadcn Tabs): Dados, Mensagens, Notas, Atividades
- Tab "Dados":
  - Campos editáveis inline (nome, telefone, email, empresa, origem, valor estimado)
  - Seção de tags (lead-tags component)
  - Seção de anexos (placeholder — Fase 7)
  - Botão "Criar lembrete" (abre Dialog)
  - Botão "Abrir no WhatsApp" → link para wa.me/{phone}
  - Se admin: select para mudar responsável (assigned_to)
  - Se admin: botão "Excluir lead" (destructive)
- Tab "Mensagens": placeholder "Mensagens do WhatsApp aparecerão aqui após conectar"
- Tab "Notas": lead-notes component
- Tab "Atividades": placeholder (Fase 7)
- Header do drawer: nome do lead, badge do estágio atual, botão fechar

### 2. Lead tags — `components/leads/lead-tags.tsx`
- Lista de tags atuais do lead (badges coloridas, conforme DESIGN-GUIDELINES)
- Botão "+" para adicionar tag
- Popover com Command (shadcn) para buscar/selecionar tags da org
- Opção de criar nova tag (input + color picker simples — pode ser select com 6 cores predefinidas)
- Click no "x" do badge remove a tag
- Server Actions: addTagToLead, removeTagFromLead, createTag

### 3. Lead notes — `components/leads/lead-notes.tsx`
- Campo Textarea para nova nota
- Botão "Salvar nota"
- Ao salvar: Server Action que atualiza o campo `notes` do lead (append com timestamp e autor)
  - Alternativa: usar a tabela activities com type='note_added' e metadata.text
- Histórico de notas em ordem cronológica reversa
- Cada nota: texto, autor, timestamp

### 4. Pipeline filters — `components/pipeline/pipeline-filters.tsx`
- Barra acima do pipeline board
- Filtros:
  - Tag: multi-select (Popover + Command do shadcn)
  - Responsável: Select (apenas se admin — mostra membros da org)
  - Busca por nome/telefone: Input com ícone de search
- Filtros aplicados como estado local (filtra os leads em memória no client)
- Chips dos filtros ativos com "x" para remover
- Botão "Limpar filtros"

### 5. Lista de leads — `app/(app)/leads/page.tsx`
- Visão alternativa ao pipeline — tabela com os mesmos leads
- Usar Table do shadcn
- Colunas: Nome, Telefone, Estágio, Responsável, Tags, Valor estimado, Última interação
- Clicar na row abre o mesmo lead-drawer
- Mesmos filtros do pipeline
- Ordenação por coluna (client-side)

### Regras:
- Tags usam as cores definidas no DESIGN-GUIDELINES (quente=red, frio=blue, indeciso=amber, VIP=violet)
- Tags customizadas: pool de 6 cores para o usuário escolher
- Drawer: transição suave de abertura (shadcn Sheet já faz isso)
- Formulário inline: campos em modo read-only por padrão, clique para editar, save automático on blur
```

---

## PROMPT 5 — Fase 5: WhatsApp (Evolution API)

**Documentos para anexar:** `ARCHITECTURE.md`, `PRD.md` (módulo WhatsApp), `DATABASE-SCHEMA.md` (tabelas messages, whatsapp_instances)

```
## Tarefa: Implementar integração com Evolution API (WhatsApp leitura)

Contexto: Pipeline e leads estão funcionais. Agora preciso conectar o WhatsApp via Evolution API para receber mensagens automaticamente.

A Evolution API é self-hosted. O sistema se comunica de duas formas:
1. Sistema → Evolution API: requisições HTTP (criar instância, QR code, status)
2. Evolution API → Sistema: webhooks (mensagens recebidas)

### 1. Evolution API client — `lib/evolution/client.ts`
Funções (todas assíncronas, usam fetch):

**createInstance(orgId: string):**
- POST para ${EVOLUTION_API_URL}/instance/create
- Body: { instanceName: `org_${orgId}`, qrcode: true, integration: "WHATSAPP-BAILEYS" }
- Header: apikey: ${EVOLUTION_API_KEY}
- Cria registro em whatsapp_instances

**getQRCode(instanceName: string):**
- GET para ${EVOLUTION_API_URL}/instance/connect/${instanceName}
- Retorna base64 do QR code

**getConnectionStatus(instanceName: string):**
- GET para ${EVOLUTION_API_URL}/instance/connectionState/${instanceName}
- Retorna: "open" (conectado), "close" (desconectado), "connecting"

**logoutInstance(instanceName: string):**
- DELETE para ${EVOLUTION_API_URL}/instance/logout/${instanceName}
- Atualiza status em whatsapp_instances

### 2. Types — `types/evolution.ts`
Types para:
- Payload do webhook de mensagem (sender, content, messageType, instanceName, timestamp)
- Resposta de criação de instância
- Resposta de QR code
- Status de conexão

### 3. Webhook handler — `lib/evolution/webhook-handler.ts`
Função processWebhook(payload):
1. Validar token do header (EVOLUTION_WEBHOOK_SECRET)
2. Extrair: instanceName, sender (phone + name), content, messageType, remoteJid, timestamp
3. Identificar org pelo instanceName (parse org_${orgId})
4. Normalizar telefone (extrair número limpo do remoteJid formato: 5511999999999@s.whatsapp.net)
5. Buscar lead por telefone na org
6. Se lead NÃO existe: criar lead com source='whatsapp', name do perfil, phone, assigned_to=null (admin decide)
7. Inserir mensagem na tabela messages (dedup por whatsapp_message_id)
8. Atualizar last_interaction_at do lead
9. Registrar atividade type='message_received'
- Usar Supabase admin client (bypassa RLS — webhook é operação de sistema)

### 4. API route — `app/api/webhooks/evolution/route.ts`
- POST handler
- Valida webhook secret
- Chama processWebhook
- Responde 200 sempre (para não gerar retry da Evolution API)
- Loga erros internamente sem retornar para Evolution API

### 5. Página de config WhatsApp — `app/(app)/settings/whatsapp/page.tsx`
- Botão "Conectar WhatsApp"
  - Ao clicar: chama createInstance (se não existe) + getQRCode
  - Exibe QR code como imagem (base64)
  - Polling de status a cada 5 segundos (getConnectionStatus)
  - Quando status = "open": exibe "Conectado ✓" com número do telefone
- Botão "Desconectar" (se conectado): chama logoutInstance
- Status visível: conectado (dot verde), desconectado (dot vermelho)

### 6. Completar passo 2 do onboarding
- step-whatsapp.tsx agora usa as funções reais
- Exibe QR code, polling de status
- Botão "Pular" continua disponível

### 7. Lead messages — `components/leads/lead-messages.tsx`
- Busca mensagens do lead (ordenadas por received_at ASC)
- Exibe em formato de chat: balões alinhados à esquerda (mensagens do lead)
- Cada balão: conteúdo de texto, timestamp
- Se media_type não é null: exibir placeholder "[Imagem recebida]", "[Áudio recebido]", etc.
- Empty state: "Nenhuma mensagem do WhatsApp ainda"

### 8. Hook use-realtime-messages — `lib/hooks/use-realtime-messages.ts`
- Subscription Realtime em messages filtrada por lead_id
- On INSERT: adicionar mensagem ao estado + scroll to bottom

### 9. WhatsApp status no header — `components/layout/whatsapp-status.tsx`
- Busca status da instância WhatsApp da org
- Dot verde + "WhatsApp conectado" ou dot vermelho + "Desconectado"
- Admin: clicar leva para /settings/whatsapp
- Polling a cada 30 segundos OU Realtime na tabela whatsapp_instances

### 10. Badge de nova mensagem no pipeline card
- Quando lead recebe mensagem nova, exibir dot azul no card
- Ao abrir o drawer e ver a aba de mensagens, remover o dot
```

---

## PROMPT 6 — Fase 6: Lembretes e Push Notifications

**Documentos para anexar:** `ARCHITECTURE.md`, `PRD.md` (módulo Lembretes), `DATABASE-SCHEMA.md` (tabelas reminders, push_subscriptions)

```
## Tarefa: Implementar lembretes e push notifications

Contexto: Pipeline, leads e WhatsApp estão funcionais. Agora preciso de lembretes manuais com push notification via PWA.

### 1. Server Actions — `app/(app)/reminders/actions.ts`
- createReminder: { leadId, title, dueAt } → valida com Zod, cria na tabela reminders, registra atividade
- completeReminder: { reminderId } → seta completed_at = now(), registra atividade
- deleteReminder: { reminderId } → deleta (owner ou admin)

### 2. Reminder form — `components/reminders/reminder-form.tsx`
- Inputs: título (texto), data (Calendar do shadcn via Popover), hora (input type="time")
- Combinar data + hora em um timestamptz
- Botão "Criar lembrete"

### 3. Reminder list — `components/reminders/reminder-list.tsx`
- Agrupar: Atrasados (dueAt < now, vermelho), Hoje (amber), Próximos (default)
- Cada item: checkbox para completar, título, nome do lead (link), data/hora
- Checkbox chama completeReminder

### 4. Página de lembretes — `app/(app)/reminders/page.tsx`
- Exibe reminder-list com todos os lembretes do usuário
- Separação visual por grupo (atrasados/hoje/próximos)
- Empty state: "Nenhum lembrete pendente. Crie um a partir do detalhe de um lead."

### 5. Integrar no lead drawer
- Botão "Lembrete" no drawer abre Dialog com reminder-form
- Lead_id já preenchido
- Após criar: toast de sucesso, lembrete aparece na lista

### 6. Push notification — registration
- `lib/hooks/use-push-notification.ts`:
  - Verificar se browser suporta Push API e Service Workers
  - Solicitar permissão (Notification.requestPermission)
  - Registrar SW se ainda não registrado
  - Obter PushSubscription via sw.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })
  - Enviar subscription para /api/push/subscribe

- `app/api/push/subscribe/route.ts`:
  - Receber { endpoint, keys: { p256dh, auth } }
  - Salvar na tabela push_subscriptions vinculada ao user autenticado
  - Dedup por endpoint

### 7. Push notification — sending
- `lib/push/send.ts`:
  - Função sendPushNotification(userId, { title, body, url })
  - Buscar subscriptions do userId
  - Usar biblioteca web-push com VAPID credentials
  - Enviar para cada subscription
  - Se subscription expirou (status 410): deletar do banco

- `app/api/push/send/route.ts`:
  - Endpoint protegido (verificar secret ou ser chamado apenas internamente)
  - Chama sendPushNotification

### 8. Service Worker expandido — `public/sw.js`
- Event 'push': receber payload, exibir notification com title, body, icon, data.url
- Event 'notificationclick': abrir a URL do lead (clients.openWindow(data.url))

### 9. Cron de lembretes — `app/api/cron/reminders/route.ts`
- Buscar lembretes: due_at <= now(), completed_at IS NULL, push_sent = false
- Para cada: chamar sendPushNotification para o user do lembrete
- Setar push_sent = true
- Configurar no vercel.json: { "crons": [{ "path": "/api/cron/reminders", "schedule": "* * * * *" }] }
- Proteger endpoint com CRON_SECRET do Vercel

### 10. Notification bell — `components/layout/notification-bell.tsx`
- Badge com contador: lembretes atrasados + lembretes de hoje não completados
- Dropdown (DropdownMenu do shadcn) com lista rápida dos 5 mais urgentes
- Cada item: título, nome do lead, tempo relativo
- Link "Ver todos" → /reminders
- Solicitar permissão de push aqui também (se ainda não concedida)
```

---

## PROMPT 7 — Fase 7: Uploads e Activity Log

**Documentos para anexar:** `ARCHITECTURE.md`, `PRD.md` (módulo Leads — attachments e activities), `DATABASE-SCHEMA.md`

```
## Tarefa: Implementar upload de arquivos e log de atividades

### 1. Configurar Supabase Storage
Instruções para rodar no Supabase Dashboard:
- Criar bucket "attachments" (private, 5MB limit)
- MIME types: image/jpeg, image/png, image/webp, application/pdf
- Storage policies: acesso baseado em path org_{org_id}/

### 2. Server Action uploadAttachment — adicionar em `app/(app)/pipeline/actions.ts`
- Receber FormData com file
- Validar: tipo MIME (image/* ou application/pdf), tamanho <= 5MB
- Contar anexos existentes do lead (max 5)
- Upload para Supabase Storage: path `org_${orgId}/leads/${leadId}/${fileName}`
- Criar registro em attachments
- Registrar atividade type='attachment_added'

### 3. Lead attachments — `components/leads/lead-attachments.tsx`
- Lista de arquivos: ícone (imagem ou PDF), nome, tamanho formatado, data
- Botão de download (gera signed URL do Supabase Storage)
- Botão de remover (quem fez upload ou admin)
- Área de upload: input file com accept="image/*,application/pdf"
- Validação client-side de tipo e tamanho antes do upload
- Progress indicator durante upload
- Mensagem se limite de 5 atingido

### 4. Lead activity — `components/leads/lead-activity.tsx`
- Busca activities do lead (ordenadas por created_at DESC)
- Timeline visual: linha vertical à esquerda, dots por tipo, texto descritivo, timestamp
- Tipos e ícones:
  - lead_created: Plus (verde)
  - lead_moved: ArrowRight (azul) + "de {stage} para {stage}"
  - lead_assigned: UserPlus (azul) + "atribuído para {user}"
  - note_added: MessageSquare (zinc)
  - tag_added/removed: Tag (zinc)
  - reminder_created/completed: Bell (amber)
  - attachment_added/removed: Paperclip (zinc)
  - message_received: MessageCircle (verde)
- Ícones via Lucide React

### 5. Revisar todas as Server Actions
Garantir que TODAS as actions existentes registram atividade corretamente:
- createLead → lead_created
- updateLead → lead_updated
- moveLead → lead_moved com metadata { from_stage_name, to_stage_name }
- deleteLead → lead_deleted
- addTagToLead → tag_added com metadata { tag_name }
- removeTagFromLead → tag_removed com metadata { tag_name }
- createReminder → reminder_created com metadata { title, due_at }
- completeReminder → reminder_completed
```

---

## PROMPT 8 — Fase 8: Gestão de Equipe

**Documentos para anexar:** `ARCHITECTURE.md`, `PRD.md` (módulo Gestão de Equipe), `DATABASE-SCHEMA.md` (tabelas invites, users)

```
## Tarefa: Implementar convites de equipe e configurações

### 1. Server Actions — `app/(app)/settings/team/actions.ts`
- inviteMember: { email, role } → verificar se email já está na org, verificar limite de usuários do plano, criar invite com token, enviar email via Supabase (supabase.auth.admin.inviteUserByEmail ou email customizado)
- revokeInvite: { inviteId } → deletar invite pendente
- removeMember: { userId } → remover user da org (set organization_id = null)

### 2. Página de aceite de convite — `app/(auth)/invite/[token]/page.tsx`
- Buscar invite pelo token (via admin client — RLS não permite acesso público)
- Se expirado: "Este convite expirou. Peça um novo ao administrador."
- Se já aceito: "Este convite já foi utilizado."
- Se válido:
  - Se user já tem conta Supabase: logar e vincular à org
  - Se não: formulário de cadastro (nome, senha) → criar conta → vincular à org
- Ao aceitar: atualizar invite.accepted_at, atualizar user.organization_id e user.role

### 3. Team page — `app/(app)/settings/team/page.tsx`
- Lista de membros: avatar, nome, email, role (badge), data de entrada
- Lista de convites pendentes: email, role, data de envio, botão "Revogar"
- Botão "Convidar membro" → Dialog com form (email + role select)
- Indicador do limite: "2/3 membros" (baseado no plano)

### 4. Pipeline config — `app/(app)/settings/pipeline/page.tsx`
- Server Actions: updateStageName, addStage (max 7), reorderStages
- Lista de colunas com input editável (nome)
- Drag para reordenar (pode usar @dnd-kit novamente, lista vertical simples)
- Botão "Adicionar etapa" (disabled se já tem 7)
- Colunas padrão (is_default=true): podem ser renomeadas mas não deletadas
- Colunas customizadas: podem ser renomeadas, reordenadas e deletadas (se sem leads)

### 5. Settings page — `app/(app)/settings/page.tsx`
- Nome da organização (editável)
- Plano atual (informativo)
- Navegação para sub-páginas: Equipe, Pipeline, WhatsApp
```

---

## PROMPT 9 — Fase 9: Landing Page

**Documentos para anexar:** `LANDING-PAGE-SPEC.md`, `DESIGN-GUIDELINES.md`

```
## Tarefa: Implementar landing page

Siga EXATAMENTE a estrutura descrita no LANDING-PAGE-SPEC.md. A landing é Server Component (SSR para SEO).

Criar todos os componentes em `components/landing/` e compor na `app/page.tsx`.

Seções na ordem: Navbar, Hero, Problema, Solução (Como Funciona), Features, Prova Social, Preços, CTA Final, Footer.

Regras de design:
- Seguir DESIGN-GUIDELINES: Inter, paleta zinc + verde accent, espaçamento base 4px
- Referências visuais: Linear, Vercel, Resend — clean, moderno, muito espaço em branco
- Responsivo: testar em 375px, 768px, 1280px
- CTAs: "Começar grátis" sempre leva para /signup
- NÃO usar a palavra "CRM" em nenhum lugar
- Tom: direto, urgente, empático. Falar com o dono de pequeno negócio.
- Depoimentos: usar dados placeholder realistas (nomes brasileiros, negócios reais)
- Pricing: 3 cards conforme LANDING-PAGE-SPEC

Metadata SEO no layout ou page:
- title: "LeadZap — Pare de perder vendas no WhatsApp"
- description: "Organize seus atendimentos, acompanhe negociações e feche mais vendas. Simples como deveria ser."
- og:image apontando para /og-image.png (placeholder por agora)

Componentizar cada seção. O page.tsx deve ser limpo:
```tsx
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </>
  );
}
```
```

---

## PROMPT 10 — Fase 10: Polish e Deploy

**Documentos para anexar:** `IMPLEMENTATION-PLAN.md` (checklist de deploy), `DESIGN-GUIDELINES.md`

```
## Tarefa: Polish final e preparação para deploy

Revisar o projeto inteiro e adicionar:

### 1. Loading states
- Skeleton no pipeline (colunas com cards placeholder animados)
- Skeleton na lista de leads (rows placeholder)
- Spinner nos botões durante submit (disabled + Loading...)
- Suspense boundaries nas páginas do app

### 2. Error handling
- app/error.tsx — erro global
- app/(app)/error.tsx — erro no app
- Try-catch em todas as Server Actions com mensagem de erro amigável
- Toast de erro para falhas de rede

### 3. Empty states
- Pipeline sem leads: ilustração + "Crie seu primeiro lead" com botão
- Lista sem resultados de filtro: "Nenhum lead encontrado com esses filtros"
- Lembretes vazios: "Nenhum lembrete pendente"
- Mensagens vazias: "Nenhuma mensagem do WhatsApp"
- Atividades vazias: "Nenhuma atividade registrada"

### 4. Responsividade
- Pipeline: scroll horizontal em mobile, colunas de 280px
- Lead drawer: fullscreen em mobile (Sheet side="bottom" ou fullscreen)
- Sidebar: drawer com hamburger em mobile
- Tabelas: scroll horizontal em mobile
- Touch targets mínimo 44x44px

### 5. SEO
- app/sitemap.ts — apenas landing page
- app/robots.ts — allow /, disallow /pipeline, /leads, /settings, etc.
- Metadata completa na landing page

### 6. Performance
- Lazy load do pipeline-board (dynamic import)
- Lazy load do lead-drawer
- Image optimization na landing (next/image)

### 7. Vercel config
vercel.json:
{
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "* * * * *" }
  ]
}

### 8. Segurança — VERIFICAR:
- [ ] RLS em todas as 12 tabelas
- [ ] SUPABASE_SERVICE_ROLE_KEY nunca importada em client components
- [ ] Webhook token validado
- [ ] File upload: tipo e tamanho validados no servidor
- [ ] Todas as Server Actions verificam autenticação e autorização

Ao final, o projeto deve compilar sem erros, sem warnings de TypeScript, e estar pronto para `vercel deploy`.
```

---

## Resumo: Ordem de Sessões e Documentos

| Sessão | Fase | Documentos para anexar |
|--------|------|----------------------|
| 0 | System prompt | Nenhum (é o prompt base) |
| 1 | Setup | ARCHITECTURE + DESIGN-GUIDELINES + DATABASE-SCHEMA |
| 2 | Auth | ARCHITECTURE + PRD (auth) + DESIGN-GUIDELINES |
| 3 | Onboarding | ARCHITECTURE + PRD (onboarding) + DESIGN-GUIDELINES + DATABASE-SCHEMA (organizations) |
| 4a | Pipeline core | ARCHITECTURE + PRD (pipeline/leads) + DATABASE-SCHEMA + DESIGN-GUIDELINES |
| 4b | Drawer + Tags + Filtros | ARCHITECTURE + PRD (leads) + DATABASE-SCHEMA + DESIGN-GUIDELINES |
| 5 | WhatsApp | ARCHITECTURE + PRD (WhatsApp) + DATABASE-SCHEMA (messages, whatsapp_instances) |
| 6 | Lembretes + Push | ARCHITECTURE + PRD (lembretes) + DATABASE-SCHEMA (reminders, push_subscriptions) |
| 7 | Uploads + Activities | ARCHITECTURE + PRD (attachments) + DATABASE-SCHEMA |
| 8 | Equipe | ARCHITECTURE + PRD (equipe) + DATABASE-SCHEMA (invites) |
| 9 | Landing | LANDING-PAGE-SPEC + DESIGN-GUIDELINES |
| 10 | Polish + Deploy | IMPLEMENTATION-PLAN (checklist) + DESIGN-GUIDELINES |

---

## Dicas Finais

1. **Sempre revise o código entre sessões.** Não avance para a próxima fase sem testar a atual.
2. **Se o AI coder inventar algo**, pare e corrija. Cole o trecho relevante da documentação e peça para refazer.
3. **O DATABASE-SCHEMA.md tem o SQL pronto.** Execute no Supabase antes de começar a Fase 2.
4. **O System Prompt (Prompt 0) deve ser incluído em TODA sessão.** Ele mantém o AI coder alinhado.
5. **Se uma sessão ficar muito longa (>30 mensagens)**, inicie uma nova sessão com o contexto atualizado.
