# API

Esta pasta vai receber o backend novo.

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
