# BRIEF — LeadZap (nome de trabalho)

## Problema

Pequenos e médios negócios no Brasil perdem vendas porque seus atendimentos via WhatsApp são desorganizados — leads chegam sem controle, vendedores esquecem de responder, e não existe pipeline de acompanhamento.

## Solução

Um SaaS WhatsApp-first que recebe mensagens do WhatsApp automaticamente, organiza leads em um pipeline visual, e gera lembretes para que nenhum cliente seja esquecido. Não é um CRM completo — é uma ferramenta de organização de atendimentos comerciais que vive onde o vendedor já trabalha.

## Público-alvo

Operadores de vendas (vendedores, atendentes, secretárias, SDRs) de pequenos negócios brasileiros que vendem majoritariamente via WhatsApp. Nichos iniciais: imobiliárias, clínicas de estética/odontologia, prestadores de serviço, pequenos negócios locais. Perfil: baixa maturidade digital, mobile-first, não quer configurar nada, quer resultado imediato.

## Diferencial competitivo

- **WhatsApp-first:** mensagens chegam automaticamente no sistema via Evolution API — o vendedor não precisa alternar entre apps.
- **Simplicidade radical:** onboarding em menos de 2 minutos, sem configuração complexa. Concorrentes (HubSpot, Pipedrive) são poderosos demais para esse público.
- **Preço acessível:** a partir de R$29/mês, acessível para microempreendedores.
- **Foco em não perder vendas**, não em "gerenciar relacionamentos" — posicionamento claro e urgente.

## Modelo de negócio

SaaS por assinatura mensal:

| Plano       | Preço   | Usuários |
|-------------|---------|----------|
| Starter     | R$29    | 1        |
| Pro         | R$59    | até 3    |
| Business    | R$99    | ilimitado|

Estratégia: volume + acessibilidade. Monetização simples, sem cobrança por mensagem no MVP.

## Stack técnica

| Camada      | Tecnologia                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14+ (App Router)          |
| Backend/DB  | Supabase (Auth, Postgres, Storage, Realtime) |
| UI          | shadcn/ui                         |
| WhatsApp    | Evolution API (webhook, leitura)  |
| Deploy      | Vercel                            |
| Distribuição| PWA (push notifications)          |

## Métricas de sucesso do MVP

1. **Adoção:** 70%+ dos usuários criam pelo menos 5 leads na primeira semana.
2. **Retenção:** 50%+ dos usuários voltam ao sistema pelo menos 3x por semana.
3. **Satisfação:** NPS acima de 30 nos primeiros 30 dias.
4. **Churn:** abaixo de 15% mensal nos primeiros 3 meses.
5. **Ativação WhatsApp:** 80%+ dos usuários conectam o WhatsApp no onboarding.

## O que NÃO é esse produto

- **Não é um CRM completo.** Não tem módulos de marketing, suporte, automações complexas ou relatórios avançados.
- **Não é uma ferramenta de atendimento ao cliente** (tipo Zendesk). O foco é vendas, não suporte.
- **Não é um chatbot.** Não responde automaticamente por ninguém.
- **Não é multi-canal no MVP.** Apenas WhatsApp. Instagram DM, email e outros canais ficam para depois.
- **Não tem IA no MVP.** Insights automáticos, sugestões de resposta e scoring de leads são evolução futura.
