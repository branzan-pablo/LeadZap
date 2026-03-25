# PRD — LeadZap

## Visão geral do produto

LeadZap é uma ferramenta de organização de leads e pipeline de vendas, WhatsApp-first, para pequenos e médios negócios brasileiros. O sistema recebe mensagens do WhatsApp via Evolution API (modo leitura), organiza leads em pipeline visual com drag-and-drop, e permite que vendedores criem lembretes para não esquecer de nenhum cliente. Distribuído como PWA para viabilizar push notifications em dispositivos móveis.

---

## Personas

### Persona 1: Jéssica — Atendente de clínica de estética

- **Idade:** 24 anos
- **Contexto:** Trabalha como recepcionista/atendente em uma clínica de estética com 3 profissionais. Recebe de 20 a 40 mensagens por dia no WhatsApp da clínica. Usa o celular o dia inteiro.
- **Dor principal:** Esquece de responder clientes que pediram orçamento, perde o controle de quem já recebeu proposta, e a dona da clínica cobra resultados sem saber quantos leads estão abertos.
- **Comportamento digital:** Usa Instagram, WhatsApp e TikTok. Não sabe o que é CRM. Nunca usou ferramenta de gestão. Se algo demora mais que 2 minutos para configurar, desiste.
- **Job-to-be-done:** Organizar meus atendimentos para não esquecer de ninguém e mostrar para minha chefe que estou dando conta.

### Persona 2: Carlos — Corretor de imóveis autônomo

- **Idade:** 38 anos
- **Contexto:** Trabalha sozinho, recebe leads de portais (OLX, ZAP Imóveis) e do Instagram. Todas as conversas vão para seu WhatsApp pessoal. Gerencia uns 50 contatos ativos ao mesmo tempo.
- **Dor principal:** Perde leads porque esquece quem estava interessado em qual imóvel. Já tentou usar Pipedrive mas achou complicado e caro.
- **Comportamento digital:** Sabe usar planilhas básicas. Já ouviu falar de CRM. Quer algo que funcione no celular entre uma visita e outra.
- **Job-to-be-done:** Saber exatamente quem preciso contatar hoje e qual é o status de cada negociação, sem ter que lembrar de cabeça.

### Persona 3: Dona Márcia — Dona de pet shop

- **Idade:** 52 anos
- **Contexto:** Dona de um pet shop com 2 funcionárias que atendem WhatsApp. Ela quer saber se os atendimentos estão sendo feitos direito, mas não quer microgerenciar.
- **Dor principal:** Não tem visibilidade de quantos clientes estão sendo atendidos, quantos orçamentos foram enviados, e quanto de receita está em jogo. Descobre que perdeu venda só depois.
- **Comportamento digital:** Baixo. Usa WhatsApp e Facebook. Precisa de algo extremamente visual e intuitivo.
- **Job-to-be-done:** Ter visão geral do meu negócio sem precisar perguntar para cada funcionária o que está acontecendo.

---

## User Stories

### Módulo: Autenticação e Onboarding

| ID | Story | Critérios de aceitação |
|----|-------|----------------------|
| AUTH-01 | Como novo usuário, quero me cadastrar com email e senha para criar minha conta. | Formulário com email, senha (mín. 8 caracteres), nome completo. Validação de email único. Confirmação de email via Supabase Auth. Após confirmar, redireciona para onboarding. |
| AUTH-02 | Como usuário cadastrado, quero fazer login com email e senha para acessar o sistema. | Login com email+senha. Sessão persistente (não pede login toda vez). Redirect para dashboard após login. Se credenciais inválidas, mensagem de erro clara. |
| AUTH-03 | Como novo usuário, quero passar por um onboarding guiado para configurar minha conta em menos de 2 minutos. | Wizard de 3 passos: (1) Nome da empresa, (2) Conectar WhatsApp via QR code da Evolution API, (3) Criar primeiro lead manualmente. Botão de pular em cada passo. Barra de progresso visível. |
| AUTH-04 | Como admin, quero convidar membros do meu time para que eles acessam o sistema com suas próprias contas. | Admin envia convite por email. Convidado recebe link, cria senha, entra na organização. Convite expira em 7 dias. Admin pode revogar convite pendente. |

### Módulo: Gestão de Leads

