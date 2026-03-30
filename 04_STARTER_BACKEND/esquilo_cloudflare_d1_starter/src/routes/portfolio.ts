import type { Env } from '../types/env';
import { ok } from '../lib/http';

export async function getPortfolio(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const portfolioId = url.searchParams.get('portfolioId') ?? 'primary';

  return ok(env.API_VERSION, {
    portfolioId,
    summary: {
      totalEquity: 0,
      totalInvested: 0,
      totalProfitLoss: 0,
      totalProfitLossPct: 0,
      statusLabel: 'Em leitura'
    },
    groups: [],
    orders: []
  });
}

export async function getHoldingDetail(_request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  return ok(env.API_VERSION, {
    holding: {
      id: params.holdingId,
      assetId: '',
      code: '',
      name: 'Ativo em leitura',
      categoryKey: '',
      platformId: '',
      platformName: '',
      quantity: 0,
      averagePrice: 0,
      currentPrice: 0,
      currentValue: 0,
      investedAmount: 0,
      performancePct: 0,
      allocationPct: 0,
      recommendation: 'Monitorar',
      statusLabel: 'Sem leitura'
    },
    ranking: {
      score: 0,
      status: 'Em leitura',
      motives: [],
      opportunityScore: 0
    },
    categoryContext: {
      categoryKey: '',
      categoryLabel: '',
      categoryRisk: '',
      categoryRecommendation: '',
      primaryMessage: ''
    },
    externalLink: ''
  });
}
