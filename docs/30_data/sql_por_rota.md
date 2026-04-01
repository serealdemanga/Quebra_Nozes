# SQL por rota — Home

## Dashboard Home — sessão com gate de onboarding
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

## Dashboard Home — último snapshot
```sql
SELECT
  id,
  portfolio_id,
  reference_date,
  total_equity,
  total_invested,
  total_profit_loss,
  total_profit_loss_pct,
  created_at
FROM portfolio_snapshots
WHERE portfolio_id = ?
ORDER BY reference_date DESC, created_at DESC
LIMIT 1;
```

## Dashboard Home — distribuição por categoria
```sql
SELECT
  at.code AS category_code,
  at.name AS category_name,
  SUM(sp.current_value) AS total_value
FROM portfolio_snapshot_positions sp
JOIN assets a ON a.id = sp.asset_id
JOIN asset_types at ON at.id = a.asset_type_id
WHERE sp.snapshot_id = ?
GROUP BY at.code, at.name
ORDER BY total_value DESC;
```

## Dashboard Home — última análise do snapshot
```sql
SELECT
  id,
  score_value,
  score_status,
  primary_problem,
  primary_action,
  summary_text,
  generated_at
FROM portfolio_analyses
WHERE snapshot_id = ?
ORDER BY generated_at DESC
LIMIT 1;
```

## Dashboard Home — insights da análise
```sql
SELECT
  insight_type,
  title,
  message
FROM analysis_insights
WHERE analysis_id = ?
ORDER BY priority ASC, created_at ASC;
```