| ID | Story | Critérios de aceitação |
|----|-------|----------------------|
| LEAD-01 | Como vendedor, quero cadastrar um lead manualmente para registrar um novo contato. | Formulário com: nome (obrigatório), telefone (obrigatório), origem (select), valor estimado (opcional), notas (opcional). Lead é criado na primeira coluna do pipeline. Lead é atribuído ao usuário que criou. |
| LEAD-02 | Como vendedor, quero ver os detalhes de um lead para entender o contexto antes de atendê-lo. | Painel lateral (drawer) ao clicar no lead no pipeline. Exibe: dados do lead, histórico de mensagens WhatsApp, notas, tags, anexos, lembretes, log de atividades. |
| LEAD-03 | Como vendedor, quero adicionar notas a um lead para registrar informações de conversas. | Campo de texto livre no detalhe do lead. Notas salvas com timestamp e autor. Histórico de notas visível em ordem cronológica reversa. |
| LEAD-04 | Como vendedor, quero adicionar tags a um lead para classificá-lo rapidamente. | Tags pré-definidas: quente, frio, indeciso, VIP. Possibilidade de criar tags customizadas. Múltiplas tags por lead. Tag visível no card do pipeline. |
| LEAD-05 | Como vendedor, quero filtrar leads por tag, responsável e estágio para encontrar o que preciso rapidamente. | Filtros combináveis na visão de pipeline e na visão de lista. Filtro persiste durante a sessão. Contador de resultados visível. |
| LEAD-06 | Como vendedor, quero anexar arquivos a um lead para guardar propostas e documentos relevantes. | Upload de imagens (JPG, PNG) e PDFs. Limite de 5MB por arquivo. Máximo de 5 anexos por lead. Lista de anexos com nome, tipo e data. Download ao clicar. |
| LEAD-07 | Como sistema, quero criar leads automaticamente quando uma mensagem WhatsApp chega de um número desconhecido. | Webhook da Evolution API recebe mensagem. Sistema verifica se telefone já existe como lead na organização. Se não existe, cria lead com nome do perfil WhatsApp, telefone, origem "WhatsApp", na primeira coluna do pipeline. Se existe, vincula mensagem ao lead existente. |

### Módulo: Pipeline

| ID | Story | Critérios de aceitação |
|----|-------|----------------------|
| PIPE-01 | Como vendedor, quero visualizar meus leads em um pipeline com colunas para ver o status de cada negociação. | Pipeline com 5 colunas padrão: Novo Lead, Conversando, Proposta Enviada, Fechado, Perdido. Cards mostram: nome, telefone, tag principal, valor estimado, tempo desde última interação. |
| PIPE-02 | Como vendedor, quero mover leads entre colunas via drag-and-drop para atualizar o status da negociação. | Drag-and-drop funcional em desktop e mobile (touch). Ao mover, registra atividade no log do lead. Atualização otimista (move na UI antes da confirmação do servidor). Supabase Realtime sincroniza entre múltiplos usuários. |
| PIPE-03 | Como admin, quero ver contadores de valor (R$) por coluna para saber quanto está em jogo em cada estágio. | Cada coluna exibe: quantidade de leads e soma de valores estimados. Atualiza em tempo real ao mover leads. |
| PIPE-04 | Como admin, quero renomear colunas do pipeline para adaptar à linguagem do meu negócio. | Admin pode editar nome de qualquer coluna. Nome novo aparece para todos os usuários da organização. |
| PIPE-05 | Como admin, quero adicionar até 2 colunas extras ao pipeline para customizar meu fluxo. | Botão "adicionar etapa" visível se houver menos de 7 colunas. Admin define nome e posição. Pode reordenar colunas. |

### Módulo: WhatsApp (Leitura)

| ID | Story | Critérios de aceitação |
|----|-------|----------------------|
| WA-01 | Como admin, quero conectar o WhatsApp da empresa ao sistema via QR code para que as mensagens cheguem automaticamente. | Tela de configuração com QR code gerado pela Evolution API. Status de conexão visível (conectado/desconectado). Reconexão automática se a sessão cair. |
| WA-02 | Como vendedor, quero ver as mensagens do WhatsApp de um lead dentro do sistema para ter contexto sem sair da ferramenta. | Na view de detalhe do lead, aba "Mensagens" exibe histórico de mensagens recebidas. Mensagens exibidas em formato de chat (balões). Inclui texto, data e hora. Mensagens de mídia exibem indicador "[Imagem]", "[Áudio]", etc (sem renderizar no MVP). |
| WA-03 | Como vendedor, quero receber notificação quando uma nova mensagem chegar de um lead que estou acompanhando. | Nova mensagem gera indicador visual no lead (badge/dot). Contador de mensagens não lidas no ícone de notificações. Push notification via PWA se o navegador suportar. |

### Módulo: Lembretes

| ID | Story | Critérios de aceitação |
|----|-------|----------------------|
| REM-01 | Como vendedor, quero criar um lembrete para um lead com data e hora para não esquecer de fazer follow-up. | Criação de lembrete com: texto livre, data, hora. Vinculado a um lead e a um usuário. Lembrete aparece na lista de tarefas e gera push notification na hora marcada. |
| REM-02 | Como vendedor, quero ver meus lembretes pendentes em uma lista centralizada para saber o que preciso fazer hoje. | Centro de notificações/tarefas acessível do header. Lista ordenada por data/hora. Separação: atrasados, hoje, próximos. Marcar como concluído. |
| REM-03 | Como vendedor, quero receber push notification quando um lembrete vencer para ser alertado mesmo fora do sistema. | Push notification via Service Worker/PWA. Exibe texto do lembrete e nome do lead. Ao clicar, abre o detalhe do lead. Funciona com o navegador fechado (se PWA instalada). |

