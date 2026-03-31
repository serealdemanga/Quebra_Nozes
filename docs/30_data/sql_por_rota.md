# SQL por rota

## Health
```sql
SELECT 1 AS ok;
```

## Contexto do usuário
```sql
SELECT
  u.id AS user_id,
  u.display_name,
  c.financial_goal,
  c.monthly_income_range,
  c.monthly_investment_target,
  c.available_to_invest,
  c.risk_profile,
  c.investment_horizon,
  c.platforms_used_json,
  c.display_preferences_json
FROM users u
LEFT JOIN user_financial_context c ON c.user_id = u.id
WHERE u.id = ?;
```

## Home — último snapshot
```sql
SELECT
  s.id,
  s.portfolio_id,
  s.reference_date,
  s.total_equity,
  s.total_invested,
  s.total_profit_loss,
  s.total_profit_loss_pct,
  s.created_at
FROM portfolio_snapshots s
WHERE s.portfolio_id = ?
ORDER BY s.reference_date DESC, s.created_at DESC
LIMIT 1;
```

## Home — distribuição por categoria
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

## Home — última análise
```sql
SELECT
  pa.id,
  pa.score_value,
  pa.score_status,
  pa.primary_problem,
  pa.primary_action,
  pa.summary_text,
  pa.generated_at
FROM portfolio_analyses pa
WHERE pa.snapshot_id = ?
ORDER BY pa.generated_at DESC
LIMIT 1;
```

## Carteira
```sql
SELECT
  pp.id,
  pp.portfolio_id,
  a.id AS asset_id,
  a.code,
  a.name,
  at.code AS category_code,
  at.name AS category_name,
  p.id AS platform_id,
  p.name AS platform_name,
  pp.quantity,
  pp.average_price,
  pp.current_price,
  pp.invested_amount,
  pp.current_value
FROM portfolio_positions pp
JOIN assets a ON a.id = pp.asset_id
JOIN asset_types at ON at.id = a.asset_type_id
LEFT JOIN platforms p ON p.id = pp.platform_id
WHERE pp.portfolio_id = ?
  AND pp.status = 'active'
ORDER BY pp.current_value DESC;
```

## Detalhe do ativo
```sql
SELECT
  pp.id,
  pp.portfolio_id,
  a.id AS asset_id,
  a.code,
  a.name,
  at.code AS category_code,
  at.name AS category_name,
  pp.quantity,
  pp.average_price,
  pp.current_price,
  pp.invested_amount,
  pp.current_value,
  pp.notes
FROM portfolio_positions pp
JOIN assets a ON a.id = pp.asset_id
JOIN asset_types at ON at.id = a.asset_type_id
WHERE pp.portfolio_id = ?
  AND pp.id = ?
LIMIT 1;
```

## Histórico
```sql
SELECT
  s.id,
  s.portfolio_id,
  s.reference_date,
  s.total_equity,
  s.total_invested,
  s.total_profit_loss,
  s.total_profit_loss_pct,
  s.created_at
FROM portfolio_snapshots s
WHERE s.portfolio_id = ?
ORDER BY s.reference_date DESC, s.created_at DESC
LIMIT ?;
```

## Import preview
```sql
SELECT
  i.id,
  i.status,
  i.total_rows,
  i.valid_rows,
  i.invalid_rows,
  i.duplicate_rows
FROM imports i
WHERE i.id = ?;
```

## Regra
A camada de repositório deve concentrar o SQL.
As rotas não devem espalhar query na mão.
