# Analysis contract

## Route
`GET /v1/analysis`

## Response shape
```json
{
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-03-31T01:00:00Z",
    "version": "v1"
  },
  "data": {
    "scope": "portfolio",
    "score": {
      "value": 72,
      "status": "atencao_moderada"
    },
    "summary": "Sua carteira está funcional, mas concentrada demais em previdência.",
    "primaryProblem": "O principal ponto de atenção hoje é a concentração excessiva em um único bloco.",
    "recommendation": {
      "tag": "REDUCE_CONCENTRATION",
      "targetType": "category",
      "targetId": "PENSION",
      "title": "Diluir concentração aos poucos",
      "body": "Use novos aportes para abrir mais equilíbrio fora da previdência."
    },
    "insights": [],
    "generatedAt": "2026-03-31T01:00:00Z"
  }
}
```

## Rules
- a análise lê o snapshot e o contexto do usuário
- a resposta precisa ser curta
- sempre há uma recomendação principal
- a recommendation tag é obrigatória
