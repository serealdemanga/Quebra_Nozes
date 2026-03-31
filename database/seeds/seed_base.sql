-- Seed base inicial do Quebra_Nozes

INSERT INTO users (id, display_name, email)
VALUES ('user_demo', 'Usuário Demo', 'demo@example.com');

INSERT INTO user_financial_context (
  user_id,
  financial_goal,
  monthly_income_range,
  monthly_investment_target,
  available_to_invest,
  risk_profile,
  investment_horizon,
  platforms_used_json,
  display_preferences_json
)
VALUES (
  'user_demo',
  'equilibrar e crescer',
  '10k-15k',
  1000,
  500,
  'moderado',
  'longo_prazo',
  '["xp","ion"]',
  '{"ghostMode":false}'
);

INSERT INTO platforms (id, code, name) VALUES
('platform_xp', 'xp', 'XP Investimentos'),
('platform_ion', 'ion', 'Íon Itaú');

INSERT INTO asset_types (id, code, name) VALUES
('type_stock', 'STOCK', 'Ações'),
('type_fund', 'FUND', 'Fundos'),
('type_pension', 'PENSION', 'Previdência');

INSERT INTO assets (id, asset_type_id, code, name) VALUES
('asset_itsa4', 'type_stock', 'ITSA4', 'Itaúsa'),
('asset_cmin3', 'type_stock', 'CMIN3', 'CSN Mineração'),
('asset_fund_demo', 'type_fund', NULL, 'Fundo Multimercado Demo'),
('asset_pension_demo', 'type_pension', NULL, 'Previdência Demo');

INSERT INTO portfolios (id, user_id, name, base_currency, status)
VALUES ('portfolio_main', 'user_demo', 'Carteira Principal', 'BRL', 'active');

INSERT INTO portfolio_positions (
  id, portfolio_id, asset_id, platform_id, source_kind, status,
  quantity, average_price, current_price, invested_amount, current_value, reference_date
) VALUES
('pos_1', 'portfolio_main', 'asset_itsa4', 'platform_xp', 'manual', 'active', 27, 13.84, 14.52, 373.68, 392.04, '2026-03-31'),
('pos_2', 'portfolio_main', 'asset_cmin3', 'platform_xp', 'manual', 'active', 62, 5.95, 5.40, 368.90, 334.80, '2026-03-31'),
('pos_3', 'portfolio_main', 'asset_fund_demo', 'platform_xp', 'manual', 'active', 1, 5000.00, 5200.00, 5000.00, 5200.00, '2026-03-31'),
('pos_4', 'portfolio_main', 'asset_pension_demo', 'platform_ion', 'manual', 'active', 1, 15000.00, 15350.00, 15000.00, 15350.00, '2026-03-31');

INSERT INTO portfolio_snapshots (
  id, portfolio_id, reference_date, total_equity, total_invested, total_profit_loss, total_profit_loss_pct, source_kind
) VALUES
('snap_1', 'portfolio_main', '2026-03-31', 21276.84, 20742.58, 534.26, 2.58, 'manual');

INSERT INTO portfolio_snapshot_positions (
  id, snapshot_id, asset_id, quantity, average_price, current_price, invested_amount, current_value, performance_pct, allocation_pct
) VALUES
('snap_pos_1', 'snap_1', 'asset_itsa4', 27, 13.84, 14.52, 373.68, 392.04, 4.92, 1.84),
('snap_pos_2', 'snap_1', 'asset_cmin3', 62, 5.95, 5.40, 368.90, 334.80, -9.24, 1.57),
('snap_pos_3', 'snap_1', 'asset_fund_demo', 1, 5000.00, 5200.00, 5000.00, 5200.00, 4.00, 24.44),
('snap_pos_4', 'snap_1', 'asset_pension_demo', 1, 15000.00, 15350.00, 15000.00, 15350.00, 2.33, 72.15);

INSERT INTO portfolio_analyses (
  id, portfolio_id, snapshot_id, scope, score_value, score_status, summary_text,
  primary_problem, primary_action, recommendation_tag, recommendation_target_type,
  recommendation_target_id, recommendation_title, recommendation_body
) VALUES (
  'analysis_1',
  'portfolio_main',
  'snap_1',
  'portfolio',
  72,
  'atencao_moderada',
  'Sua carteira está funcional, mas concentrada demais em previdência.',
  'O principal ponto de atenção hoje é a concentração excessiva em um único bloco.',
  'Diluir concentração aos poucos.',
  'REDUCE_CONCENTRATION',
  'category',
  'PENSION',
  'Diluir concentração aos poucos',
  'Use novos aportes para abrir mais equilíbrio fora da previdência.'
);

INSERT INTO analysis_insights (
  id, analysis_id, insight_kind, title, body, severity, sort_order, related_category_code
) VALUES
('insight_1', 'analysis_1', 'concentration', 'Previdência pesa demais', 'Sua proteção virou bloco grande demais dentro da carteira.', 'warning', 1, 'PENSION'),
('insight_2', 'analysis_1', 'balance', 'Ações ainda têm pouco peso', 'Há espaço para crescimento ganhar mais relevância ao longo do tempo.', 'info', 2, 'STOCK');

INSERT INTO operational_events (
  id, portfolio_id, event_type, event_status, message
) VALUES
('event_1', 'portfolio_main', 'seed_created', 'ok', 'Carteira demo criada com snapshot inicial.');
