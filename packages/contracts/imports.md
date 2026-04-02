# Imports contract

## Routes
- `POST /v1/imports/start`
- `GET /v1/imports/{importId}/preview`
- `POST /v1/imports/{importId}/commit`

Rotas de revisao (suportadas no runtime atual):

- `PATCH /v1/imports/{importId}/rows/{rowId}`
- `POST /v1/imports/{importId}/rows/{rowId}/duplicate-resolution`

## Envelope HTTP

Sucesso:

```json
{ "ok": true, "meta": { "requestId": "uuid", "timestamp": "2026-04-02T00:00:00.000Z", "version": "v1" }, "data": {} }
```

Erro:

```json
{ "ok": false, "meta": { "requestId": "uuid", "timestamp": "2026-04-02T00:00:00.000Z", "version": "v1" }, "error": { "code": "preview_not_consistent", "message": "O preview ainda possui pendências e não pode ser commitado." } }
```

Headers:

- `x-request-id` (sempre)
- `x-error-code` (apenas em erro)

## Start response (data)
```json
{
  "importId": "imp_123",
  "status": "pending_preview",
  "nextStep": "/v1/imports/imp_123/preview",
  "totals": { "totalRows": 10, "validRows": 8, "invalidRows": 1, "duplicateRows": 1 },
  "document": null,
  "importable": true
}
```

## Preview response (data)
```json
{
  "importId": "imp_123",
  "status": "PREVIEW_READY",
  "origin": "MANUAL_ENTRY",
  "totals": { "totalRows": 10, "validRows": 8, "invalidRows": 1, "duplicateRows": 1 },
  "readyToCommit": false,
  "document": null,
  "importable": true,
  "rows": [
    {
      "id": "imr_123",
      "rowNumber": 1,
      "source": {},
      "normalized": {},
      "resolutionStatus": "NORMALIZED",
      "errorMessage": null,
      "fieldSources": {},
      "fieldConfidences": {},
      "warnings": [],
      "reviewMeta": {}
    }
  ]
}
```

## Commit response (data)
```json
{
  "importId": "imp_123",
  "status": "committed",
  "createdSnapshotId": "snp_123",
  "affectedPositions": 12,
  "nextStep": "/history/snapshots"
}
```

## Rules
- start não persiste posição final
- preview vem antes do commit
- conflito exige decisão explícita
- commit deve poder gerar snapshot
