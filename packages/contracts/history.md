# History contract

## Route
`GET /v1/history/snapshots`
`GET /v1/history/imports`

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

## Imports center (data)

Lista de importacoes do usuario com rastreabilidade e proximo passo.

Empty:

```json
{
  "screenState": "empty",
  "portfolioId": "pfl_123",
  "emptyState": { "title": "string", "body": "string", "ctaLabel": "string", "target": "/imports/entry" },
  "summary": { "totalImports": 0, "pendingImports": 0, "completedImports": 0, "failedImports": 0 },
  "imports": []
}
```

Ready:

```json
{
  "screenState": "ready",
  "portfolioId": "pfl_123",
  "summary": { "totalImports": 2, "pendingImports": 1, "completedImports": 1, "failedImports": 0 },
  "imports": [
    {
      "id": "imp_123",
      "origin": "MANUAL_ENTRY",
      "originLabel": "Manual",
      "status": "PREVIEW_READY",
      "statusLabel": "Pronta para commit",
      "fileName": null,
      "mimeType": null,
      "totals": { "totalRows": 10, "validRows": 8, "invalidRows": 1, "duplicateRows": 1 },
      "createdAt": "2026-04-02T00:00:00.000Z",
      "updatedAt": "2026-04-02T00:00:00.000Z",
      "snapshot": null,
      "primaryAction": { "code": "resume_import", "title": "Retomar revisão", "target": "/imports/imp_123/preview" },
      "secondaryAction": null
    }
  ]
}
```

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
