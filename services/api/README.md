# API

Esta pasta e a casa final oficial do backend novo.

Nesta fase, o runtime executavel ainda esta em:

- `04_STARTER_BACKEND/esquilo_cloudflare_d1_starter`

Papel desta pasta agora:

- definir contrato HTTP oficial
- registrar rotas e fronteiras por dominio
- servir como destino estrutural da absorcao do starter

Regra:

- nao abrir API nova fora desta trilha
- nao tratar esta pasta como "documentacao opcional"
- toda mudanca relevante de rota deve ficar coerente com o runtime oficial de transicao

## Envelope HTTP (oficial)

O backend responde sempre em JSON no formato:

- sucesso: `{ ok: true, meta: { requestId, timestamp, version }, data }`
- erro: `{ ok: false, meta: { requestId, timestamp, version }, error: { code, message, details? } }`

Erros padrao do roteamento:

- `route_not_found` (404)
- `method_not_allowed` (405) com header `Allow`


Responsabilidades esperadas:
- health
- profile/context
- dashboard/home
- portfolio
- holding detail
- imports
- history
- analysis
