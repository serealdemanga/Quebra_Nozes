# SQL por rota — Importação manual

## Import start — sessão com gate de onboarding
```sql
SELECT
  s.user_id AS userId,
  p.id AS portfolioId,
  CASE
    WHEN c.financial_goal IS NOT NULL AND c.financial_goal <> ''
     AND COALESCE(c.risk_profile_effective, c.risk_profile) IS NOT NULL
     AND COALESCE(c.risk_profile_effective, c.risk_profile) <> ''
    THEN 1
    ELSE 0
  END AS hasContext
FROM auth_sessions s
LEFT JOIN portfolios p ON p.user_id = s.user_id AND p.is_primary = 1
LEFT JOIN user_financial_context c ON c.user_id = s.user_id
WHERE s.session_token_hash = ?
  AND s.revoked_at IS NULL
  AND s.expires_at > CURRENT_TIMESTAMP
LIMIT 1;
```

## Import start — criar import
```sql
INSERT INTO imports (
  id, user_id, portfolio_id, status, origin, total_rows, valid_rows, invalid_rows, duplicate_rows, created_at, started_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

## Import start — substituir linhas do preview
```sql
DELETE FROM import_rows WHERE import_id = ?;
```

```sql
INSERT INTO import_rows (
  id, import_id, row_number, source_payload_json, normalized_payload_json, resolution_status, error_message, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
```

## Import preview — ler import
```sql
SELECT id, user_id, portfolio_id, status, origin, total_rows, valid_rows, invalid_rows, duplicate_rows
FROM imports
WHERE id = ?
LIMIT 1;
```

## Import preview — ler linhas
```sql
SELECT id, row_number, source_payload_json, normalized_payload_json, resolution_status, error_message
FROM import_rows
WHERE import_id = ?
ORDER BY row_number ASC;
```

## Import start — checar duplicidade na carteira ativa
```sql
SELECT
  pp.asset_id,
  a.code AS asset_code,
  a.name AS asset_name,
  pp.quantity,
  pp.invested_amount,
  pp.current_amount
FROM portfolio_positions pp
JOIN assets a ON a.id = pp.asset_id
WHERE pp.portfolio_id = ?
  AND pp.status = 'active'
  AND (
    a.normalized_name = ?
    OR (? <> '' AND a.code = ?)
  );
```

## Import commit — buscar tipo de ativo
```sql
SELECT id, code, name FROM asset_types WHERE code = ? LIMIT 1;
```

## Import commit — buscar ativo existente
```sql
SELECT id, code, name
FROM assets
WHERE normalized_name = ? OR (? <> '' AND code = ?)
LIMIT 1;
```

## Import commit — criar ativo customizado
```sql
INSERT INTO assets (id, asset_type_id, code, name, normalized_name, is_custom, created_at)
VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP);
```

## Import commit — criar posição
```sql
INSERT INTO portfolio_positions (
  id, portfolio_id, asset_id, source_kind, status, quantity, average_price, current_price, invested_amount, current_amount, category_label, notes, created_at, updated_at
) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

## Import commit — criar snapshot
```sql
INSERT INTO portfolio_snapshots (
  id, portfolio_id, import_id, reference_date, total_equity, total_invested, total_profit_loss, total_profit_loss_pct, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
```

## Import commit — criar snapshot positions
```sql
INSERT INTO portfolio_snapshot_positions (
  id, snapshot_id, asset_id, quantity, unit_price, current_value, created_at
) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
```

## Import commit — fechar import
```sql
UPDATE imports
SET status = ?,
    total_rows = ?,
    valid_rows = ?,
    invalid_rows = ?,
    duplicate_rows = ?,
    finished_at = CURRENT_TIMESTAMP
WHERE id = ?;
```
