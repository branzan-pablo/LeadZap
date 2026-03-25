# Fase 02 — Auth e perfil de usuário

**Status:** concluída (fluxo de autenticação; perfil editável no app permanece para fases de layout/settings)  
**Referência:** `docs/IMPLEMENTATION-PLAN.md` (Fase 2), `docs/PROMPTS-IMPLEMENTACAO.md` (PROMPT 2)

## Objetivo

Implementar autenticação com **Supabase Auth** (email + senha): cadastro, login, confirmação de email, recuperação e redefinição de senha, com validação **Zod**, UI alinhada ao **DESIGN-GUIDELINES** e **sem** criar registro manual na tabela `public.users` (uso do trigger `handle_new_user` no Supabase).

## Escopo entregue

### Layout de autenticação

- `app/(auth)/layout.tsx` — página centralizada, fundo branco, **Card** (`max-width: 400px`), título **LeadZap** no topo, conteúdo das páginas filhas no corpo do card.

### Cadastro (`/signup`)

- `app/(auth)/signup/page.tsx` + `components/auth/signup-form.tsx`.
- Campos: nome completo, email, senha (mín. 8 caracteres), confirmar senha.
- `supabase.auth.signUp` com `options.data: { full_name }` para metadata.
- `emailRedirectTo` para `{NEXT_PUBLIC_APP_URL}/confirm` quando a variável está definida.
- Após sucesso: mensagem para verificar o email (sem redirect automático para dentro do app logado).
- Link “Já tem conta? Entrar”.
- Erro de email duplicado mapeado para mensagem alinhada ao PRD quando a API indica usuário já registrado.

### Login (`/login`)

- `app/(auth)/login/page.tsx` + `components/auth/login-form.tsx`.
- Campos: email, senha; `signInWithPassword`.
- Erro genérico de credenciais: **“Email ou senha incorretos”**.
- Sucesso: `router.push('/pipeline')` + `router.refresh()` (middleware encaminha para `/onboarding` se aplicável).
- Links: cadastro, esqueci a senha (no bloco da senha).
- Query `?confirmed=1`: banner “Email confirmado. Faça login para continuar.”
- Query `?session=expired`: aviso de sessão expirada (compatível com edge case do PRD).

### Confirmação de email (`/confirm`)

- `app/(auth)/confirm/page.tsx` + `components/auth/confirm-email-client.tsx`.
- Leitura do parâmetro `code` na URL; `exchangeCodeForSession` no **browser client** para persistir cookies corretamente.
- Sucesso: `signOut` e `router.replace('/login?confirmed=1')` para o usuário ver a mensagem no login sem ser redirecionado imediatamente ao app pelo middleware.
- Estados de carregamento e erro com copy em português; links para signup e login em caso de falha.

### Recuperação de senha (`/forgot-password`)

- `app/(auth)/forgot-password/page.tsx` + `components/auth/forgot-password-form.tsx`.
- `resetPasswordForEmail` com `redirectTo` apontando para `/reset-password` quando `NEXT_PUBLIC_APP_URL` existe.
- Mensagem após envio: **“Se esse email estiver cadastrado, você receberá um link…”** (não revela existência do email).

### Redefinição de senha (`/reset-password`)

- `app/(auth)/reset-password/page.tsx` + `components/auth/reset-password-form.tsx`.
- Troca de `code` por sessão (`exchangeCodeForSession`), depois formulário nova senha + confirmação.
- `updateUser({ password })`, em seguida `signOut` e redirect para `/login`.

### Validação compartilhada

- `lib/validations/auth.ts` — schemas Zod reutilizáveis e tipos inferidos (`SignupFormValues`, etc.).
- Reuso de `emailSchema` de `lib/utils/validators.ts` onde aplicável.

### Dependências npm adicionadas nesta fase

- `react-hook-form`, `@hookform/resolvers` — formulários com resolução Zod.

### UI (shadcn)

- Uso de **Field** / **FieldLabel** / **FieldError** / **FieldGroup** (`components/ui/field.tsx`, adicionado via CLI shadcn), **Input**, **Button**, **Card**.
- Botões em loading: desabilitados + ícone `Loader2` (Lucide) com animação.
- Erros de campo via componente de erro (texto destructive).

## Decisões técnicas

| Decisão | Motivo |
|--------|--------|
| **Client Components** para confirm e reset (troca de `code`) | Garantir que cookies de sessão sejam gravados no navegador; em RSC o `setAll` de cookies pode ser ignorado em alguns contextos. |
| **Field + Controller** em vez de pacote `form.tsx` clássico | Registry shadcn “base-nova” prioriza primitivos `Field`; mantém alinhamento com o que o projeto já usa. |
| **`signOut` após confirmação de email** | Permite exibir a mensagem em `/login` sem sessão ativa; caso contrário o middleware redirecionaria usuário autenticado para `/pipeline` e a mensagem não apareceria. |
| **Suspense** em `/confirm` e `/reset-password` | Requisito do Next para `useSearchParams` em árvores que podem ser pré-renderizadas. |

## O que não entra nesta fase (conforme plano)

- Página dedicada de **edição de perfil** (nome, avatar, etc.) no app autenticado — prevista indiretamente no layout/header (PROMPT 3 / settings).
- Fluxo completo **`/invite/[token]`** — permanece escopo da Fase 8; arquivo pode existir como placeholder da Fase 1.

## Pendências e checklist operacional

- [ ] **Supabase Dashboard:** URL site, redirect URLs (`/confirm`, `/reset-password`), template de email e fluxo PKCE com query `code`.
- [ ] **`NEXT_PUBLIC_APP_URL`** definido em produção e igual ao domínio dos links de email.
- [ ] Teste manual: cadastro → email → confirmar → login → verificar linha em `public.users` (trigger `handle_new_user`).
- [ ] Teste manual: esqueci senha → link → nova senha → login.
- [ ] Opcional: alinhar fluxo pós-confirmação ao PRD (ir direto para onboarding com sessão) se o produto priorizar isso em relação ao PROMPT 2.

## Arquivos tocados (referência rápida)

- `app/(auth)/layout.tsx`, `login/page.tsx`, `signup/page.tsx`, `confirm/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`
- `components/auth/*` (formulários e cliente de confirmação)
- `lib/validations/auth.ts`
- `components/ui/field.tsx` (+ possíveis ajustes em `label` / `separator` via shadcn)
- `package.json` / lockfile — `react-hook-form`, `@hookform/resolvers`

---

*Documento gerado para rastreabilidade da Fase 2; manter atualizado se o fluxo de auth for alterado.*
