# SQL por rota — Análise consolidada

## Analysis — sessão com gate de onboarding
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

## Analysis — última análise consolidada da carteira
```sql
SELECT
  id,
  portfolio_id,
  snapshot_id,
  score_value,
  score_status,
  primary_problem,
  primary_action,
  portfolio_decision,
  action_plan_text,
  summary_text,
  messaging_json,
  generated_at
FROM portfolio_analyses
WHERE portfolio_id = ?
ORDER BY generated_at DESC
LIMIT 1;
```

## Analysis — insights priorizados
```sql
SELECT
  insight_type,
  title,
  message,
  priority
FROM analysis_insights
WHERE analysis_id = ?
ORDER BY priority ASC, created_at ASC;
```
