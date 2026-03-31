# Imports contract

## Routes
- `POST /v1/imports/start`
- `GET /v1/imports/{importId}/preview`
- `POST /v1/imports/{importId}/commit`

## Start response
```json
{
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-03-31T01:00:00Z",
    "version": "v1"
  },
  "data": {
    "importId": "import_123",
    "status": "processing"
  }
}
```

## Preview response
```json
{
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-03-31T01:00:00Z",
    "version": "v1"
  },
  "data": {
    "importId": "import_123",
    "status": "preview_ready",
    "totals": {
      "totalRows": 10,
      "validRows": 8,
      "invalidRows": 1,
      "duplicateRows": 1
    },
    "rows": []
  }
}
```

## Commit response
```json
{
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-03-31T01:00:00Z",
    "version": "v1"
  },
  "data": {
    "importId": "import_123",
    "status": "committed",
    "snapshotId": "snap_2"
  }
}
```

## Rules
- start não persiste posição final
- preview vem antes do commit
- conflito exige decisão explícita
- commit deve poder gerar snapshot
