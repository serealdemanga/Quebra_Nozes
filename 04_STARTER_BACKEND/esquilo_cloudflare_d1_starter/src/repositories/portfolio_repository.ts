import type { Env } from '../types/env';

export interface PortfolioSessionState {
  userId: string;
  portfolioId: string | null;
  hasContext: number;
}

export interface PortfolioPositionRow {
  id: string;
  portfolio_id: string;
  asset_id: string;
  code: string | null;
  name: string;
  category_code: string | null;
  category_name: string | null;
  category_label: string | null;
  platform_id: string | null;
  platform_name: string | null;
  quantity: number | null;
  average_price: number | null;
  current_price: number | null;
  invested_amount: number | null;
  current_amount: number | null;
  status: string;
}

export async function findPortfolioSessionStateByTokenHash(env: Env, tokenHash: string): Promise<PortfolioSessionState | null> {
  return await env.DB.prepare(
    `SELECT
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
     LIMIT 1`
  ).bind(tokenHash).first<PortfolioSessionState>();
}

export async function findActivePortfolioPositions(env: Env, portfolioId: string): Promise<PortfolioPositionRow[]> {
  const result = await env.DB.prepare(
    `SELECT
       pp.id,
       pp.portfolio_id,
       a.id AS asset_id,
       a.code,
       a.name,
       at.code AS category_code,
       at.name AS category_name,
       pp.category_label,
       p.id AS platform_id,
       p.name AS platform_name,
       pp.quantity,
       pp.average_price,
       pp.current_price,
       pp.invested_amount,
       pp.current_amount,
       pp.status
     FROM portfolio_positions pp
     JOIN assets a ON a.id = pp.asset_id
     JOIN asset_types at ON at.id = a.asset_type_id
     LEFT JOIN platforms p ON p.id = pp.platform_id
     WHERE pp.portfolio_id = ?
       AND pp.status = 'active'
     ORDER BY pp.current_amount DESC, a.name ASC`
  ).bind(portfolioId).all<PortfolioPositionRow>();
  return result.results || [];
}
