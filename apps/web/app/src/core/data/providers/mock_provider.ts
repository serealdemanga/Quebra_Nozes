import type { AppDataSources } from "../data_sources";
import type {
  ApiAnalysisEnvelope,
  ApiDashboardHomeEnvelope,
  ApiHoldingDetailEnvelope,
  ApiPortfolioEnvelope,
  ApiHistorySnapshotsEnvelope,
  ApiHistoryTimelineEnvelope,
  ApiProfileContextGetEnvelope,
  ApiProfileContextPutEnvelope,
  ProfileContextPutRequest,
  ApiHealthEnvelope,
  ApiImportStartEnvelope,
  ApiImportPreviewEnvelope,
  ApiImportCommitEnvelope,
} from "../contracts";
import type { JsonLoader } from "../types";

export interface MockProviderOptions {
  loader: JsonLoader;
  basePath?: string;
}

export function createMockDataSources(options: MockProviderOptions): AppDataSources {
  const basePath = (options.basePath ?? "/src/core/data/mock/hml").replace(/\/+$/, "");
  const loader = options.loader;

  const isHml = basePath.includes("/mock/hml");

  return {
    dashboard: {
      async getDashboardHome(): Promise<ApiDashboardHomeEnvelope> {
        return await loader.load<ApiDashboardHomeEnvelope>(`${basePath}/dashboard_home.json`);
      },
    },
    health: {
      async getHealth(): Promise<ApiHealthEnvelope> {
        return await loader.load<ApiHealthEnvelope>(`${basePath}/health.json`);
      },
    },
    analysis: {
      async getAnalysis(): Promise<ApiAnalysisEnvelope> {
        return await loader.load<ApiAnalysisEnvelope>(`${basePath}/analysis.json`);
      },
    },
    history: {
      async getHistorySnapshots(): Promise<ApiHistorySnapshotsEnvelope> {
        return await loader.load<ApiHistorySnapshotsEnvelope>(`${basePath}/history_snapshots.json`);
      },
      async getHistoryTimeline(): Promise<ApiHistoryTimelineEnvelope> {
        return await loader.load<ApiHistoryTimelineEnvelope>(`${basePath}/history_timeline.json`);
      },
    },
    portfolio: {
      async getPortfolio(): Promise<ApiPortfolioEnvelope> {
        return await loader.load<ApiPortfolioEnvelope>(`${basePath}/portfolio.json`);
      },
    },
    holdingDetail: {
      async getHoldingDetail(input: { portfolioId: string; holdingId: string }): Promise<ApiHoldingDetailEnvelope> {
        if (!isHml) {
          return await loader.load<ApiHoldingDetailEnvelope>(`${basePath}/holding_detail_pos_1.json`);
        }

        // Mock deterministico por holdingId, para cobrir fundo/previdencia/acao sem UI real.
        const holdingId = input.holdingId;
        const file =
          holdingId === "pos_bal_3"
            ? "holding_detail_pos_bal_3.json"
            : holdingId === "pos_bal_4"
              ? "holding_detail_pos_bal_4.json"
              : "holding_detail_pos_1.json";
        return await loader.load<ApiHoldingDetailEnvelope>(`${basePath}/${file}`);
      },
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
          data: rest,
        };
      },
    },
    imports: {
      async startImport(_input?: { payload?: Record<string, unknown> }): Promise<ApiImportStartEnvelope> {
        return await loader.load<ApiImportStartEnvelope>(`${basePath}/imports_start.json`);
      },
      async getPreview(input: { importId: string }): Promise<ApiImportPreviewEnvelope> {
        const preview = await loader.load<ApiImportPreviewEnvelope>(`${basePath}/imports_preview.json`);
        if (!preview.ok) return preview;
        return {
          ...preview,
          data: { ...preview.data, importId: input.importId },
        };
      },
      async commitImport(input: { importId: string }): Promise<ApiImportCommitEnvelope> {
        const commit = await loader.load<ApiImportCommitEnvelope>(`${basePath}/imports_commit.json`);
        if (!commit.ok) return commit;
        return {
          ...commit,
          data: { ...commit.data, importId: input.importId },
        };
      },
    },
  };
}
