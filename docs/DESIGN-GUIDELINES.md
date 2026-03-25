# DESIGN-GUIDELINES — LeadZap

## Filosofia de Design

Clean, moderno, light mode. O produto é usado o dia inteiro por pessoas com baixa maturidade digital — cada pixel deve servir a uma função. Zero decoração sem propósito. Informação densa mas legível. Interações rápidas e com feedback imediato.

---

## Paleta de Cores

### Cores Primárias

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#18181B` (zinc-900) | Botões primários, texto de ênfase, sidebar ativa |
| `--color-primary-foreground` | `#FAFAFA` (zinc-50) | Texto sobre primary |
| `--color-secondary` | `#F4F4F5` (zinc-100) | Botões secundários, backgrounds de hover |
| `--color-secondary-foreground` | `#18181B` (zinc-900) | Texto sobre secondary |
| `--color-accent` | `#22C55E` (green-500) | WhatsApp, sucesso, ações positivas, indicador de conexão |
| `--color-accent-foreground` | `#FFFFFF` | Texto sobre accent |

### Cores de Superfície

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-background` | `#FFFFFF` | Background da aplicação |
| `--color-surface` | `#FAFAFA` (zinc-50) | Cards, sidebar, áreas elevadas |
| `--color-border` | `#E4E4E7` (zinc-200) | Bordas de cards, inputs, separadores |
| `--color-border-hover` | `#D4D4D8` (zinc-300) | Bordas em estado hover |
| `--color-ring` | `#18181B` (zinc-900) | Focus ring em inputs e botões |

### Cores de Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-text-primary` | `#18181B` (zinc-900) | Texto principal, headings |
| `--color-text-secondary` | `#52525B` (zinc-600) | Texto descritivo, subtítulos |
| `--color-text-muted` | `#A1A1AA` (zinc-400) | Texto auxiliar, placeholders, timestamps |

### Cores de Estado

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-success` | `#22C55E` (green-500) | WhatsApp conectado, deal fechado, ação positiva |
| `--color-warning` | `#F59E0B` (amber-500) | Lembretes próximos, atenção necessária |
| `--color-error` | `#EF4444` (red-500) | Erros, desconectado, leads perdidos |
| `--color-info` | `#3B82F6` (blue-500) | Informações, links, indicadores neutros |

### Cores de Tags (fixas para tags padrão)

| Tag | Background | Text |
|-----|-----------|------|
| Quente | `#FEE2E2` (red-100) | `#DC2626` (red-600) |
| Frio | `#DBEAFE` (blue-100) | `#2563EB` (blue-600) |
| Indeciso | `#FEF3C7` (amber-100) | `#D97706` (amber-600) |
| VIP | `#EDE9FE` (violet-100) | `#7C3AED` (violet-600) |

---

## Tipografia

### Font Family

| Tipo | Font | Fallback | Uso |
|------|------|----------|-----|
| Display (headings) | **Inter** | system-ui, -apple-system, sans-serif | Títulos, headings, valores numéricos de destaque |
| Body | **Inter** | system-ui, -apple-system, sans-serif | Todo texto do corpo, labels, inputs |

Inter é usada em ambos para manter simplicidade. Carregada via `next/font/google` com subsets `['latin']`.

### Escala de Tamanhos

| Token | Tamanho | Line height | Uso |
|-------|---------|-------------|-----|
| `xs` | 12px / 0.75rem | 16px | Badges, captions, timestamps |
| `sm` | 14px / 0.875rem | 20px | Labels, texto auxiliar, botões small |
| `base` | 16px / 1rem | 24px | Corpo de texto, inputs, botões default |
| `lg` | 18px / 1.125rem | 28px | Subtítulos, títulos de seção |
| `xl` | 20px / 1.25rem | 28px | Títulos de página |
| `2xl` | 24px / 1.5rem | 32px | Títulos de seção na landing |
| `3xl` | 30px / 1.875rem | 36px | Hero subtitle na landing |
| `4xl` | 36px / 2.25rem | 40px | Hero headline na landing |

### Pesos

| Tipo de texto | Weight | Uso |
|--------------|--------|-----|
| Headings | `600` (semibold) | Títulos de página, seções, cards |
| Subheadings | `500` (medium) | Subtítulos, nomes de colunas do pipeline |
| Body | `400` (regular) | Texto corrido, descrições |
| Labels | `500` (medium) | Labels de formulário, headers de tabela |
| Captions | `400` (regular) | Timestamps, texto muted |
| Numbers | `600` (semibold) | Contadores de valor (R$), badges numéricos |

---

## Espaçamento

Escala base de 4px:

