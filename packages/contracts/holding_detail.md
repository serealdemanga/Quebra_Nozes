# Holding detail contract

## Route
`GET /v1/portfolio/{portfolioId}/holdings/{holdingId}`

## Response shape
```json
{
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-03-31T01:00:00Z",
    "version": "v1"
  },
  "data": {
    "holdingId": "pos_1",
    "portfolioId": "portfolio_main",
    "asset": {
      "id": "asset_itsa4",
      "code": "ITSA4",
      "name": "Itaúsa",
      "categoryCode": "STOCK",
      "categoryName": "Ações"
    },
    "platform": {
      "id": "platform_xp",
      "name": "XP Investimentos"
    },
    "quantity": 27,
    "averagePrice": 13.84,
    "currentPrice": 14.52,
    "investedAmount": 373.68,
    "currentValue": 392.04,
    "performancePct": 4.92,
    "score": {
      "value": 74,
      "status": "atencao_leve"
    },
    "summary": "Este ativo cumpre um papel pequeno, mas ainda útil na carteira.",
    "primaryMessage": "Vale acompanhar sem transformar isso no maior foco agora.",
    "externalLink": null
  }
}
```

## Rules
- detalhe aprofunda sem virar relatório gigante
- externalLink só aparece se existir origem válida
- a recomendação precisa ser coerente com o peso do ativo na carteira
