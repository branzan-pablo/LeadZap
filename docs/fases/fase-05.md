# Fase 5 — WhatsApp (Evolution API)

**Data:** 2026-03-25  
**Prompt:** `docs/PROMPTS-IMPLEMENTACAO.md` — PROMPT 5

## Objetivo

Integrar Evolution API (modo leitura): cliente HTTP, webhook que persiste mensagens e leads, telas de conexão (configurações + onboarding), histórico de mensagens no drawer com Realtime, status no header e indicador de nova mensagem nos cards do pipeline e na lista de leads.

## Entregas

### Evolution e webhook

- `lib/evolution/client.ts` — `createInstance(orgId)` com body `WHATSAPP-BAILEYS` + `qrcode`, `getQRCode`, `getConnectionStatus`, `logoutInstance`, helpers `extractQrDataUrl`, `mapConnectionResponseToDbStatus`, `extractConnectedPhone`, `instanceNameForOrg`.
- `lib/evolution/normalize-webhook-payload.ts` — `normalizeEvolutionWebhookPayload` para eventos estilo `messages.upsert` (objeto ou array em `data`; fallback por formato de mensagem).
- `lib/evolution/webhook-handler.ts` — `processWebhook`: resolve org por `org_{uuid}`, telefone E.164, lead existente ou criação na primeira coluna (`source: whatsapp`, `assigned_to: null`), INSERT em `messages` com dedup por `whatsapp_message_id`, UPDATE `last_interaction_at`, atividade `message_received` (e `lead_created` na criação do lead).
- `app/api/webhooks/evolution/route.ts` — valida secret (401 se inválido); após autenticação responde sempre **200** e loga erros internamente.
- `types/evolution.ts` — tipos de status DB, payload, mensagem normalizada, respostas da API.

### Server Actions e UI de conexão

- `app/(app)/settings/whatsapp/actions.ts` — `prepareWhatsAppConnection`, `syncWhatsAppInstanceState`, `disconnectWhatsAppInstance` (admin); `getWhatsAppHeaderStatus` (qualquer membro, leitura via service role).
- `app/(app)/settings/whatsapp/page.tsx` — página de configuração com `WhatsAppConnectPanel`.
- `components/whatsapp/whatsapp-connect-panel.tsx` — QR, polling 5s de estado, conectar/desconectar, estados de admin vs não-admin.
- `components/onboarding/step-whatsapp.tsx` + `onboarding-wizard.tsx` + `app/(app)/onboarding/page.tsx` — passo 2 com fluxo real e `isAdmin` da org.

### Mensagens no lead

- `types/message.ts` — `MessageView`.
- `components/leads/lead-messages.tsx` — lista por `received_at`, balões, placeholders de mídia, empty state.
- `lib/hooks/use-realtime-messages.ts` — `postgres_changes` INSERT em `messages` filtrado por `lead_id`.
- `components/leads/lead-drawer.tsx` — aba Mensagens com `LeadMessages`; `onValueChange` na aba chama `onWhatsAppMessagesViewed` para limpar badge.
- `lib/utils/formatters.ts` — `formatMessageTimestamp`.

### Header e pipeline

- `app/(app)/layout.tsx` + `components/layout/app-shell.tsx` + `components/layout/header.tsx` — repasse de `organizationId` e `role`.
- `components/layout/whatsapp-status.tsx` — polling 30s via `getWhatsAppHeaderStatus`; texto “WhatsApp conectado” / “Desconectado”; admin: link para `/settings/whatsapp`.
- `lib/hooks/use-realtime-unread-whatsapp.ts` — INSERT em `messages` por `organization_id`; estado em memória (`Set` de `lead_id`).
- `components/pipeline/pipeline-workspace.tsx`, `pipeline-board.tsx`, `pipeline-column.tsx`, `pipeline-column-static.tsx`, `pipeline-card.tsx` — dot azul quando há mensagem não “vista”.
- `components/leads/leads-workspace.tsx` — mesmo hook + dot na coluna nome.

## Decisões técnicas

1. **Webhook e RLS:** INSERT em `messages` e INSERT/UPDATE em `leads` (incl. `assigned_to` nulo) via `createAdminClient`, alinhado ao schema documentado (sem INSERT em `messages` para `authenticated`).
2. **Header para não-admin:** `whatsapp_instances` só tem SELECT RLS para admin; o status no header usa action com service role após validar sessão e org, expondo apenas `status` e `phone_number`.
3. **Badge de nova mensagem:** apenas em sessão (sem coluna no banco); limpa ao abrir a aba **Mensagens** do drawer.
4. **Payload Evolution:** parser focado em `messages.upsert` / formato equivalente; grupos `@g.us` ignorados no MVP; mensagens `fromMe` ignoradas.

## Pendências

- Validar payload exato da **versão** da Evolution API em produção (nomes de `event`, aninhamento de `data`); ajustar `normalizeEvolutionWebhookPayload` se necessário.
- Habilitar **Supabase Realtime** em `public.messages` para o hook de mensagens e de não lidas.
- **Webhook na Evolution:** URL `{NEXT_PUBLIC_APP_URL}/api/webhooks/evolution` + header `x-webhook-secret` ou `Authorization: Bearer` igual a `EVOLUTION_WEBHOOK_SECRET`.
- Extrair `phone_number` na UI quando a Evolution não devolver `wuid` no `connectionState` (hoje pode ficar só “Conectado ✓” sem número).
- Persistência de “mensagens lidas” entre sessões, se o produto exigir.

## Testes manuais sugeridos

1. Admin: Configurações → WhatsApp → Conectar, escanear QR, ver “Conectado” e número (se a API retornar).
2. Enviar mensagem de teste para o número conectado; conferir lead novo ou existente, mensagem na aba **Mensagens**, dot no card até abrir a aba.
3. Header: status verde/vermelho e link (admin) para configurações.
4. Webhook: secret errado → 401; payload válido → 200 mesmo com erro interno (ver logs).
5. Onboarding passo 2 com org criada: QR e polling sem erro de permissão (usuário admin).
