# Prompt mínimo por fase (LeadZap)

As regras base já estão na regra do Cursor (`.cursor/rules/leadzap-baseline.mdc`) e em `docs/instructions-initials.md` / `docs/ARCHITECTURE.md`. **Cole só o bloco abaixo** e troque `N` / anexos opcionais.

---

## Fase N — [nome curto]

Execute **apenas** a **Fase N** do plano. Não implemente fases posteriores.

**Documentação desta fase (ler nesta ordem):**

1. `docs/PROMPTS-IMPLEMENTACAO.md` — seção **PROMPT N — Fase N**, tarefas na ordem.
2. Trechos relevantes de `docs/PRD.md` [opcional: indicar módulo, ex. Onboarding].
3. `docs/DATABASE-SCHEMA.md` [opcional: indicar tabelas, ex. organizations, users].

**Ao terminar:** atualizar `docs/fases/fase-NN.md` (entregas, decisões, pendências).

---

### Exemplo (Fase 3)

```text
## Fase 3 — Onboarding e layout

Execute apenas a Fase 3. Não implemente a Fase 4.

Documentação:
1. docs/PROMPTS-IMPLEMENTACAO.md — PROMPT 3 (tarefas na ordem).
2. docs/PRD.md — módulo Onboarding.
3. docs/DATABASE-SCHEMA.md — organizations, users.

Ao terminar: docs/fases/fase-03.md
```