### Módulo: Gestão de Equipe (Admin)

| ID | Story | Critérios de aceitação |
|----|-------|----------------------|
| TEAM-01 | Como admin, quero ver todos os leads da organização para ter visão completa do pipeline. | Admin vê leads de todos os usuários. Filtro por responsável disponível. Toggle "meus leads" / "todos os leads". |
| TEAM-02 | Como admin, quero reatribuir um lead a outro vendedor para redistribuir a carga. | No detalhe do lead, admin pode mudar o responsável via select. Mudança registrada no log de atividades. Novo responsável vê o lead imediatamente. |

---

## Requisitos Não-Funcionais

**Performance:**
- Pipeline deve renderizar com até 200 leads sem lag perceptível.
- Tempo de carregamento inicial abaixo de 3 segundos em 4G.
- Drag-and-drop deve ter feedback visual em menos de 100ms.

**Segurança:**
- Multi-tenancy com RLS — nenhum dado pode vazar entre organizações, nunca.
- Senhas com hash via Supabase Auth (bcrypt).
- Todas as rotas autenticadas protegidas via middleware.
- Webhooks da Evolution API validados por token.

**Acessibilidade:**
- Contraste mínimo AA (WCAG 2.1) em textos.
- Navegação por teclado funcional no pipeline.
- Labels em todos os campos de formulário.

**SEO:**
- Apenas a landing page precisa ser otimizada para SEO.
- App autenticado não precisa de SSR para SEO.

**Mobile:**
- PWA instalável com ícone na home screen.
- Layout responsivo — pipeline usa scroll horizontal em mobile.
- Touch targets mínimos de 44x44px.

---

## Fluxos Principais

### Fluxo 1: Primeiro uso (onboarding)

1. Usuário acessa a landing page e clica em "Começar grátis" (ou "Criar conta").
2. Preenche formulário: nome, email, senha.
3. Recebe email de confirmação, clica no link.
4. É redirecionado para o wizard de onboarding.
5. Passo 1: Digita o nome da empresa → cria a organização.
6. Passo 2: Escaneia QR code para conectar WhatsApp → Evolution API estabelece sessão.
7. Passo 3: Cria o primeiro lead manualmente (nome + telefone) → lead aparece no pipeline.
8. Onboarding concluído. Usuário cai no dashboard/pipeline.

### Fluxo 2: Mensagem WhatsApp chega

1. Cliente envia mensagem no WhatsApp da empresa.
2. Evolution API envia webhook para o endpoint do sistema.
3. Sistema recebe o payload, extrai: número, nome do perfil, conteúdo da mensagem.
4. Sistema busca lead pelo número de telefone na organização.
5. Se lead existe: vincula mensagem ao lead, atualiza `last_interaction_at`, gera badge de "nova mensagem".
6. Se lead NÃO existe: cria novo lead com dados do WhatsApp, coloca na primeira coluna do pipeline.
7. Supabase Realtime notifica os clientes conectados sobre o novo lead ou nova mensagem.
8. Vendedor vê a atualização no pipeline/lista sem refresh.

### Fluxo 3: Vendedor trabalha um lead

1. Vendedor abre o pipeline, vê seus leads organizados por estágio.
2. Clica em um lead → abre drawer lateral com detalhes.
3. Lê as mensagens do WhatsApp recebidas para entender o contexto.
4. Adiciona uma nota: "Cliente quer orçamento para limpeza de pele".
5. Adiciona tag "quente".
6. Cria lembrete: "Enviar orçamento amanhã às 9h".
7. Fecha o drawer, arrasta o lead para "Conversando".
8. No dia seguinte, recebe push notification do lembrete.
9. Abre o WhatsApp, envia o orçamento.
10. Volta ao sistema, move lead para "Proposta Enviada", atualiza valor estimado.

### Fluxo 4: Admin supervisiona

1. Admin acessa o pipeline com toggle "todos os leads".
2. Vê contadores de valor por coluna (ex: R$12.000 em "Proposta Enviada").
3. Filtra por responsável para ver a carga de cada vendedor.
4. Identifica lead parado há 5 dias em "Conversando" sem interação.
5. Reatribui o lead para outro vendedor.
6. Vendedor novo recebe o lead e vê todo o histórico.

---

## Edge Cases e Comportamentos de Erro

