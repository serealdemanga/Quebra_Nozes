import type {
  ApiPortfolioEnvelope,
  PortfolioData,
  PortfolioDataEmpty,
  PortfolioDataReady,
  PortfolioHolding,
  PortfolioGroup
} from '../../core/data/contracts';
import type { PortfolioDataSource } from '../../core/data/data_sources';
import { createRouter, type Router } from '../../core/router';

export type PortfolioLocalFilters = {
  categoryKey?: string;
  platformId?: string;
};

export type PortfolioQuery = {
  performance?: 'all' | 'best' | 'worst';
} & PortfolioLocalFilters;

export type PortfolioCategorySummary = {
  categoryKey: string;
  categoryLabel: string;
  totalCurrent: number;
  sharePct: number;
  holdingsCount: number;
};

export type PortfolioReadyViewModel = {
  kind: 'ready';
  portfolioId: string;
  summary: PortfolioDataReady['summary'];
  filters: PortfolioDataReady['filters'] & PortfolioLocalFilters;
  categories: PortfolioCategorySummary[];
  groups: PortfolioGroup[];
  holdings: PortfolioHolding[];
  targets: {
    toHoldingDetail(holdingId: string): { pathname: string };
  };
};

export type PortfolioEmptyViewModel = {
  kind: 'empty';
  portfolioId: string;
  emptyState: PortfolioDataEmpty['emptyState'];
};

export type PortfolioRedirectViewModel = {
  kind: 'redirect_onboarding';
  redirectTo: string;
};

export type PortfolioErrorViewModel = {
  kind: 'error';
  code?: string;
  message?: string;
};

export type PortfolioViewModel =
  | PortfolioReadyViewModel
  | PortfolioEmptyViewModel
  | PortfolioRedirectViewModel
  | PortfolioErrorViewModel;

export interface PortfolioControllerResult {
  envelope: ApiPortfolioEnvelope;
  viewModel: PortfolioViewModel;
}

export interface PortfolioController {
  load(query?: PortfolioQuery): Promise<PortfolioControllerResult>;
}

/**
 * Controller headless da Carteira:
 * - carrega `GET /v1/portfolio` (performance como query param quando houver)
 * - aplica filtros locais (categoria, plataforma) sem inventar contrato
 * - expõe agrupamento por categoria (US029) + target para detalhe
 */
export function createPortfolioController(input: { portfolio: PortfolioDataSource; router?: Router }): PortfolioController {
  const portfolio = input.portfolio;
  const router = input.router ?? createRouter();

  return {
    async load(query) {
      const performance = query?.performance;
      const envelope = await portfolio.getPortfolio(performance ? { performance } : undefined);
      if (!envelope.ok) {
        return {
          envelope,
          viewModel: { kind: 'error', code: envelope.error.code, message: envelope.error.message }
        };
      }

      const viewModel = buildViewModel(envelope.data, query ?? {}, router);
      return { envelope, viewModel };
    }
  };
}

function buildViewModel(data: PortfolioData, query: PortfolioQuery, router: Router): PortfolioViewModel {
  if (data.screenState === 'redirect_onboarding') {
    return { kind: 'redirect_onboarding', redirectTo: data.redirectTo || '/onboarding' };
  }

  if (data.screenState === 'empty') {
    return { kind: 'empty', portfolioId: data.portfolioId, emptyState: data.emptyState };
  }

  // ready
  const ready = data as PortfolioDataReady;
  const groups = applyLocalFilters(ready.groups, query);
  const holdings = groups.flatMap((g) => g.holdings);
  const categories = buildCategorySummaries(groups, ready.summary.totalEquity);

  return {
    kind: 'ready',
    portfolioId: ready.portfolioId,
    summary: ready.summary,
    filters: { ...ready.filters, categoryKey: query.categoryKey, platformId: query.platformId },
    categories,
    groups,
    holdings,
    targets: {
      toHoldingDetail(holdingId) {
        const pathname = router.build({ id: 'holding_detail', params: { portfolioId: ready.portfolioId, holdingId } });
        return { pathname };
      }
    }
  };
}

function applyLocalFilters(groups: PortfolioGroup[], query: PortfolioQuery): PortfolioGroup[] {
  const categoryKey = query.categoryKey;
  const platformId = query.platformId;
  if (!categoryKey && !platformId) return groups;

  return groups
    .filter((g) => !categoryKey || g.categoryKey === categoryKey)
    .map((g) => ({
      ...g,
      holdings: g.holdings.filter((h) => !platformId || h.platformId === platformId)
    }))
    .filter((g) => g.holdings.length > 0);
}

function buildCategorySummaries(groups: PortfolioGroup[], totalEquity: number): PortfolioCategorySummary[] {
  const eq = totalEquity > 0 ? totalEquity : 1;

  return groups
    .map((g) => ({
      categoryKey: g.categoryKey,
      categoryLabel: g.categoryLabel,
      totalCurrent: g.totalCurrent,
      sharePct: round2((g.totalCurrent / eq) * 100),
      holdingsCount: g.holdings.length
    }))
    .sort((a, b) => b.totalCurrent - a.totalCurrent);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

