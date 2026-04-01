import type { Env } from '../types/env';
import { getPortfolioData } from '../lib/portfolio_service';
import { ok } from '../lib/http';

export async function getPortfolio(request: Request, env: Env): Promise<Response> {
  return await getPortfolioData(request, env);
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
