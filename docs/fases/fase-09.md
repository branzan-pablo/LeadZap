# Fase 9 — Landing Page

**Data:** 2026-03-26
**Status:** Concluída

---

## Entregas

### 1. Composição da Landing (`app/page.tsx`)

- Substituído boilerplate Next.js pela composição de 9 seções da landing page.
- Metadata SEO completa: title, description, Open Graph e Twitter Card.
- Server Component (SSR) — página renderizada estaticamente para SEO.

### 2. Navbar (`components/landing/navbar.tsx`)

- Único Client Component da landing (scroll detection + mobile menu).
- Logo "LeadZap" com ícone Zap verde à esquerda.
- Links de navegação ao centro: Features (`#features`), Preços (`#precos`).
- CTAs à direita: "Entrar" (ghost → `/login`), "Começar grátis" (green → `/signup`).
- Sticky com `fixed top-0 z-50`. Background transparente no hero, transição para `bg-white/80 backdrop-blur-md` ao scrollar (threshold: 50px).
- Mobile: hamburger + CTA "Começar grátis" sempre visível. Menu abre via Sheet (side right).

### 3. Hero (`components/landing/hero.tsx`)

- Layout 2 colunas (3+2 em grid de 5) no desktop, 1 coluna no mobile.
- Badge: "Para quem vende pelo WhatsApp" (verde sobre green-50).
- Headline: "Pare de perder vendas no WhatsApp" (`text-4xl sm:text-5xl`).
- Sub-headline explicando a proposta de valor.
- CTA primário: "Começar grátis" (green-500) → `/signup`.
- CTA secundário: "Ver como funciona" → scroll para `#como-funciona`.
- Prova social: "Mais de 500 negócios organizando seus atendimentos".
- Visual: Pipeline mockup em CSS puro (3 colunas com cards placeholder).

### 4. Problema (`components/landing/problem-section.tsx`)

- Título: "Isso acontece no seu negócio?"
- 4 cards com ícones Lucide (MessageSquareOff, Send, BarChart3, UserX).
- Cada card: ícone, título da dor, descrição curta.
- Frase de impacto em itálico no rodapé.
- Background zinc-50 para contraste visual.

### 5. Solução (`components/landing/solution-section.tsx`)

- `id="como-funciona"` para scroll do hero.
- Título: "Simples como deveria ser".
- 3 passos numerados (badges verdes com número): Conecte WhatsApp → Leads automáticos → Organize pipeline.
- Cada passo: ícone, título, descrição.

### 6. Features (`components/landing/features-section.tsx`)

- `id="features"` para navegação.
- Grid 2x3 (desktop) → 1 coluna (mobile).
- 6 cards: Pipeline visual, WhatsApp conectado, Lembretes inteligentes, Etiquetas, Equipe organizada, Funciona no celular.
- Cada card: ícone em fundo green-50, título, descrição.
- CTA secundário abaixo: "Comece a organizar seus atendimentos" → `/signup`.

### 7. Prova Social (`components/landing/social-proof-section.tsx`)

- 3 depoimentos placeholder com dados realistas brasileiros.
- Cada card: quote, avatar (iniciais), nome e tipo de negócio.
- Nomes: Carla S. (Clínica de Estética), Ricardo M. (Loja de Roupas), Fernanda L. (Consultoria Financeira).

### 8. Preços (`components/landing/pricing-section.tsx`)

- `id="precos"` para navegação.
- 3 cards: Starter (R$29), Pro (R$59), Business (R$99).
- Pro destacado: `border-2 border-green-500` + badge "Mais popular".
- Cada card: nome, preço/mês, descrição, lista de features com checkmarks verdes, CTA.
- Nota abaixo: "Teste grátis por 7 dias. Sem cartão de crédito."

### 9. CTA Final (`components/landing/final-cta.tsx`)

- Full-width com `bg-zinc-900 text-white`.
- "Pronto para parar de perder vendas?" + sub-headline.
- CTA: "Criar minha conta grátis" (botão branco) → `/signup`.

### 10. Footer (`components/landing/footer.tsx`)

- 4 colunas: Logo+descrição, Produto, Empresa, Legal.
- Links placeholder para Sobre, Contato, Blog, Termos, Privacidade.
- Copyright: © 2026 LeadZap.

### 11. Ajustes complementares

- `app/layout.tsx`: adicionado `scroll-smooth` ao `<html>` para âncoras suaves.
- Removido stub `components/landing/landing-sections.tsx`.

---

## Decisões técnicas

| Decisão | Justificativa |
|---------|---------------|
| Apenas Navbar é Client Component | Scroll detection e Sheet requerem interatividade; demais seções são Server Components puros para SSR |
| Pipeline mockup em CSS puro | Evita dependência de imagens/screenshots; transmite a ideia visual com divs estilizados |
| Green-500 para CTAs da landing | Destaque visual (WhatsApp green) diferente do primary zinc-900 do app |
| Sem `dark:` classes | Landing é light-mode only conforme DESIGN-GUIDELINES |
| Sheet para menu mobile | Reutiliza componente shadcn existente |
| Dados de depoimentos hardcoded | Placeholder realista para lançamento; substituir por dados reais quando disponíveis |

---

## Correções de tipo pré-existentes (bonus)

- `lib/validations/settings.ts`: `required_error` → `message` (Zod v4 breaking change).
- `app/(app)/settings/pipeline/actions.ts`, `settings/team/actions.ts`, `(auth)/invite/actions.ts`: `parsed.error.errors` → `parsed.error.issues` (Zod v4).

---

## Pendências

- [ ] Substituir depoimentos placeholder por dados reais de beta testers
- [ ] Criar `/og-image.png` real para Open Graph
- [ ] Adicionar analytics (Google Analytics / Plausible) com eventos de CTA
- [ ] Links de Legal (Termos de Uso, Política de Privacidade) apontam para `#` — criar páginas reais
- [ ] Testar responsividade em dispositivos reais (375px, 768px, 1280px)
