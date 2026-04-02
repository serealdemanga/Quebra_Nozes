import type { Env } from '../types/env';
import { ok, fail } from './http';
import { hashToken } from './auth_crypto';
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

function buildRanking(input: { allocationPct: number; performancePct: number | null; hasQuote: boolean }) {
  let score = 70;
  const motives: string[] = [];

  if (input.performancePct != null) {
    if (input.performancePct > 15) {
      score += 10;
      motives.push('Boa performance relativa dentro da carteira');
    } else if (input.performancePct < -10) {
      score -= 20;
      motives.push('Performance fraca em relacao ao preco medio');
    }
  }

  if (input.allocationPct > 20) {
    score -= 15;
    motives.push('Peso elevado dentro da carteira');
  } else if (input.allocationPct > 8) {
    score += 5;
    motives.push('Peso relevante na composicao da carteira');
  }

  if (!input.hasQuote) {
    score -= 25;
    motives.push('Ativo sem cotacao atual');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    score,
    status: score >= 75 ? 'Atrativo' : score >= 50 ? 'Neutro' : 'Atenção',
    motives,
    opportunityScore: Math.max(0, Math.min(100, score - (input.allocationPct > 20 ? 10 : 0)))
  };
}

function buildRecommendation(input: { allocationPct: number; performancePct: number | null; hasQuote: boolean; analysisAction: string }) {
  if (!input.hasQuote) {
    return {
      code: 'monitor_without_quote',
      title: 'Monitorar sem cotacao',
      body: 'O ativo continua visivel, mas sem cotacao atual a leitura fica incompleta. Revise a origem dos dados antes de decidir.'
    };
  }
  if (input.performancePct != null && input.performancePct < -10 && input.allocationPct > 15) {
    return {
      code: 'review_exposure',
      title: 'Revisar exposicao',
      body: 'O ativo esta perdendo valor e ainda ocupa peso relevante na carteira. ' + appendAnalysisContext(input.analysisAction)
    };
  }
  if (input.performancePct != null && input.performancePct > 15 && input.allocationPct > 20) {
    return {
      code: 'protect_gain',
      title: 'Proteger ganho e rebalancear',
      body: 'Existe ganho acumulado e concentracao alta no ativo. ' + appendAnalysisContext(input.analysisAction)
    };
  }
  return {
    code: 'hold_and_monitor',
    title: 'Manter e monitorar',
    body: 'O ativo nao acendeu alerta critico isolado. ' + appendAnalysisContext(input.analysisAction)
  };
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

function appendAnalysisContext(action: string): string {
  return action ? `Contexto da carteira: ${action}.` : 'Use isso junto com a leitura consolidada da carteira.';
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
