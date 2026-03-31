# Profile context contract

## Routes
- `GET /v1/profile/context`
- `PUT /v1/profile/context`

## Response shape
```json
{
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-03-31T01:00:00Z",
    "version": "v1"
  },
  "data": {
    "userId": "user_demo",
    "displayName": "Luiz",
    "financialGoal": "equilibrar e crescer",
    "monthlyIncomeRange": "10k-15k",
    "monthlyInvestmentTarget": 1000,
    "availableToInvest": 500,
    "riskProfile": "moderado",
    "investmentHorizon": "longo_prazo",
    "platformsUsed": ["xp", "ion"],
    "displayPreferences": {
      "ghostMode": false
    }
  }
}
```

## Rules
- o contexto do usuário melhora a leitura da carteira
- a UI deve suportar contexto incompleto
- PUT atualiza parcialmente sem quebrar o restante
