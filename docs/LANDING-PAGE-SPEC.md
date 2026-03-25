# LANDING-PAGE-SPEC — LeadZap

## Objetivo da Página

Converter visitantes em cadastros gratuitos. O CTA principal é "Criar conta grátis" (leva para `/signup`). Público-alvo: donos e gerentes de pequenos negócios que vendem via WhatsApp. Tom: direto, urgente, empático. Nunca usar a palavra "CRM".

---

## Seções em Ordem

### 1. Navbar

- **Objetivo:** Navegação mínima e acesso rápido ao CTA.
- **Layout:** Logo à esquerda. Links de navegação ao centro (Features, Preços). Botão "Entrar" (ghost/outline) e "Começar grátis" (primary) à direita.
- **Responsividade mobile:** Hamburger menu. CTA "Começar grátis" sempre visível.
- **Comportamento:** Sticky no topo. Background transparente no hero, ganha background sólido ao scrollar.

### 2. Hero

- **Objetivo:** Capturar atenção em 3 segundos. Comunicar a dor e a solução em uma frase.
- **Layout:** Duas colunas em desktop. Texto à esquerda (60%), visual à direita (40%). Uma coluna em mobile (texto acima, visual abaixo).
- **Elementos:**
  - Badge/chip no topo: "Para quem vende pelo WhatsApp"
  - Headline principal: foco na dor → "Pare de perder vendas no WhatsApp"
  - Sub-headline: 1 linha explicando a solução → organizar leads, acompanhar negociações, não esquecer nenhum cliente
  - CTA primário: "Começar grátis" (botão grande, cor primária)
  - CTA secundário: "Ver como funciona" (link/text button, scroll para seção de features)
  - Prova social mínima: "Mais de X negócios organizando seus atendimentos" (pode ser placeholder no início)
- **Visual à direita:** Mockup/screenshot do pipeline com cards de leads. Deve transmitir simplicidade.

### 3. Problema (Dor)

- **Objetivo:** Gerar identificação. O visitante deve pensar "isso acontece comigo".
- **Layout:** Centralizado, texto + ícones. 3-4 cards/items lado a lado em desktop, empilhados em mobile.
- **Elementos:**
  - Título da seção: "Isso acontece no seu negócio?"
  - 3-4 situações reais com ícone + texto curto:
    - Lead mandou mensagem e ninguém respondeu
    - Proposta enviada mas ninguém fez follow-up
    - Não sabe quantos negócios estão abertos agora
    - Vendedor diz que atendeu, mas não tem como verificar
  - Frase de impacto: "Cada cliente esquecido é dinheiro que você deixou na mesa."

### 4. Solução (Como funciona)

- **Objetivo:** Mostrar que a ferramenta é simples e resolve os problemas listados acima.
- **Layout:** 3 passos numerados (1, 2, 3) em sequência horizontal (desktop) ou vertical (mobile). Cada passo com ilustração/mockup.
- **Elementos:**
  - Título: "Simples como deveria ser"
  - Passo 1: "Conecte seu WhatsApp" — Sub-texto: Escaneie o QR code e pronto. Visual: mockup da tela de QR code.
  - Passo 2: "Leads entram automaticamente" — Sub-texto: Cada mensagem nova vira um lead no seu pipeline. Visual: mockup de lead sendo criado.
  - Passo 3: "Organize e não perca nenhum" — Sub-texto: Mova leads no pipeline, crie lembretes, acompanhe tudo. Visual: mockup do pipeline com drag.

### 5. Features

- **Objetivo:** Detalhar as funcionalidades sem parecer lista de CRM.
- **Layout:** Grid 2x3 em desktop, 1 coluna em mobile. Cada feature em card com ícone, título curto e 1-2 linhas de descrição.
- **Elementos (6 features):**
  - **Pipeline visual:** Veja todos os seus negócios organizados por etapa. Mova com um toque.
  - **WhatsApp conectado:** Mensagens chegam automaticamente. Leia o histórico sem sair da ferramenta.
  - **Lembretes inteligentes:** Crie lembretes e receba notificação na hora certa. Nunca mais esqueça um follow-up.
  - **Etiquetas:** Classifique leads: quente, frio, VIP. Filtre e encontre rápido.
  - **Equipe organizada:** Cada vendedor com seus leads. Gestor com visão de tudo.
  - **Funciona no celular:** Instale no seu celular como app. Use de qualquer lugar.
- **CTA secundário abaixo:** "Comece a organizar seus atendimentos" → link para `/signup`.

