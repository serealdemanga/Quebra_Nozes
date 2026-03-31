# History contract

## Route
`GET /v1/history/snapshots`

## Response shape
```json
{
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-03-31T01:00:00Z",
    "version": "v1"
  },
  "data": {
    "snapshots": [
      {
        "snapshotId": "snap_1",
        "referenceDate": "2026-03-31",
        "totalEquity": 21276.84,
        "totalInvested": 20742.58,
        "totalProfitLoss": 534.26,
        "totalProfitLossPct": 2.58
      }
    ],
    "events": [
      {
        "eventId": "event_1",
        "type": "seed_created",
        "status": "ok",
        "message": "Carteira demo criada com snapshot inicial.",
        "occurredAt": "2026-03-31T01:00:00Z"
      }
    ]
  }
}
```

## Rules
- quando houver só um snapshot, a UI deve explicar que ainda não há comparação útil
- eventos ajudam a dar contexto à linha do tempo
- histórico não deve virar log morto sem leitura humana
