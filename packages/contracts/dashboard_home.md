# Dashboard home contract

## Route
`GET /v1/dashboard/home`

## Response shape
```json
{
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-03-31T01:00:00Z",
    "version": "v1"
  },
  "data": {
    "hero": {
      "totalEquity": 120000,
      "totalInvested": 100000,
      "totalProfitLoss": 20000,
      "totalProfitLossPct": 20
    },
    "score": {
      "value": 78,
      "status": "saudavel",
      "reason": "boa diversificação, mas com atenção leve em concentração"
    },
    "primaryProblem": "Sua carteira ainda está um pouco concentrada em previdência.",
    "primaryAction": {
      "tag": "REDUCE_CONCENTRATION",
      "targetType": "category",
      "targetId": "PENSION",
      "title": "Diluir concentração aos poucos",
      "body": "Use novos aportes para abrir mais equilíbrio fora desse bloco."
    },
    "distribution": [],
    "insights": [],
    "updatedAt": "2026-03-31T01:00:00Z",
    "sourceWarning": null
  }
}
```

## Rules
- a Home precisa responder rápido o estado da carteira
- só uma ação principal por vez
- `sourceWarning` não pode derrubar a tela
