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

1. Criar o banco D1
2. Aplicar `schema.sql`
3. Ajustar `wrangler.toml`
4. Rodar localmente
5. Implementar os repositórios reais por rota

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
npx wrangler d1 create esquilo-invest
npx wrangler d1 execute esquilo-invest --local --file=schema.sql
npm run dev
```
