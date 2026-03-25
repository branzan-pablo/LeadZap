# Documentação por fase — LeadZap

Esta pasta concentra **resumos de fase** do desenvolvimento: entregas, decisões técnicas e pendências, para rastreabilidade do progresso.

## Convenção de nomes

| Arquivo      | Conteúdo                                      |
|-------------|-----------------------------------------------|
| `fase-01.md` | Resumo da Fase 1 (Setup e infraestrutura)     |
| `fase-02.md` | Resumo da Fase 2 (Auth e perfil — conforme plano) |
| `fase-NN.md` | Próximas fases, na ordem do `IMPLEMENTATION-PLAN.md` |

Numeração com **dois dígitos** (`01`, `02`, …) para ordenação estável em listagens de arquivos.

## Relação com o plano mestre

A ordem e o escopo das fases seguem:

- `docs/IMPLEMENTATION-PLAN.md` — visão macro e tarefas numeradas  
- `docs/PROMPTS-IMPLEMENTACAO.md` — prompts detalhados por sessão  

Cada `fase-NN.md` deve ser atualizado **ao término da respectiva fase**, com data no cabeçalho quando possível.

## Como usar

1. Ao **concluir** uma fase, criar ou atualizar o arquivo `fase-NN.md` correspondente.  
2. Incluir sempre: objetivo da fase, entregas (arquivos/áreas), decisões técnicas, pendências e testes manuais sugeridos.  
3. Não substituir a documentação de produto (`PRD.md`, `ARCHITECTURE.md`, etc.) — estes arquivos são **histórico de execução**, não especificação.
