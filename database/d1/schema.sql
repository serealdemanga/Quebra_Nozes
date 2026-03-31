-- Esquilo Invest / Quebra_Nozes
-- Schema inicial do D1

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_financial_context (
  user_id TEXT PRIMARY KEY,
  financial_goal TEXT,
  monthly_income_range TEXT,
  monthly_investment_target REAL,
  available_to_invest REAL,
  risk_profile TEXT,
  investment_horizon TEXT,
  platforms_used_json TEXT,
  display_preferences_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_types (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  asset_type_id TEXT NOT NULL,
  code TEXT,
  name TEXT NOT NULL,
  external_code TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
);

CREATE TABLE IF NOT EXISTS portfolios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS portfolio_positions (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  platform_id TEXT,
  source_kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  quantity REAL,
  average_price REAL,
  current_price REAL,
  invested_amount REAL,
  current_value REAL,
  notes TEXT,
  reference_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL,
  reference_date TEXT NOT NULL,
  total_equity REAL,
  total_invested REAL,
  total_profit_loss REAL,
  total_profit_loss_pct REAL,
  source_kind TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
);

CREATE TABLE IF NOT EXISTS portfolio_snapshot_positions (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  quantity REAL,
  average_price REAL,
  current_price REAL,
  invested_amount REAL,
  current_value REAL,
  performance_pct REAL,
  allocation_pct REAL,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (snapshot_id) REFERENCES portfolio_snapshots(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE TABLE IF NOT EXISTS imports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  portfolio_id TEXT NOT NULL,
  source_platform_id TEXT,
  source_kind TEXT NOT NULL,
  file_name TEXT,
  file_hash TEXT,
  status TEXT NOT NULL,
  total_rows INTEGER DEFAULT 0,
  valid_rows INTEGER DEFAULT 0,
  invalid_rows INTEGER DEFAULT 0,
  duplicate_rows INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
);

CREATE TABLE IF NOT EXISTS import_rows (
  id TEXT PRIMARY KEY,
  import_id TEXT NOT NULL,
  row_number INTEGER NOT NULL,
  status TEXT NOT NULL,
  raw_row_json TEXT,
  normalized_row_json TEXT,
  validation_errors_json TEXT,
  dedup_key TEXT,
  conflict_summary_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_id) REFERENCES imports(id)
);

CREATE TABLE IF NOT EXISTS portfolio_analyses (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL,
  snapshot_id TEXT,
  scope TEXT NOT NULL,
  score_value REAL,
  score_status TEXT,
  summary_text TEXT,
  primary_problem TEXT,
  primary_action TEXT,
  recommendation_tag TEXT,
  recommendation_target_type TEXT,
  recommendation_target_id TEXT,
  recommendation_title TEXT,
  recommendation_body TEXT,
  warnings_json TEXT,
  ai_context_used_json TEXT,
  raw_ai_response TEXT,
  generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
  FOREIGN KEY (snapshot_id) REFERENCES portfolio_snapshots(id)
);

CREATE TABLE IF NOT EXISTS analysis_insights (
  id TEXT PRIMARY KEY,
  analysis_id TEXT NOT NULL,
  insight_kind TEXT,
  title TEXT,
  body TEXT,
  severity TEXT,
  sort_order INTEGER DEFAULT 0,
  related_asset_id TEXT,
  related_category_code TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (analysis_id) REFERENCES portfolio_analyses(id)
);

CREATE TABLE IF NOT EXISTS operational_events (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT,
  event_type TEXT NOT NULL,
  event_status TEXT NOT NULL,
  message TEXT,
  details_json TEXT,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_positions_portfolio ON portfolio_positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_portfolio ON portfolio_snapshots(portfolio_id, reference_date);
CREATE INDEX IF NOT EXISTS idx_snapshot_positions_snapshot ON portfolio_snapshot_positions(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_import_rows_import ON import_rows(import_id, row_number);
CREATE INDEX IF NOT EXISTS idx_portfolio_analyses_portfolio ON portfolio_analyses(portfolio_id, generated_at);
CREATE INDEX IF NOT EXISTS idx_operational_events_portfolio ON operational_events(portfolio_id, occurred_at);
