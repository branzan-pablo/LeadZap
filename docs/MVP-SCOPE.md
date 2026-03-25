# MVP-SCOPE — LeadZap

## Features do MVP — Prioridade MoSCoW

### Must Have (sem isso o produto não existe)

| Feature | Descrição |
|---------|-----------|
| Auth email+senha | Cadastro, login, recuperação de senha via Supabase Auth. |
| Multi-tenancy | Cada empresa é uma organização isolada. Dados nunca vazam entre orgs. |
| Dois perfis (Admin/Usuário) | Admin vê tudo e configura. Usuário vê seus leads. RLS no Supabase. |
| Onboarding wizard | 3 passos: nome da empresa → conectar WhatsApp → criar primeiro lead. Menos de 2 minutos. |
| Cadastro manual de leads | Nome, telefone, origem, valor estimado, notas. |
| Pipeline visual drag-and-drop | 5 colunas padrão. Cards com nome, telefone, tag, valor, tempo sem interação. |
| Integração WhatsApp (leitura) | Evolution API via webhook. Mensagens recebidas aparecem no lead. Criação automática de lead para números desconhecidos. |
| Conexão WhatsApp via QR code | Tela de config para admin escanear QR code e conectar a instância. |
| Tags por lead | Tags padrão (quente, frio, indeciso, VIP) + criação de tags customizadas. Múltiplas por lead. |
| Filtros básicos | Filtrar por tag, responsável e estágio no pipeline. Combináveis. |
| Contadores de valor por coluna | Quantidade de leads e soma de R$ por estágio do pipeline. |
| Lembretes manuais | Criar lembrete com texto, data e hora, vinculado a lead. Lista centralizada de pendências. |
| Push notifications (PWA) | Service worker + manifest.json. Notificação ao vencer lembrete e ao receber mensagem WhatsApp. |
| Upload de arquivos | Imagens e PDFs, até 5MB, máximo 5 por lead. Supabase Storage. |
| Convite de membros | Admin convida por email. Convidado cria conta e entra na org. |
| Log de atividades por lead | Registro automático: criação, movimentação no pipeline, notas, atribuição. |

### Should Have (alto valor, entra se o tempo permitir)

| Feature | Descrição |
|---------|-----------|
| Customização do pipeline | Renomear colunas e adicionar até 2 colunas extras. |
| Visão de lista de leads | Alternativa ao pipeline — tabela com leads filtráveis e ordenáveis. |
| Reatribuição de leads | Admin pode mudar o responsável de um lead. |
| Status de conexão WhatsApp | Indicador visível no header (conectado/desconectado) com reconexão automática. |

### Could Have (bom ter, não bloqueia lançamento)

| Feature | Descrição |
|---------|-----------|
| Busca global de leads | Buscar lead por nome ou telefone em toda a organização. |
| Soft delete de leads | Admin pode "arquivar" leads perdidos sem perder dados. |
| Indicador de leads sem interação | Highlight visual em leads que não recebem mensagem ou ação há X dias. |

### Won't Have (explicitamente fora do MVP)

| Feature | Justificativa |
|---------|---------------|
| Envio de mensagens via WhatsApp | Modo leitura apenas no MVP. Envio exige integração mais profunda e tratamento de rate limits. |
| Follow-up automático | Depende de envio de mensagens. Vem depois. |
| Dashboard gerencial | Contadores no pipeline cobrem a necessidade mínima do admin. Dashboard dedicado é v2. |
| Múltiplos pipelines | Um pipeline por organização é suficiente para o público inicial. |
| Campos customizáveis | Tags e notas cobrem a necessidade de customização por nicho no MVP. |
| Relatórios e métricas | v2/v3. Primeiro valida adoção e retenção. |
| IA (scoring, sugestões, insights) | v3+. Foco em simplicidade operacional primeiro. |
| Integração Instagram DM | Segundo canal mais relevante, mas adiciona complexidade significativa. v2. |
| Multi-org por usuário | Um usuário pertence a uma organização. Simplifica modelo de dados. |
| Planos e cobrança (billing) | MVP é gratuito ou com cobrança manual. Stripe/billing system vem quando validar PMF. |

---

## Hipóteses a Validar com o MVP

| # | Hipótese | Como medir |
|---|----------|-----------|
| H1 | Pequenos negócios adotam uma ferramenta de pipeline se ela for simples o suficiente e conectada ao WhatsApp. | Taxa de conclusão do onboarding (meta: >80%). |
| H2 | Ver mensagens do WhatsApp dentro do sistema é suficiente para gerar valor, mesmo sem poder responder por dentro. | Frequência de acesso à aba de mensagens por lead. Feedback qualitativo. |
| H3 | Organizar leads visualmente em pipeline reduz a percepção de "leads esquecidos". | Comparar % de leads que ficam sem interação >7 dias antes vs. depois do uso. |
| H4 | Lembretes manuais + push notification são suficientes para gerar reengajamento. | Taxa de ação após receber push (abrir o app em até 1h). |
| H5 | O preço de R$29-99/mês é aceitável para o público-alvo. | Taxa de conversão de trial para pagante (meta: >5%). |

---

## Critérios de Done do MVP

O MVP está pronto para testar com usuários quando:

1. Um novo usuário consegue se cadastrar, conectar WhatsApp e criar o primeiro lead em menos de 2 minutos.
2. Mensagens recebidas no WhatsApp aparecem vinculadas ao lead correto em menos de 5 segundos.
3. Leads podem ser movidos no pipeline via drag-and-drop em desktop e mobile (touch).
4. Lembretes geram push notification no horário marcado (com PWA instalada).
5. Admin consegue ver todos os leads, filtrar por responsável, e reatribuir.
6. Dados de uma organização são completamente invisíveis para outra (RLS testado).
7. O sistema funciona aceitavelmente em 4G com carregamento inicial abaixo de 3s.
8. Landing page está no ar com CTA de cadastro funcional.

---

## Riscos Conhecidos e Mitigação

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|--------------|-----------|
| Evolution API instável ou sessão desconecta frequentemente | Alto — feature core quebra | Média | Monitoramento de status, reconexão automática, banner alertando admin, fallback para cadastro manual. |
| Push notification não funciona em iOS sem PWA instalada | Médio — lembretes não chegam | Alta | Onboarding incentiva instalação da PWA. Lembretes sempre visíveis in-app como fallback. |
| QR code do WhatsApp confunde usuário no onboarding | Médio — drop no onboarding | Média | Instruções visuais claras (passo a passo com screenshots). Botão "pular" permite continuar sem conectar. |
| Público acha que é "mais um CRM" e não testa | Alto — falha de posicionamento | Média | Landing page focada em dor ("pare de perder vendas no WhatsApp"), não em features. Evitar a palavra "CRM" no marketing. |
| Volume de mensagens WhatsApp sobrecarrega o webhook | Médio — mensagens atrasam | Baixa no MVP | Rate limiting no endpoint. Fila de processamento se necessário (pode ser simples com setTimeout no início). |
| Usuário tenta responder pelo sistema e não consegue | Médio — frustração | Alta | Comunicação clara: "As mensagens aparecem aqui para você ter contexto. Responda diretamente no WhatsApp." Botão "Abrir no WhatsApp" com deep link. |