### 6. Prova Social

- **Objetivo:** Gerar confiança. Mostrar que outros negócios similares usam e gostam.
- **Layout:** Carousel ou grid de 3 depoimentos em desktop. Um por vez em mobile.
- **Elementos:**
  - 3 depoimentos (no lançamento, podem ser de beta testers ou placeholder):
    - Avatar (foto ou iniciais)
    - Nome e profissão/negócio (ex: "Carla S., Clínica de Estética")
    - Quote curta (2-3 linhas)
  - Se não houver depoimentos reais, usar seção de "empresas que confiam" com logos placeholder ou omitir até ter dados.

### 7. Preços

- **Objetivo:** Transparência. O visitante deve saber o custo antes de cadastrar.
- **Layout:** 3 cards de preço lado a lado em desktop. Empilhados em mobile. Card do meio (recomendado) destacado.
- **Elementos por card:**
  - Nome do plano: Starter / Pro / Business
  - Preço: R$29 / R$59 / R$99 por mês
  - Descrição curta: 1 frase sobre para quem é
  - Lista de includes (check marks):
    - Starter: 1 usuário, pipeline visual, WhatsApp conectado, lembretes, 50 leads
    - Pro: até 3 usuários, tudo do Starter, sem limite de leads, filtros avançados
    - Business: usuários ilimitados, tudo do Pro, prioridade no suporte
  - CTA em cada card: "Começar grátis" (todos levam para `/signup`, plano é escolhido depois)
  - Badge "Mais popular" no plano Pro
- **Nota abaixo:** "Teste grátis por 7 dias. Sem cartão de crédito."

### 8. CTA Final

- **Objetivo:** Última chance de conversão para quem scrollou até aqui.
- **Layout:** Full-width, background com cor primária ou gradiente sutil. Centralizado.
- **Elementos:**
  - Headline: "Pronto para parar de perder vendas?"
  - Sub-headline: "Configure em 2 minutos. Sem cartão de crédito."
  - CTA: "Criar minha conta grátis" (botão grande, branco sobre fundo escuro)

### 9. Footer

- **Objetivo:** Links legais e informações de contato.
- **Layout:** 3-4 colunas em desktop, empilhadas em mobile.
- **Elementos:**
  - Coluna 1: Logo + descrição curta (1 linha)
  - Coluna 2: Produto — Features, Preços
  - Coluna 3: Empresa — Sobre, Contato, Blog (placeholder)
  - Coluna 4: Legal — Termos de Uso, Política de Privacidade (links obrigatórios)
  - Linha final: "© 2026 LeadZap. Todos os direitos reservados."

---

## Hierarquia de CTAs

| CTA | Tipo | Aparece em | Destino |
|-----|------|-----------|---------|
| "Começar grátis" / "Criar minha conta grátis" | Primário | Navbar, Hero, CTA Final, cada card de preço | `/signup` |
| "Entrar" | Secundário | Navbar | `/login` |
| "Ver como funciona" | Terciário | Hero | Scroll para seção "Como funciona" |
| "Comece a organizar seus atendimentos" | Secundário | Abaixo de Features | `/signup` |

O CTA primário aparece **no mínimo 4 vezes** ao longo da página (navbar, hero, pricing, CTA final).

---

## Responsividade

| Seção | Desktop | Mobile |
|-------|---------|--------|
| Navbar | Links visíveis, CTAs à direita | Hamburger menu, CTA "Começar grátis" sempre visível |
| Hero | 2 colunas (texto + visual) | 1 coluna (texto → visual abaixo) |
| Problema | 3-4 cards lado a lado | Empilhados verticalmente |
| Solução | 3 passos horizontais com setas | Vertical, numerados |
| Features | Grid 2x3 | 1 coluna |
| Prova Social | 3 depoimentos visíveis | Carousel (1 por vez) ou empilhados |
| Preços | 3 cards lado a lado | Empilhados, "Pro" no topo |
| CTA Final | Centralizado | Centralizado, texto menor |
| Footer | 3-4 colunas | Accordion ou empilhado |

---

## Integrações da Landing

- **Formulário de cadastro:** CTA leva para `/signup` (Supabase Auth). Não há formulário inline na landing.
- **Analytics:** Adicionar Google Analytics / Plausible. Eventos: `page_view`, `click_cta_hero`, `click_cta_pricing`, `click_cta_final`.
- **Meta tags:** Open Graph (og:title, og:description, og:image), Twitter Card. Para compartilhamento em redes sociais e WhatsApp.
