# SQL por rota

## Auth register — checar conflito
```sql
SELECT id, cpf, email
FROM users
WHERE cpf = ? OR email = ?
LIMIT 1;
```

## Auth register — criar usuário
```sql
INSERT INTO users (
  id,
  cpf,
  email,
  password_hash,
  display_name,
  email_verification_sent_at,
  status,
  created_at,
  updated_at
) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

## Auth register — criar carteira primária
```sql
INSERT INTO portfolios (
  id,
  user_id,
  name,
  is_primary,
  created_at,
  updated_at
) VALUES (?, ?, 'Carteira Principal', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

## Auth login — buscar usuário por identificador
```sql
SELECT
  id,
  cpf,
  email,
  password_hash,
  display_name,
  email_verified_at,
  failed_login_attempts,
  login_locked_until,
  status
FROM users
WHERE cpf = ? OR email = ?
LIMIT 1;
```

## Auth login — registrar falha
```sql
UPDATE users
SET
  failed_login_attempts = failed_login_attempts + 1,
  login_locked_until = CASE
    WHEN failed_login_attempts + 1 >= 5 THEN ?
    ELSE login_locked_until
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

## Auth login — limpar falha após sucesso
```sql
UPDATE users
SET
  failed_login_attempts = 0,
  login_locked_until = NULL,
  last_login_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

## Auth session — criar sessão
```sql
INSERT INTO auth_sessions (
  id,
  user_id,
  session_token_hash,
  device_fingerprint,
  user_agent,
  ip_address,
  remember_device,
  expires_at,
  created_at,
  last_seen_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

## Auth session — ler sessão atual
```sql
SELECT
  s.id,
  s.user_id,
  s.remember_device,
  s.expires_at,
  s.revoked_at,
  u.email_verified_at
FROM auth_sessions s
JOIN users u ON u.id = s.user_id
WHERE s.session_token_hash = ?
LIMIT 1;
```

## Auth logout — revogar sessão
```sql
UPDATE auth_sessions
SET
  revoked_at = CURRENT_TIMESTAMP,
  revoke_reason = 'logout'
WHERE session_token_hash = ?
  AND revoked_at IS NULL;
```

## Auth recover — criar pedido por e-mail
```sql
INSERT INTO auth_recovery_requests (
  id,
  user_id,
  channel,
  status,
  token_hash,
  delivery_provider,
  expires_at,
  created_at
) VALUES (?, ?, 'EMAIL', 'PENDING', ?, 'APPS_SCRIPT', ?, CURRENT_TIMESTAMP);
```

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
  pp.current_amount
FROM portfolio_positions pp
JOIN assets a ON a.id = pp.asset_id
JOIN asset_types at ON at.id = a.asset_type_id
LEFT JOIN platforms p ON p.id = pp.platform_id
WHERE pp.portfolio_id = ?
  AND pp.status = 'active'
ORDER BY pp.current_amount DESC;
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
  pp.current_amount,
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
A camada de repositório concentra o SQL.
As rotas não espalham query na mão.
Cada tela deve usar um conjunto de queries coerente com o seu fluxo.
