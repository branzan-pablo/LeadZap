# Fase 7 — Uploads e Activity Log

**Data:** 2026-03-26
**Status:** Concluída

---

## Entregas

### 1. Server Actions de Attachments (`app/(app)/pipeline/actions.ts`)

- **`uploadAttachment(formData)`** — Recebe FormData com file + leadId. Valida MIME type (image/jpeg, image/png, image/webp, application/pdf), tamanho (max 5MB), e contagem de anexos por lead (max 5). Faz upload para Supabase Storage no path `org_{orgId}/leads/{leadId}/{timestamp}_{fileName}` e cria registro na tabela `attachments`. Registra atividade `attachment_added`.
- **`deleteAttachment({attachmentId, leadId})`** — Remove arquivo do Storage e registro do banco. Apenas quem fez upload ou admin pode remover. Registra atividade `attachment_removed`.
- **`getAttachmentSignedUrl(attachmentId)`** — Gera URL assinada (5 min) para download seguro do arquivo.
- **`listAttachments(leadId)`** — Lista todos os anexos de um lead, ordenados por data DESC.
- Tipo `AttachmentView` exportado para uso nos componentes.

### 2. Componente LeadAttachments (`components/leads/lead-attachments.tsx`)

- Lista de arquivos com ícone (imagem vs PDF), nome, tamanho formatado.
- Click no arquivo gera signed URL e abre em nova aba (download).
- Botão de remover visível apenas para quem fez upload ou admin.
- Botão "Adicionar arquivo" com input file oculto (`accept` restrito).
- Validação client-side de tipo MIME e tamanho antes do envio.
- Estado de loading (spinner) durante upload.
- Mensagem quando limite de 5 anexos atingido.

### 3. Componente LeadActivity (`components/leads/lead-activity.tsx`)

- Timeline visual com linha vertical e dots coloridos por tipo de atividade.
- Busca atividades do lead + nomes dos usuários (batch de IDs únicos).
- 13 tipos de atividade suportados com ícones Lucide e cores específicas:
  - `lead_created` (Plus, verde)
  - `lead_updated` (Pencil, zinc)
  - `lead_moved` (ArrowRight, azul) — exibe "de X para Y"
  - `lead_assigned` (UserPlus, azul)
  - `lead_deleted` (Trash2, vermelho)
  - `note_added` (MessageSquare, zinc)
  - `tag_added` / `tag_removed` (Tag, zinc) — exibe nome da tag
  - `reminder_created` / `reminder_completed` (Bell, amber) — exibe título
  - `attachment_added` / `attachment_removed` (Paperclip, zinc) — exibe nome do arquivo
  - `message_received` (MessageCircle, verde)
- Limite de 50 atividades mais recentes.
- Timestamps relativos via `formatRelativeTime`.

### 4. Integração no Lead Drawer (`components/leads/lead-drawer.tsx`)

- Seção "Anexos" no tab Dados agora renderiza `<LeadAttachments>` em vez do placeholder.
- Tab "Atividades" agora renderiza `<LeadActivity>` em vez do placeholder.
- Nova prop `userId` adicionada ao `LeadDrawerProps`.

### 5. Propagação de userId

- `OrgPipelineData` agora inclui `userId` (de `user.id` do Supabase Auth).
- `PipelineWorkspace` e `LeadsWorkspace` recebem e propagam `userId`.
- Páginas `/pipeline` e `/leads` passam `data.userId` para os workspaces.

### 6. Revisão de Activity Logging

- Metadados de `moveLead` atualizados para usar `from_stage_name` / `to_stage_name` (alinhado com spec).
- `ActivityType` expandido com todos os 13 tipos do schema.
- Todas as actions existentes já registravam atividades corretamente. Confirmado:
  - `createLead` → `lead_created`
  - `updateLead` → `lead_updated`
  - `moveLead` → `lead_moved`
  - `deleteLead` → `lead_deleted`
  - `addTagToLead` → `tag_added`
  - `removeTagFromLead` → `tag_removed`
  - `addLeadNote` → `note_added`
  - `createReminder` → `reminder_created`
  - `completeReminder` → `reminder_completed`
  - Webhook handler → `message_received`

---

## Decisoes Tecnicas

1. **Upload via admin client** — O upload para Supabase Storage usa o `createAdminClient()` (service_role) no server action, evitando a necessidade de configurar Storage RLS policies complexas. A validação de acesso é feita no server action antes do upload.

2. **Signed URLs para download** — Em vez de tornar o bucket público, cada download gera uma URL assinada com expiração de 5 minutos via `createSignedUrl()`.

3. **Sanitização de nome de arquivo** — Nomes são prefixados com timestamp e caracteres especiais são substituídos por `_` para evitar problemas de path no Storage.

4. **Rollback em caso de falha** — Se o insert no banco falhar após o upload no Storage, o arquivo é removido do Storage para evitar orphans.

5. **Batch de user names no Activity** — O componente de atividades coleta user IDs únicos e faz uma única query para buscar nomes, evitando N+1 queries.

6. **Lazy import de uploadAttachment** — No componente de upload, a action é importada dinamicamente para evitar que o bundle inicial do componente carregue o módulo server actions.

---

## Configuracao Supabase (Manual)

O bucket `attachments` precisa ser criado no Supabase Dashboard:

```
Bucket name: attachments
Public: false
File size limit: 5242880 (5MB)
Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
```

Como as operacoes de Storage sao feitas via admin client (service_role), nao e necessario configurar Storage RLS policies adicionais no MVP.

---

## Arquivos Criados/Modificados

### Criados
- (nenhum arquivo novo — componentes existiam como stubs)

### Modificados
- `app/(app)/pipeline/actions.ts` — Server actions de attachment + tipos expandidos
- `components/leads/lead-attachments.tsx` — Componente completo (era stub)
- `components/leads/lead-activity.tsx` — Componente completo (era stub)
- `components/leads/lead-drawer.tsx` — Integracao + prop userId
- `components/pipeline/pipeline-workspace.tsx` — Prop userId
- `components/leads/leads-workspace.tsx` — Prop userId
- `app/(app)/pipeline/page.tsx` — Passa userId
- `app/(app)/leads/page.tsx` — Passa userId
- `lib/data/org-pipeline-data.ts` — Retorna userId
- `docs/fases/fase-07.md` — Este arquivo

---

## Pendencias

- **Criar bucket `attachments` no Supabase Dashboard** — configuracao manual necessaria (ver secao acima).
- **Storage RLS policies** — Atualmente o upload/download usa admin client. Se no futuro quisermos permitir upload direto do client, sera necessario configurar policies no bucket.
- **Testes** — Nenhum teste automatizado foi adicionado nesta fase.
