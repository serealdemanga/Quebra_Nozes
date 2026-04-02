# Esquilo Invest - Cloudflare Worker + D1 Starter

Starter inicial para a nova versão do backend do Esquilo Invest em **Cloudflare Workers + D1**.

## O que tem aqui

- `schema.sql` com schema inicial para D1
- `openapi.yaml` com os contratos esperados da API
- `wrangler.toml` base
- estrutura inicial de `src/`
- rotas HTTP mínimas:
  - `/v1/health`
  - `/v1/dashboard/home`
  - `/v1/portfolio`
  - `/v1/portfolio/{portfolioId}/holdings/{holdingId}`
  - `/v1/profile/context`
  - `/v1/analysis`
  - `/v1/history/snapshots`
  - `/v1/imports/start`
  - `/v1/imports/{importId}/preview`
  - `/v1/imports/{importId}/commit`

## Observação importante

Isso é um **starter de verdade**, mas ainda não é backend completo de produção.
Ele já organiza:
- contratos
- envelopes de resposta
- validação básica de rotas
- estrutura de arquivo
- base SQL

O que ainda falta endurecer:
- autenticação real
- validação de payload com schema formal
- parser real de arquivos
- camada analítica completa
- integração com R2
- observabilidade
- testes automatizados

## Como usar

1. Criar os bancos D1 (local/hml/prd) e preencher os `database_id` no `wrangler.toml`
2. Aplicar o schema oficial: `../../database/d1/schema.sql`
3. Aplicar seeds (opcional): `../../database/seeds/seed_base.sql`
4. Subir localmente com o ambiente local
5. Fazer deploy em hml/prd com ambiente explicito

## Ambientes (wrangler)

Regra:

- sempre use `--env local|hml|production`
- isso evita rodar com configuracao default apontando para recursos errados

### Local (dev)

```bash
npm run dev
```

### HML

```bash
npm run deploy:hml
```

### Producao

```bash
npm run deploy:prod
```

## Bindings e secrets

- D1: configurado por ambiente em `wrangler.toml` (`DB`)
- R2: configurado em hml/prd como `IMPORTS_BUCKET` (ainda pode estar sem uso no runtime atual)
- Secrets (exemplos):
  - `APPS_SCRIPT_RECOVERY_SECRET`
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`

Sugestao de comando (por ambiente):

```bash
npx wrangler secret put APPS_SCRIPT_RECOVERY_SECRET --env hml
npx wrangler secret put APPS_SCRIPT_RECOVERY_SECRET --env production
```

## Sugestão de ordem

1. `health`
2. `profile/context`
3. `dashboard/home`
4. `portfolio`
5. `holding detail`
6. `imports`
7. `snapshots/history`
8. `analysis`

## Comandos esperados

```bash
npm install
npx wrangler d1 create esquilo-invest-local
npx wrangler d1 execute esquilo-invest-local --env local --file=../../database/d1/schema.sql --remote
npm run dev
```