### Autenticação
- Email já cadastrado → mensagem: "Este email já possui uma conta. Faça login ou recupere sua senha."
- Convite para email já cadastrado em outra organização → bloquear. Usuário pertence a uma organização por vez no MVP.
- Sessão expirada → redirect para login com mensagem "Sua sessão expirou. Faça login novamente."

### WhatsApp
- QR code expira sem ser escaneado → botão "Gerar novo QR code".
- Sessão do WhatsApp desconecta (celular desligou, etc.) → status "Desconectado" visível no header + banner alertando admin + tentativa de reconexão automática a cada 5 minutos.
- Webhook da Evolution API retorna erro ou timeout → mensagens ficam em fila e são reprocessadas. Log de erros interno.
- Mensagem chega de número que pertence a lead em outra organização → cada organização tem seu próprio escopo. O mesmo número pode existir como leads separados em orgs diferentes.
- Mensagem com mídia (imagem, áudio, vídeo) → armazenar metadados, exibir placeholder "[Imagem recebida]", "[Áudio recebido]". Não renderizar mídia no MVP.

### Pipeline
- Tentar mover lead para a mesma coluna → ignorar, sem erro.
- Mover lead com erro de rede → reverter posição na UI, exibir toast de erro "Não foi possível mover o lead. Tente novamente."
- Dois usuários movem o mesmo lead simultaneamente → last write wins, Realtime sincroniza o estado correto.
- Coluna com 100+ leads → paginação ou virtualização no card list. Exibir os 50 primeiros + "carregar mais".

### Leads
- Criar lead com telefone que já existe na org → alertar: "Já existe um lead com esse telefone. Deseja abrir?" Não criar duplicata.
- Deletar lead → soft delete (campo `deleted_at`). Admin pode deletar. Usuário não pode no MVP.
- Upload falha → toast de erro "Falha no upload. Verifique o tamanho do arquivo (máx 5MB)."
- Arquivo corrompido no upload → validar tipo MIME no servidor. Rejeitar se não for image/* ou application/pdf.

### Lembretes
- Lembrete para data passada → permitir (pode ser intencional), mas exibir como "atrasado" imediatamente.
- Push notification não entregue (navegador não suporta, permissão negada) → lembrete ainda aparece na lista in-app. Push é best-effort.

---

## Integrações Externas

### Evolution API (WhatsApp)
- **O que integra:** API de WhatsApp para receber mensagens.
- **Como:** Webhook configurado na instância da Evolution API aponta para endpoint da aplicação (`/api/webhooks/evolution`). Autenticação por token no header.
- **Dados que troca:** Recebe: número do remetente, nome do perfil, conteúdo da mensagem (texto), timestamp, tipo de mídia (se houver). Envia: apenas requisições de gerenciamento de sessão (criar instância, gerar QR code, verificar status).
- **Modo:** Somente leitura no MVP. O sistema NÃO envia mensagens pelo WhatsApp.

### Supabase
- **Auth:** Cadastro, login, recuperação de senha, confirmação de email.
- **Database:** Postgres como banco principal, com RLS para multi-tenancy.
- **Storage:** Bucket por organização para uploads de arquivos de leads.
- **Realtime:** Subscription em changes de `leads`, `messages`, `reminders` para atualizar UI em tempo real.

### Web Push API
- **O que integra:** Push notifications do navegador/PWA.
- **Como:** Service Worker registra subscription, backend armazena endpoint. Ao vencer um lembrete ou chegar mensagem nova, backend dispara push via Web Push Protocol.
- **Dados que troca:** Payload da notificação (título, corpo, URL de destino ao clicar).

---

## Decisões de Produto Documentadas

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| WhatsApp no MVP | Sim, modo leitura | Sem WhatsApp o produto não se diferencia de um pipeline genérico. Modo leitura reduz complexidade (não precisa enviar mensagens). |
| Pipeline fixo vs. customizável | Semi-fixo (renomear + até +2 colunas) | Público não quer configurar. Flexibilidade mínima para adaptar à linguagem do negócio sem over-engineering. |
| Upload de arquivos | Sim, com limites rígidos | Vendedores precisam guardar propostas. Limites (5MB, 5 por lead, só imagem/PDF) evitam que vire um file manager. |
| Email vs. push para notificações | Push (PWA) + in-app | Público não usa email ativamente. Push no celular é o canal com maior chance de ser visto. |
| Multi-org por usuário | Não no MVP | Simplifica drasticamente o modelo de dados e a UX. Um usuário = uma organização. |
| Dashboard gerencial | Fora do MVP | Contadores no pipeline já dão visibilidade mínima para o admin. Dashboard dedicado é v2. |
| Provedor WhatsApp | Evolution API | Open-source, self-hosted, sem custo por mensagem. Risco: não é API oficial, pode ter instabilidade. Trade-off aceito para MVP. |
| Auth method | Email + senha | Público entende, não gera fricção. Magic link e login via WhatsApp são upgrades futuros. |
