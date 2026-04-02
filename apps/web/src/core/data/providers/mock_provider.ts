import type { AppDataSources } from '../data_sources';
import type {
  ApiAnalysisEnvelope,
  ApiHoldingDetailEnvelope,
  ApiPortfolioEnvelope,
  ApiHistorySnapshotsEnvelope,
  ApiHistoryTimelineEnvelope,
  ApiProfileContextGetEnvelope,
  ApiProfileContextPutEnvelope,
  ProfileContextPutRequest
} from '../contracts';
import type { JsonLoader } from '../types';

export interface MockProviderOptions {
  loader: JsonLoader;
  basePath?: string;
}

export function createLocalMockDataSources(options: MockProviderOptions): AppDataSources {
  const basePath = (options.basePath ?? 'apps/web/src/core/data/mock/local').replace(/\/+$/, '');
  const loader = options.loader;

  return {
    analysis: {
      async getAnalysis(): Promise<ApiAnalysisEnvelope> {
        return await loader.load<ApiAnalysisEnvelope>(`${basePath}/analysis.json`);
      }
    },
    history: {
      async getHistorySnapshots(): Promise<ApiHistorySnapshotsEnvelope> {
        return await loader.load<ApiHistorySnapshotsEnvelope>(`${basePath}/history_snapshots.json`);
      },
      async getHistoryTimeline(): Promise<ApiHistoryTimelineEnvelope> {
        return await loader.load<ApiHistoryTimelineEnvelope>(`${basePath}/history_timeline.json`);
      }
    },
    portfolio: {
      async getPortfolio(): Promise<ApiPortfolioEnvelope> {
        return await loader.load<ApiPortfolioEnvelope>(`${basePath}/portfolio.json`);
      }
    },
    holdingDetail: {
      async getHoldingDetail(): Promise<ApiHoldingDetailEnvelope> {
        return await loader.load<ApiHoldingDetailEnvelope>(`${basePath}/holding_detail_pos_1.json`);
      }
    },
    profile: {
      async getProfileContext(): Promise<ApiProfileContextGetEnvelope> {
        return await loader.load<ApiProfileContextGetEnvelope>(`${basePath}/profile_context.json`);
      },
      async putProfileContext(_input: ProfileContextPutRequest): Promise<ApiProfileContextPutEnvelope> {
        // Mock simples: reusa o GET como estado "persistido".
        const current = await loader.load<ApiProfileContextGetEnvelope>(`${basePath}/profile_context.json`);
        if (!current.ok) return current as unknown as ApiProfileContextPutEnvelope;

        const { backendHealth, ...rest } = current.data;
        return {
          ok: true,
          meta: current.meta,
          data: rest
        };
      }
    }
  };
}
