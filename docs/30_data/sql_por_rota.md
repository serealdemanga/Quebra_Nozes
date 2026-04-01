# SQL por rota — Histórico / Snapshots

## History — sessão com gate de onboarding
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

## History — snapshots da carteira
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
ORDER BY reference_date DESC, created_at DESC;
```

## History — selo simples da última análise por snapshot
```sql
SELECT
  pa.snapshot_id,
  pa.score_status,
  pa.primary_problem,
  pa.primary_action
FROM portfolio_analyses pa
JOIN (
  SELECT snapshot_id, MAX(generated_at) AS latest_generated_at
  FROM portfolio_analyses
  WHERE portfolio_id = ?
  GROUP BY snapshot_id
) latest
  ON latest.snapshot_id = pa.snapshot_id
 AND latest.latest_generated_at = pa.generated_at
WHERE pa.portfolio_id = ?;
```
