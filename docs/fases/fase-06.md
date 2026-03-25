# Fase 06 — Lembretes e notificações (PWA + Push)

**Status:** concluída (implementação conforme PROMPT 6)  
**Referência:** `docs/PROMPTS-IMPLEMENTACAO.md` (PROMPT 6), `docs/IMPLEMENTATION-PLAN.md` (Fase 6)

## Objetivo

Lembretes manuais por lead (data/hora), lista centralizada, integração no drawer do lead, Web Push (VAPID + service worker), persistência em `push_subscriptions`, envio via `web-push`, cron na Vercel para lembretes vencidos, sino no header com Realtime e deep link `/leads?leadId=`.

## Entregas principais

### Server Actions

- `app/(app)/reminders/actions.ts` — `createReminder` (atividade `reminder_created` via service role quando configurado), `completeReminder` (`reminder_completed`), `deleteReminder` (dono ou admin); `revalidatePath` em `/reminders`, `/pipeline`, `/leads`.

### UI lembretes

- `components/reminders/reminder-form.tsx` — título, Calendar + Popover, hora (`type="time"`), botão “Criar lembrete”.
- `components/reminders/reminder-list.tsx` — grupos Atrasados / Hoje / Próximos, concluir, link para lead, excluir.
- `app/(app)/reminders/page.tsx` — lista server-side com join `leads(name)`.
- `types/reminder.ts` — `ReminderListItem`.
- `lib/utils/reminder-due-group.ts` — agrupamento e contagem do sino.
- `components/leads/lead-drawer.tsx` — dialog com `ReminderForm` no lugar do `datetime-local` embutido.

### Push

- `lib/hooks/use-push-notification.ts` — permissão, registro de `/sw.js`, `pushManager.subscribe`, `POST /api/push/subscribe`.
- `lib/push/subscribe.ts` — Zod + `upsert` em `push_subscriptions` com `onConflict: endpoint`.
- `lib/push/send.ts` — `sendPushNotification(userId, payload)` com admin client; remove subscription em 410/404.
- `app/api/push/subscribe/route.ts`, `app/api/push/send/route.ts` — implementados.
- `public/sw.js` — `icon`, payload `{ title, body, url, tag }`, clique com URL absoluta para paths relativos.

### Cron e infra

- `app/api/cron/reminders/route.ts` — `GET`, `Authorization: Bearer CRON_SECRET`, query de lembretes devidos, `sendPushNotification`, `push_sent = true` (sempre após tentativa, inclusive se push falhar por VAPID ou não houver subscriptions — evita fila infinita).
- `vercel.json` — cron `* * * * *` em `/api/cron/reminders`.
- `middleware.ts` — exceção para `/api/cron`.
- `.env.example` — `CRON_SECRET`.

### Header e deep link

- `components/layout/notification-bell.tsx` — badge (atrasados + hoje), até 5 itens, “Ver todos”, `usePushNotification` na primeira abertura do menu, Realtime.
- `lib/hooks/use-realtime-reminders.ts` — canal `reminders` filtrado por `user_id`.
- `components/layout/header.tsx`, `components/layout/app-shell.tsx`, `app/(app)/layout.tsx` — prop `userId` para o sino.
- `app/(app)/leads/page.tsx` + `components/leads/leads-workspace.tsx` — `?leadId=` (UUID) abre o drawer e limpa a query com `router.replace('/leads')`.

## Decisões técnicas

1. **`push_sent`:** marcado como `true` depois de cada lembrete processado pelo cron, mesmo sem subscriptions ou com falha de envio (ex.: VAPID ausente), para não reenfileirar o mesmo registro indefinidamente.
2. **`CRON_SECRET`:** obrigatório no handler; sem variável, responde 500 (evita cron público acidental).
3. **`POST /api/push/send`:** continua protegível por `PUSH_SEND_SECRET`; o cron chama `sendPushNotification` diretamente, sem passar por essa rota.
4. **Deep link:** apenas `/leads?leadId=`; pipeline não recebe o mesmo parâmetro nesta fase.
5. **Contagem do sino:** alinhada ao PROMPT 6 (só lembretes atrasados + hoje pendentes), não inclui mensagens WhatsApp não lidas (isso consta no `IMPLEMENTATION-PLAN` 6.11 como escopo adicional).

## Pendências / operação

1. **Supabase Realtime:** habilitar a tabela `public.reminders` na publicação `supabase_realtime` (Dashboard) para o sino e listas atualizarem sem refresh.
2. **Variáveis na Vercel:** `CRON_SECRET` (igual ao projeto), `NEXT_PUBLIC_VAPID_*`, `VAPID_*`, `NEXT_PUBLIC_APP_URL` (URL absoluta nas pushes), `SUPABASE_SERVICE_ROLE_KEY` no servidor para atividades e cron/admin push.
3. **Contagem WhatsApp no sino** e **push em nova mensagem WA** (PRD / plano): fora do texto literal do PROMPT 6 item 10; podem ser uma fase ou patch posterior.

## Testes manuais sugeridos

1. Criar lembrete no drawer e na página `/reminders`; concluir e excluir; verificar atividades no lead quando service role existir.
2. Registrar push (HTTPS ou localhost conforme navegador), confirmar linha em `push_subscriptions`.
3. Simular cron local: `GET /api/cron/reminders` com header `Authorization: Bearer <CRON_SECRET>`.
4. Instalar PWA, receber push ao vencer lembrete, clicar e cair em `/leads?leadId=` com drawer aberto.
