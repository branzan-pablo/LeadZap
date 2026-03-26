# Fase 8 — Gestão de Equipe

**Data:** 2026-03-26
**Status:** Concluída

---

## Entregas

### 1. Validações Zod (`lib/validations/settings.ts`)

- Schemas para todas as operações da fase: `inviteMemberSchema`, `revokeInviteSchema`, `removeMemberSchema`, `updateOrgNameSchema`, `updateStageNameSchema`, `addStageSchema`, `reorderStagesSchema`, `deleteStageSchema`, `acceptInviteSignupSchema`, `acceptInviteLoginSchema`.
- Reutiliza `emailSchema` de `lib/utils/validators.ts`.
- Types inferidos exportados para uso nos componentes.

### 2. Types (`types/settings.ts`)

- `MemberView` — id, full_name, email, role, avatar_url, created_at.
- `InviteView` — id, email, role, token, created_at, expires_at.

### 3. Server Actions — Team (`app/(app)/settings/team/actions.ts`)

- **`inviteMember`** — Valida email/role, verifica se email já pertence à org, verifica limite de usuários do plano (membros + convites pendentes vs max_users), insere convite via admin client, retorna token para copiar link.
- **`revokeInvite`** — Deleta convite pendente (accepted_at IS NULL) da org.
- **`removeMember`** — Remove membro da org (set organization_id = null, role = 'user'). Bloqueia auto-remoção.
- **`updateOrgName`** — Atualiza nome da organização (mantém slug inalterado).
- Todas as ações requerem role admin via `requireAdminContext()`.

### 4. Server Actions — Pipeline Config (`app/(app)/settings/pipeline/actions.ts`)

- **`updateStageName`** — Renomeia etapa do pipeline.
- **`addStage`** — Adiciona nova etapa (max 7), posição = max + 1, is_default = false.
- **`reorderStages`** — Recebe array de IDs na nova ordem, atualiza posições via admin client (duas passadas para evitar conflito de unique constraint).
- **`deleteStage`** — Deleta etapa customizada (is_default = false) sem leads vinculados.

### 5. Server Actions — Invite Accept (`app/(auth)/invite/actions.ts`)

- **`acceptInviteNewUser`** — Valida convite (token, expiração, aceite), cria conta via signUp, atualiza profile com org_id/role/onboarding_completed via admin client, marca convite como aceito, faz sign in.
- **`acceptInviteExistingUser`** — Valida convite, faz sign in com credenciais, atualiza profile com nova org_id/role, marca convite como aceito.
- Usa admin client para todas as operações pois o usuário pode não estar autenticado.

### 6. Settings Hub (`app/(app)/settings/page.tsx`)

- Server Component com dados da org (nome, plano).
- `OrgNameEditor` — componente client inline para editar nome da org (hover para revelar ícone de edição, Enter para salvar, Escape para cancelar).
- Badge com nome do plano.
- 3 cards de navegação: Equipe, Pipeline, WhatsApp (com ícones e descrições).

### 7. Team Page (`app/(app)/settings/team/page.tsx`)

- Server Component que busca membros, convites pendentes e info da org via admin client.
- Header com título "Equipe" e badge de contagem "N/M membros".
- Compõe `<InviteForm>` e `<TeamMembers>`.

### 8. TeamMembers (`components/settings/team-members.tsx`)

- Client Component com Table: Avatar + Nome, Email, Role (Badge), Data entrada, Ações.
- Botão "Remover" com Dialog de confirmação para membros que não são o próprio usuário.
- Loading states com `useTransition`.

### 9. InviteForm (`components/settings/invite-form.tsx`)

- Botão "Convidar membro" que abre Dialog com form (email + role select via react-hook-form + zod).
- Lista de convites pendentes com email, role badge, data, botão copiar link, botão revogar.
- Desabilita convite quando limite de usuários atingido.
- Ao convidar com sucesso, copia link do convite para clipboard automaticamente.

### 10. Invite Page (`app/(auth)/invite/[token]/page.tsx`)

- Server Component que resolve estado do convite via admin client:
  - Token inválido → mensagem de erro.
  - Expirado → "Este convite expirou. Peça um novo ao administrador."
  - Já aceito → "Este convite já foi utilizado."
  - Válido + email já existe em users → `<InviteAcceptExisting>` (form de login).
  - Válido + email novo → `<InviteAcceptSignup>` (form de cadastro).

### 11. InviteAcceptForm (`components/auth/invite-accept-form.tsx`)

- `InviteAcceptExisting` — Email readonly + senha, chama `acceptInviteExistingUser`, redireciona para /pipeline.
- `InviteAcceptSignup` — Email readonly + nome + senha + confirmar senha, chama `acceptInviteNewUser`, redireciona para /pipeline.
- Segue padrão visual de `signup-form.tsx`.

### 12. Pipeline Config Page (`app/(app)/settings/pipeline/page.tsx`)

- Server Component que busca stages da org.
- Compõe `<PipelineConfig>`.

### 13. PipelineConfig (`components/settings/pipeline-config.tsx`)

- Client Component com @dnd-kit vertical sortable list.
- Cada row: drag handle (GripVertical), input editável (nome), badges (Padrão/Ganho/Perdido), botão deletar (para etapas customizadas).
- Rename on blur via `updateStageName`.
- Reorder on drag end via `reorderStages` (otimista).
- Dialog "Adicionar etapa" (max 7).
- Botão deletar verifica is_default e leads vinculados no servidor.

---

## Decisões Técnicas

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Email de convite | MVP sem envio automático | Admin copia link. Envio automático pode ser adicionado depois via Supabase Edge Functions ou SMTP. |
| Slug da org | Não atualiza ao renomear | Evita quebrar referências existentes. |
| Reorder stages | Duas passadas (offset alto → posição final) | Evita conflito de unique constraint em (org_id, position). |
| Contagem de limite | Membros + convites pendentes | Convites pendentes reservam slots para evitar over-invite. |
| Invite accept | Admin client para tudo | Usuário pode não estar autenticado; RLS não permite acesso público a invites. |
| onboarding_completed no aceite | Set true automaticamente | Convidados não precisam do wizard pois entram em org existente. |

---

## Arquivos Criados/Modificados

### Criados
- `lib/validations/settings.ts`
- `types/settings.ts`
- `app/(app)/settings/team/actions.ts`
- `app/(app)/settings/pipeline/actions.ts`
- `app/(auth)/invite/actions.ts`
- `components/settings/org-name-editor.tsx`
- `components/auth/invite-accept-form.tsx`
- `docs/fases/fase-08.md`

### Modificados
- `app/(app)/settings/page.tsx`
- `app/(app)/settings/team/page.tsx`
- `app/(app)/settings/pipeline/page.tsx`
- `app/(auth)/invite/[token]/page.tsx`
- `components/settings/team-members.tsx`
- `components/settings/invite-form.tsx`
- `components/settings/pipeline-config.tsx`

---

## Pendências

- **Email de convite automático** — Atualmente o admin precisa copiar e compartilhar o link manualmente. Para produção, integrar envio de email via Supabase ou serviço externo.
- **WhatsApp Connection component** — `components/settings/whatsapp-connection.tsx` ainda retorna null (já implementado como `components/whatsapp/whatsapp-connect-panel.tsx` na fase 5; placeholder pode ser removido ou reutilizado).
