# LeadZap

CRM com pipeline visual e integração WhatsApp via Evolution API.

## Requisitos

- Node.js 20+
- pnpm
- Docker (para Evolution API local)
- Conta no [Supabase](https://supabase.com)

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Preencha as variáveis em `.env.local` (Supabase, VAPID, etc.).

Rode o schema SQL no Supabase SQL Editor (copie o conteúdo de `supabase/schema.sql`).

## Dev

```bash
pnpm dev
```

Acesse `http://localhost:3000`.

## Evolution API (WhatsApp)

A integração WhatsApp usa a [Evolution API v2](https://doc.evolution-api.com/v2/pt/get-started/introduction). Para rodar localmente:

```bash
# Iniciar
pnpm evolution:start

# Ver logs
pnpm evolution:logs

# Parar
pnpm evolution:stop
```

Isso sobe um container Docker com a Evolution API em `http://localhost:8080`.

Configure no `.env.local`:

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=<sua-chave-api>
```

A chave padrão do container Docker pode ser encontrada no `docker-compose.yml` (variável `AUTHENTICATION_API_KEY`). **Nunca exponha este container na internet pública** — ele deve ser acessível apenas localmente. Em produção, gere uma chave aleatória forte e configure via variáveis de ambiente do servidor.

### Fluxo de conexão

1. O app cria uma instância na Evolution API (`POST /instance/create`)
2. Gera QR code via `GET /instance/connect/{instance}`
3. O usuário escaneia o QR com o WhatsApp
4. Polling verifica o estado via `GET /instance/connectionState/{instance}`
5. Quando `state: "open"`, a conexão está ativa

### Sem Docker

Se preferir instalar sem Docker, siga a [documentação oficial](https://doc.evolution-api.com/v2/pt/get-started/introduction) para instalação via NVM.

## Deploy

Deploy via [Vercel](https://vercel.com). Consulte a [documentação de deploy do Next.js](https://nextjs.org/docs/app/building-your-application/deploying).
