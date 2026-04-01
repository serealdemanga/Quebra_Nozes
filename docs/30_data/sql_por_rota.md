# SQL por rota — Detalhe do ativo

## Holding detail — sessão com gate de onboarding
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

## Holding detail — ativo específico da carteira
```sql
SELECT
  pp.id,
  pp.portfolio_id,
  pp.asset_id,
  at.code AS asset_type_code,
  at.name AS asset_type_name,
  pp.source_kind,
  a.code,
  a.name,
  pp.category_label,
  p.id AS platform_id,
  p.name AS platform_name,
  pp.quantity,
  pp.average_price,
  pp.current_price,
  pp.current_amount,
  pp.invested_amount,
  pp.notes,
  pp.stop_loss,
  pp.target_price,
  pp.profitability
FROM portfolio_positions pp
JOIN assets a ON a.id = pp.asset_id
JOIN asset_types at ON at.id = a.asset_type_id
LEFT JOIN platforms p ON p.id = pp.platform_id
WHERE pp.portfolio_id = ?
  AND pp.id = ?
  AND pp.status = 'active'
LIMIT 1;
```

## Holding detail — agregado da categoria
```sql
SELECT
  COALESCE(NULLIF(LOWER(TRIM(pp.category_label)), ''), LOWER(TRIM(at.code)), 'outros') AS category_key,
  COALESCE(NULLIF(pp.category_label, ''), at.name, at.code, 'Outros') AS category_label,
  SUM(pp.current_amount) AS total_current,
  SUM(pp.invested_amount) AS total_invested,
  COUNT(*) AS holdings_count
FROM portfolio_positions pp
JOIN assets a ON a.id = pp.asset_id
JOIN asset_types at ON at.id = a.asset_type_id
WHERE pp.portfolio_id = ?
  AND pp.status = 'active'
GROUP BY category_key, category_label
HAVING category_key = ?
LIMIT 1;
```

## Holding detail — total da carteira
```sql
SELECT SUM(current_amount) AS total_current
FROM portfolio_positions
WHERE portfolio_id = ?
  AND status = 'active';
```

## Holding detail — última análise consolidada da carteira
```sql
SELECT
  pa.id,
  pa.score_status,
  pa.primary_problem,
  pa.primary_action,
  pa.summary_text
FROM portfolio_analyses pa
WHERE pa.portfolio_id = ?
ORDER BY pa.generated_at DESC
LIMIT 1;
```
