# Profile / Context contract

## Routes

- `GET /v1/profile/context`
- `PUT /v1/profile/context`

## Envelope HTTP

Sucesso:

```json
{ "ok": true, "meta": { "requestId": "uuid", "timestamp": "2026-04-02T00:00:00.000Z", "version": "v1" }, "data": {} }
```

Erro:

```json
{ "ok": false, "meta": { "requestId": "uuid", "timestamp": "2026-04-02T00:00:00.000Z", "version": "v1" }, "error": { "code": "missing_financial_goal", "message": "Objetivo financeiro obrigatorio." } }
```

Headers:

- `x-request-id` (sempre)
- `x-error-code` (apenas em erro)

## GET /v1/profile/context (data)

```json
{
  "userId": "usr_123",
  "portfolioId": "pfl_123",
  "context": {
    "financialGoal": "equilibrar e crescer",
    "monthlyIncomeRange": "10k-15k",
    "monthlyInvestmentTarget": 1000,
    "availableToInvest": 500,
    "riskProfileSelfDeclared": "moderado",
    "riskProfileQuizResult": "moderado",
    "riskProfileEffective": "moderado",
    "investmentHorizon": "longo_prazo",
    "platformsUsed": { "platformIds": ["xp", "ion"], "otherPlatforms": [] },
    "displayPreferences": { "ghostMode": false }
  },
  "onboarding": {
    "currentStep": "goal",
    "completed": false,
    "completedAt": null,
    "homeUnlocked": false,
    "completedSteps": ["goal"],
    "missing": ["riskProfileEffective"]
  },
  "backendHealth": {
    "status": "ok",
    "appEnv": "local",
    "apiVersion": "v1",
    "services": { "d1": "ok", "externalReferences": "disabled|degraded|ok" }
  }
}
```

## PUT /v1/profile/context (request)

O backend aceita:

- payload direto (campos de `context`)
- ou `{ context: {...}, step: "goal|risk_quiz|income_horizon|platforms" }`

Campos mais usados:

- `financialGoal` (ou `financialGoalOther` quando `financialGoal=outro`)
- `monthlyIncomeRange`
- `monthlyInvestmentTarget`
- `availableToInvest`
- `riskProfileSelfDeclared`
- `riskProfileQuizResult` (define `riskProfileEffective`)
- `investmentHorizon`
- `platformsUsed`
- `displayPreferences`

## PUT /v1/profile/context (data)

Retorna o estado atualizado do contexto + onboarding (mesma estrutura do GET, sem `backendHealth`).

## Rules

- o contexto do usuario destrava Home e personaliza leitura/recomendacao.
- a UI deve suportar contexto incompleto e usar `onboarding` para guiar o fluxo.
