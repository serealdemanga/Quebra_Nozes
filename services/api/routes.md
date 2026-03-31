# Rotas da API

## Primeira leva
- `GET /v1/health`
- `GET /v1/profile/context`
- `PUT /v1/profile/context`
- `GET /v1/dashboard/home`
- `GET /v1/portfolio`

## Segunda leva
- `GET /v1/portfolio/{portfolioId}/holdings/{holdingId}`
- `GET /v1/history/snapshots`
- `GET /v1/analysis`

## Terceira leva
- `POST /v1/imports/start`
- `GET /v1/imports/{importId}/preview`
- `POST /v1/imports/{importId}/commit`

## Regra
Implementar na ordem do menor risco para o maior.
