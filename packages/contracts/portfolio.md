# Portfolio contract

## Route
`GET /v1/portfolio`

## Response shape
```json
{
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-03-31T01:00:00Z",
    "version": "v1"
  },
  "data": {
    "summary": {
      "totalEquity": 120000,
      "categories": 3,
      "positions": 12
    },
    "groups": [
      {
        "categoryCode": "STOCK",
        "categoryName": "Ações",
        "totalValue": 50000,
        "items": []
      }
    ],
    "orders": []
  }
}
```

## Rules
- carteira é lida por categoria e por relevância
- lista deve funcionar com mocks e com backend real sem mudar a UI
- itens podem ter `performancePct` nulo se faltarem dados
