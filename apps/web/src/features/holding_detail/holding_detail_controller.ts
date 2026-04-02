import type { ApiHoldingDetailEnvelope, HoldingDetailData, HoldingDetailDataReady } from '../../core/data/contracts';
import type { HoldingDetailDataSource } from '../../core/data/data_sources';
import { createRouter, type Router } from '../../core/router';

export type HoldingDetailViewModel =
  | { kind: 'redirect_onboarding'; redirectTo: string }
  | {
      kind: 'ready';
      holding: HoldingDetailDataReady['holding'];
      ranking: HoldingDetailDataReady['ranking'];
      recommendation: HoldingDetailDataReady['recommendation'];
      categoryContext: HoldingDetailDataReady['categoryContext'];
      externalLink: string | null;
      targets: {
        backToPortfolio: { pathname: string };
      };
    }
  | { kind: 'error'; code?: string; message?: string };

export interface HoldingDetailControllerResult {
  envelope: ApiHoldingDetailEnvelope;
  viewModel: HoldingDetailViewModel;
}

export interface HoldingDetailController {
  load(input: { portfolioId: string; holdingId: string }): Promise<HoldingDetailControllerResult>;
}

/**
 * Controller headless do detalhe:
 * - centraliza leitura do contrato do backend novo
 * - suporta redirect_onboarding
 * - expõe target de navegacao de volta para Carteira
 */
export function createHoldingDetailController(input: { holdingDetail: HoldingDetailDataSource; router?: Router }): HoldingDetailController {
  const ds = input.holdingDetail;
  const router = input.router ?? createRouter();

  return {
    async load(params) {
      const envelope = await ds.getHoldingDetail(params);
      if (!envelope.ok) {
        return { envelope, viewModel: { kind: 'error', code: envelope.error.code, message: envelope.error.message } };
      }

      const data = envelope.data as HoldingDetailData;
      if ('screenState' in data && data.screenState === 'redirect_onboarding') {
        return { envelope, viewModel: { kind: 'redirect_onboarding', redirectTo: data.redirectTo || '/onboarding' } };
      }

      const ready = data as HoldingDetailDataReady;
      return {
        envelope,
        viewModel: {
          kind: 'ready',
          holding: ready.holding,
          ranking: ready.ranking,
          recommendation: ready.recommendation,
          categoryContext: ready.categoryContext,
          externalLink: ready.externalLink ?? null,
          targets: {
            backToPortfolio: { pathname: router.build({ id: 'portfolio' }) }
          }
        }
      };
    }
  };
}
