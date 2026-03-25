# Fase 4 — Pipeline e Leads (CORE)

**Data:** 2026-03-25  
**Prompt:** `docs/PROMPTS-IMPLEMENTACAO.md` — PROMPT 4 (sessões 4a e 4b)

## Objetivo

Entregar o núcleo do produto: server actions de leads, pipeline com drag-and-drop, drawer de detalhes, tags, notas (via atividades), filtros, lista em tabela e realtime opcional — sem implementar a Fase 5 (WhatsApp/Evolution).

## Entregas

### Server Actions e dados

- `app/(app)/pipeline/actions.ts` — `createLead`, `updateLead`, `moveLead`, `deleteLead` (soft delete, admin), `addTagToLead`, `removeTagFromLead`, `createTag`, `addLeadNote`, `listLeadNotes`; validação com Zod; duplicata por telefone; estágio inicial `position = 0`; atividades gravadas com **service role** (`insertActivity`) por ausência de política RLS de INSERT em `activities` no SQL documentado.
- `app/(app)/reminders/actions.ts` — `createReminder` para o dialog do drawer.
- `lib/validations/pipeline.ts` — schemas das actions.
- `lib/mappers/lead.ts` — `toLeadView` / `LeadRowDb` para mapear join `lead_tags → tags`.
- `lib/data/org-pipeline-data.ts` — carga única de estágios, leads, tags e membros para `/pipeline` e `/leads`.

### Pipeline (UI)

- `components/pipeline/pipeline-board.tsx` — `@dnd-kit` (Pointer + Touch), `DragOverlay`, `moveLead` com toast em erro e reversão otimista.
- `components/pipeline/pipeline-column.tsx` / `pipeline-column-static.tsx` — coluna droppable + sortable vs estática quando há filtros.
- `components/pipeline/pipeline-card.tsx` — card sortable, formatação BRL e tempo curto (`formatInteractionAgo`).
- `components/pipeline/pipeline-filters.tsx` — busca, tags (multi), responsável (admin), chips e limpar.
- `components/pipeline/pipeline-workspace.tsx` — estado global de leads, filtros, drawer, realtime; com filtros ativos o drag é desligado e usa colunas estáticas (evita divergência de `position` vs servidor).

### Leads (UI)

- `components/leads/lead-drawer.tsx` — Sheet 480px, abas Dados / Mensagens (placeholder) / Notas / Atividades (placeholder), edição on blur, tags, lembrete, WhatsApp, responsável e exclusão (admin).
- `components/leads/lead-tags.tsx` — Command + criar tag (6 cores).
- `components/leads/lead-notes.tsx` — notas em `activities` (`note_added` + metadata); listagem via `listLeadNotes`.
- `components/leads/leads-workspace.tsx` — tabela ordenável + mesmos filtros + drawer.
- `app/(app)/pipeline/page.tsx` e `app/(app)/leads/page.tsx` — páginas funcionais.
- `app/(app)/leads/[id]/page.tsx` — redireciona para `/leads` (detalhe via drawer nas listas).

### Realtime e utilitários

- `lib/hooks/use-realtime-leads.ts` — canal `leads` por `organization_id` (requer Realtime habilitado no Supabase para a tabela).
- `lib/utils/phone.ts`, `lib/utils/tag-styles.ts`, `lib/utils/tag-constants.ts`, `formatInteractionAgo` em `lib/utils/formatters.ts`.
- `types/lead.ts` e `types/pipeline.ts` alinhados ao schema (incl. `is_won` / `is_lost`).

### Onboarding

- `components/onboarding/onboarding-wizard.tsx` — passo 3 chama `createLead` real em `pipeline/actions` em vez do placeholder.

## Decisões técnicas

1. **Atividades:** INSERT via `createAdminClient` após validação com o client do usuário, pois o script RLS em `DATABASE-SCHEMA.md` só define SELECT em `activities`.
2. **Filtros + drag:** com qualquer filtro ativo, o board não usa `DndContext` e mostra colunas estáticas; sem filtros, o board opera sobre a lista completa de leads para índices compatíveis com `moveLead`.
3. **Notas:** persistência em `activities` (`note_added`) em vez de append no campo `notes`, para histórico com autor e data; `last_interaction_at` do lead é atualizado.
4. **Drawer:** montado apenas quando há `selected`; ao fechar, `selected` é limpo para evitar Sheet órfão.

## Pendências / próximos passos

- Habilitar **Supabase Realtime** na tabela `public.leads` (e revisar filtros) se o canal não receber eventos.
- **RLS:** considerar política de INSERT em `activities` para o papel `authenticated` (condicionada a acesso ao lead) e remover dependência do service role nas actions, se desejado.
- Preencher **Atividades** e **Mensagens** nas abas quando as fases 5/7 entregarem dados.
- **`/leads/[id]`:** hoje só redireciona; opcional: abrir drawer via query/hash ou página de detalhe dedicada.
- **Lint:** permanecem erros de `react-hooks/set-state-in-effect` em componentes de auth anteriores (`confirm-email-client`, `reset-password-form`), fora do escopo desta fase.

## Testes manuais sugeridos

1. Onboarding: criar org e primeiro lead; verificar coluna “Novo Lead” e duplicata de telefone rejeitada.
2. Pipeline: arrastar entre colunas e dentro da mesma coluna; recarregar e conferir ordem.
3. Filtros: aplicar tag/busca/responsável e confirmar que o aviso de drag desligado aparece.
4. Drawer: editar campos, tags, nota, lembrete; admin: reatribuir e excluir.
5. `/leads`: ordenar colunas e abrir drawer pela linha.
