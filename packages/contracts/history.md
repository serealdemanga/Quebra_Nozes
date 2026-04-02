# History contract

## Route
`GET /v1/history/snapshots`

## Envelope HTTP

Sucesso:

```json
{ "ok": true, "meta": { "requestId": "uuid", "timestamp": "2026-04-02T00:00:00.000Z", "version": "v1" }, "data": {} }
```

Erro:

```json
{ "ok": false, "meta": { "requestId": "uuid", "timestamp": "2026-04-02T00:00:00.000Z", "version": "v1" }, "error": { "code": "unauthorized", "message": "Sessao nao encontrada." } }
```

Headers:

- `x-request-id` (sempre)
- `x-error-code` (apenas em erro)

## Response shape (data)

Estados:

- `redirect_onboarding`
- `empty`
- `ready`

Empty:

```json
{
  "screenState": "empty",
  "portfolioId": "pfl_123",
  "emptyState": { "title": "string", "body": "string", "ctaLabel": "string", "target": "/import" },
  "summary": { "totalSnapshots": 0, "latestReferenceDate": null },
  "snapshots": []
}
```

Ready:

```json
{
  "screenState": "ready",
  "portfolioId": "pfl_123",
  "summary": { "totalSnapshots": 2, "latestReferenceDate": "2026-03-31" },
  "snapshots": [
    {
      "id": "snp_123",
      "referenceDate": "2026-03-31",
      "totalEquity": 21276.84,
      "totalInvested": 20742.58,
      "totalProfitLoss": 534.26,
      "totalProfitLossPct": 2.58,
      "createdAt": "2026-04-02T00:00:00.000Z",
      "analysisBadge": {
        "status": "saudavel",
        "primaryProblem": "string",
        "primaryAction": "string"
      }
    }
  ]
}
```

Observacao: eventos operacionais nao aparecem nesta rota hoje; a trilha operacional fica em `GET /v1/ops/events`.

## Rules

- quando houver 0 snapshots, orientar a proxima acao (importar carteira).
- quando houver 1 snapshot, a UI deve explicar que ainda nao ha comparacao util.