| Token | Valor | Uso |
|-------|-------|-----|
| `1` | 4px | Micro ajustes, gap entre ícone e texto |
| `2` | 8px | Padding interno de badges, gap entre items inline |
| `3` | 12px | Padding de inputs (vertical), gap de form fields |
| `4` | 16px | Padding de cards, gap entre seções internas |
| `5` | 20px | — |
| `6` | 24px | Padding de página em mobile, gap entre cards |
| `8` | 32px | Gap entre seções de uma página |
| `10` | 40px | — |
| `12` | 48px | Padding horizontal de página em desktop |
| `16` | 64px | Gap entre seções da landing page |
| `24` | 96px | Padding vertical de seções da landing |

---

## Border Radius

| Contexto | Valor | Tailwind |
|----------|-------|----------|
| Botões | 8px | `rounded-lg` |
| Cards | 12px | `rounded-xl` |
| Inputs | 8px | `rounded-lg` |
| Badges / Tags | 6px | `rounded-md` |
| Avatares | 9999px | `rounded-full` |
| Modais / Dialogs | 16px | `rounded-2xl` |
| Tooltips | 8px | `rounded-lg` |
| Pipeline cards | 8px | `rounded-lg` |

---

## Sombras

Uso mínimo de sombras. O design se apoia em bordas e backgrounds.

| Nível | Valor | Uso |
|-------|-------|-----|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards no pipeline, dropdowns |
| `md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Dialogs, drawers, popovers |
| `lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Drag overlay (card sendo arrastado) |

---

## Mapeamento shadcn/ui

| Caso de uso | Componente shadcn | Notas |
|-------------|-------------------|-------|
| Formulários | `Form` + `Input` + `Label` + `Select` + `Textarea` | Validação com Zod via react-hook-form |
| Botões | `Button` | Variants: default (primary), secondary, outline, ghost, destructive |
| Tabelas de dados | `Table` (shadcn) | Para lista de leads e membros. Sem TanStack Table no MVP — complexidade desnecessária. |
| Pipeline cards | Custom component | Não usar shadcn Card — card do pipeline é componente customizado com @dnd-kit |
| Modais | `Dialog` | Para: criar lead, criar lembrete, convidar membro |
| Drawer lateral | `Sheet` | Para: detalhe do lead. Side: right. Size: 480px em desktop, fullscreen em mobile. |
| Notificações/Toasts | `Sonner` (toast) | Para feedback de ações: sucesso, erro. Position: bottom-right. |
| Dropdowns | `DropdownMenu` | Para: menu de perfil no header, ações no card do pipeline |
| Badges | `Badge` | Para: tags de leads, status de conexão WhatsApp, contadores |
| Date picker | `Popover` + `Calendar` | Para: seleção de data nos lembretes |
| Tabs | `Tabs` | Para: tabs no drawer do lead (Dados, Mensagens, Notas, Atividades) |
| Tooltip | `Tooltip` | Para: ícones de ação, informações adicionais |
| Separadores | `Separator` | Para: divisões visuais no drawer, settings |
| Avatar | `Avatar` | Para: membro da equipe no header, depoimentos na landing |
| Command | `Command` | Para: busca global de leads (se implementada) |

---

## Referências Visuais

Estes sites capturam o estilo desejado para o LeadZap:

1. **Linear** (linear.app) — Pipeline/board visual, cards limpos, UI densa mas legível, sidebar minimal.
2. **Vercel Dashboard** (vercel.com/dashboard) — Tipografia Inter, uso de preto/branco/zinc, cards com borda sutil.
3. **Resend** (resend.com) — Landing page clean, seções espaçadas, CTAs diretos.
4. **Raycast** (raycast.com) — Interações rápidas, design sem fricção, keyboard-first (inspiração, não prioridade no MVP).
5. **Attio** (attio.com) — CRM moderno com estética clean. Pipeline visual como referência direta.

---

## O que Evitar

- **Gradientes coloridos ou neon.** O visual é flat e sóbrio. A cor accent (verde WhatsApp) é a única cor vibrante.
- **Bordas arredondadas excessivas** (ex: `rounded-3xl` em tudo). Manter nos valores definidos.
- **Sombras pesadas.** Quase tudo usa borda, não sombra.
- **Ícones decorativos.** Cada ícone deve ter função. Usar Lucide React para consistência.
- **Animações pesadas.** Transições sutis em hover/focus (150ms ease). Sem parallax, sem scroll animations na landing (exceto fade-in simples se desejado).
- **Fontes decorativas.** Apenas Inter. Sem fontes serifadas ou display fonts.
- **Dark mode.** Fora do escopo. Apenas light mode.
- **Excesso de cores.** A paleta é deliberadamente restrita. Quase tudo é zinc + branco + verde accent.
- **Texto centralizado em blocos longos.** Texto sempre alinhado à esquerda no app. Centralizado apenas em títulos de seção da landing e CTAs.
- **Cards com muita elevação.** Cards do pipeline têm borda sutil e sombra mínima. Elevação só no drag overlay.
