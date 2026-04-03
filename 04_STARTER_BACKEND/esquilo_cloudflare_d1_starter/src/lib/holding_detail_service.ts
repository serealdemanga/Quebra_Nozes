import type { Env } from '../types/env';
import { ok, fail } from './http';
import { hashToken } from './auth_crypto';
import { buildRanking, buildRecommendation } from './holding_ranking';
import {
  findHoldingSessionStateByTokenHash,
  findHoldingDetailById,
  findCategoryAggregate,
  findPortfolioAggregate,
  findLatestPortfolioAnalysis
} from '../repositories/holding_detail_repository';

const AUTH_COOKIE_NAME = 'esquilo_session';

export async function getHoldingDetailData(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const token = readCookie(request.headers.get('cookie') || '', AUTH_COOKIE_NAME);
  if (!token) return fail(env.API_VERSION, 'unauthorized', 'Sessao nao encontrada.', 401);

  const tokenHash = await hashToken(token);
  const session = await findHoldingSessionStateByTokenHash(env, tokenHash);
  if (!session) return fail(env.API_VERSION, 'unauthorized', 'Sessao invalida.', 401);
  if (!session.hasContext) {
    return ok(env.API_VERSION, { screenState: 'redirect_onboarding', redirectTo: '/onboarding' });
  }
  if (!session.portfolioId) {
    return fail(env.API_VERSION, 'portfolio_not_found', 'Carteira principal nao encontrada.', 404);
  }
  if (params.portfolioId !== session.portfolioId) {
    return fail(env.API_VERSION, 'portfolio_mismatch', 'Acesso invalido para esta carteira.', 403);
  }

  const holding = await findHoldingDetailById(env, session.portfolioId, params.holdingId);
  if (!holding) return fail(env.API_VERSION, 'holding_not_found', 'Ativo nao encontrado.', 404);

  const categoryKey = normalizeCategoryKey(holding.category_label, holding.asset_type_code);
  const categoryLabel = normalizeCategoryLabel(holding.category_label, holding.asset_type_name, holding.asset_type_code);
  const categoryAggregate = await findCategoryAggregate(env, session.portfolioId, categoryKey);
  const portfolioAggregate = await findPortfolioAggregate(env, session.portfolioId);
  const latestAnalysis = await findLatestPortfolioAnalysis(env, session.portfolioId);

  const investedAmount = Number(holding.invested_amount || 0);
  const currentValue = Number(holding.current_amount || 0);
  const currentPrice = holding.current_price == null ? null : Number(holding.current_price);
  const averagePrice = Number(holding.average_price || 0);
  const performanceValue = currentValue - investedAmount;
  const performancePct = investedAmount > 0 ? (performanceValue / investedAmount) * 100 : null;
  const portfolioTotal = Number(portfolioAggregate?.total_current || 0);
  const allocationPct = portfolioTotal > 0 ? (currentValue / portfolioTotal) * 100 : 0;

  const ranking = buildRanking({ allocationPct, performancePct, hasQuote: currentPrice != null });
  const recommendation = buildRecommendation({ allocationPct, performancePct, hasQuote: currentPrice != null, analysisAction: latestAnalysis?.primary_action || '' });
  const categoryContext = buildCategoryContext({
    categoryKey,
    categoryLabel,
    categoryAggregate,
    latestAnalysis
  });

  return ok(env.API_VERSION, {
    holding: {
      id: holding.id,
      assetId: holding.asset_id,
      code: holding.code || '',
      name: holding.name,
      categoryKey,
      categoryLabel,
      platformId: holding.platform_id || '',
      platformName: holding.platform_name || '',
      quantity: Number(holding.quantity || 0),
      averagePrice,
      currentPrice,
      currentValue,
      investedAmount,
      performanceValue,
      performancePct,
      allocationPct,
      recommendation: recommendation.title,
      statusLabel: currentPrice == null ? 'Sem cotacao atual' : 'Cotacao disponivel',
      quotationStatus: currentPrice == null ? 'missing_quote' : 'priced',
      notes: holding.notes || '',
      stopLoss: holding.stop_loss == null ? null : Number(holding.stop_loss),
      targetPrice: holding.target_price == null ? null : Number(holding.target_price),
      sourceKind: holding.source_kind,
      assetTypeCode: holding.asset_type_code || ''
    },
    ranking,
    recommendation,
    categoryContext,
    externalLink: buildExternalLink(holding.asset_type_code || '', holding.code || '')
  });
}

function buildCategoryContext(input: any) {
  const totalCurrent = Number(input.categoryAggregate?.total_current || 0);
  const totalInvested = Number(input.categoryAggregate?.total_invested || 0);
  const profitLoss = totalCurrent - totalInvested;
  const profitLossPct = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : null;

  return {
    categoryKey: input.categoryKey,
    categoryLabel: input.categoryLabel,
    categoryRisk: profitLossPct != null && profitLossPct < -10 ? 'Pressionada' : profitLossPct != null && profitLossPct > 10 ? 'Saudavel' : 'Neutra',
    categoryRecommendation: input.latestAnalysis?.primary_action || 'Sem recomendacao consolidada especifica',
    primaryMessage: input.latestAnalysis?.summary_text || 'Contexto construído a partir da categoria e da analise consolidada da carteira.',
    holdingsCount: Number(input.categoryAggregate?.holdings_count || 0),
    totalCurrent,
    totalInvested,
    totalProfitLoss: profitLoss,
    totalProfitLossPct: profitLossPct
  };
}

function buildExternalLink(assetTypeCode: string, code: string): string {
  const normalizedType = (assetTypeCode || '').toUpperCase();
  if (normalizedType === 'STOCK' && code) {
    return `https://www.google.com/finance/quote/${encodeURIComponent(code)}:BVMF`;
  }
  return '';
}

function normalizeCategoryKey(categoryLabel: unknown, assetTypeCode: unknown): string {
  const label = typeof categoryLabel === 'string' ? categoryLabel.trim().toLowerCase() : '';
  const code = typeof assetTypeCode === 'string' ? assetTypeCode.trim().toLowerCase() : '';
  return label || code || 'outros';
}

function normalizeCategoryLabel(categoryLabel: unknown, assetTypeName: unknown, assetTypeCode: unknown): string {
  const label = typeof categoryLabel === 'string' ? categoryLabel.trim() : '';
  const name = typeof assetTypeName === 'string' ? assetTypeName.trim() : '';
  const code = typeof assetTypeCode === 'string' ? assetTypeCode.trim() : '';
  return label || name || code || 'Outros';
}

function readCookie(cookieHeader: string, cookieName: string): string {
  const prefix = `${cookieName}=`;
  const match = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}
