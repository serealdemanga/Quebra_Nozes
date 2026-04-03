import type { AppDataSources } from "../data_sources";
import type {
  ApiAnalysisEnvelope,
  ApiDashboardHomeEnvelope,
  ApiHoldingDetailEnvelope,
  ApiPortfolioEnvelope,
  ApiHistorySnapshotsEnvelope,
  ApiHistoryTimelineEnvelope,
  ApiHistoryImportsEnvelope,
  ApiProfileContextGetEnvelope,
  ApiProfileContextPutEnvelope,
  ProfileContextPutRequest,
  ApiHealthEnvelope,
  ApiImportStartEnvelope,
  ApiImportPreviewEnvelope,
  ApiImportCommitEnvelope,
  ApiImportEngineStatusEnvelope,
  ApiImportDetailEnvelope,
  ApiImportConflictsEnvelope,
  ApiImportResolveDuplicateEnvelope,
  ImportResolveDuplicateRequest,
} from "../contracts";

export interface HttpProviderOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export function createHttpDataSources(options: HttpProviderOptions): AppDataSources {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/+$/, "");

  return {
    dashboard: {
      async getDashboardHome(): Promise<ApiDashboardHomeEnvelope> {
        return await fetchJson<ApiDashboardHomeEnvelope>(fetchImpl, `${baseUrl}/v1/dashboard/home`);
      },
    },
    health: {
      async getHealth(): Promise<ApiHealthEnvelope> {
        return await fetchJson<ApiHealthEnvelope>(fetchImpl, `${baseUrl}/v1/health`);
      },
    },
    analysis: {
      async getAnalysis(): Promise<ApiAnalysisEnvelope> {
        return await fetchJson<ApiAnalysisEnvelope>(fetchImpl, `${baseUrl}/v1/analysis`);
      },
    },
    history: {
      async getHistorySnapshots(input?: { limit?: number }): Promise<ApiHistorySnapshotsEnvelope> {
        const url = new URL(`${baseUrl}/v1/history/snapshots`);
        if (input?.limit != null) url.searchParams.set("limit", String(input.limit));
        return await fetchJson<ApiHistorySnapshotsEnvelope>(fetchImpl, url.toString());
      },
      async getHistoryTimeline(input?: { limit?: number }): Promise<ApiHistoryTimelineEnvelope> {
        const url = new URL(`${baseUrl}/v1/history/timeline`);
        if (input?.limit != null) url.searchParams.set("limit", String(input.limit));
        return await fetchJson<ApiHistoryTimelineEnvelope>(fetchImpl, url.toString());
      },
      async getHistoryImports(input?: { limit?: number }): Promise<ApiHistoryImportsEnvelope> {
        const url = new URL(`${baseUrl}/v1/history/imports`);
        if (input?.limit != null) url.searchParams.set("limit", String(input.limit));
        return await fetchJson<ApiHistoryImportsEnvelope>(fetchImpl, url.toString());
      },
    },
    portfolio: {
      async getPortfolio(input?: { performance?: "all" | "best" | "worst" }): Promise<ApiPortfolioEnvelope> {
        const url = new URL(`${baseUrl}/v1/portfolio`);
        if (input?.performance) url.searchParams.set("performance", input.performance);
        return await fetchJson<ApiPortfolioEnvelope>(fetchImpl, url.toString());
      },
    },
    holdingDetail: {
      async getHoldingDetail(input: { portfolioId: string; holdingId: string }): Promise<ApiHoldingDetailEnvelope> {
        const path = `/v1/portfolio/${encodeURIComponent(input.portfolioId)}/holdings/${encodeURIComponent(input.holdingId)}`;
        return await fetchJson<ApiHoldingDetailEnvelope>(fetchImpl, `${baseUrl}${path}`);
      },
    },
    profile: {
      async getProfileContext(): Promise<ApiProfileContextGetEnvelope> {
        return await fetchJson<ApiProfileContextGetEnvelope>(fetchImpl, `${baseUrl}/v1/profile/context`);
      },
      async putProfileContext(input: ProfileContextPutRequest): Promise<ApiProfileContextPutEnvelope> {
        return await fetchJson<ApiProfileContextPutEnvelope>(fetchImpl, `${baseUrl}/v1/profile/context`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
      },
    },
    imports: {
      async startImport(input?: { payload?: Record<string, unknown> }): Promise<ApiImportStartEnvelope> {
        return await fetchJson<ApiImportStartEnvelope>(fetchImpl, `${baseUrl}/v1/imports/start`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input?.payload ?? {}),
        });
      },
      async getPreview(input: { importId: string }): Promise<ApiImportPreviewEnvelope> {
        return await fetchJson<ApiImportPreviewEnvelope>(
          fetchImpl,
          `${baseUrl}/v1/imports/${encodeURIComponent(input.importId)}/preview`,
        );
      },
      async getEngineStatus(input: { importId: string }): Promise<ApiImportEngineStatusEnvelope> {
        return await fetchJson<ApiImportEngineStatusEnvelope>(
          fetchImpl,
          `${baseUrl}/v1/imports/${encodeURIComponent(input.importId)}/engine-status`,
        );
      },
      async getConflicts(input: { importId: string }): Promise<ApiImportConflictsEnvelope> {
        return await fetchJson<ApiImportConflictsEnvelope>(
          fetchImpl,
          `${baseUrl}/v1/imports/${encodeURIComponent(input.importId)}/conflicts`,
        );
      },
      async getImportDetail(input: { importId: string }): Promise<ApiImportDetailEnvelope> {
        return await fetchJson<ApiImportDetailEnvelope>(
          fetchImpl,
          `${baseUrl}/v1/imports/${encodeURIComponent(input.importId)}/detail`,
        );
      },
      async resolveDuplicateRow(input: { importId: string; rowId: string; payload: ImportResolveDuplicateRequest }): Promise<ApiImportResolveDuplicateEnvelope> {
        const path = `/v1/imports/${encodeURIComponent(input.importId)}/rows/${encodeURIComponent(input.rowId)}/duplicate-resolution`;
        return await fetchJson<ApiImportResolveDuplicateEnvelope>(fetchImpl, `${baseUrl}${path}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input.payload),
        });
      },
      async commitImport(input: { importId: string }): Promise<ApiImportCommitEnvelope> {
        return await fetchJson<ApiImportCommitEnvelope>(
          fetchImpl,
          `${baseUrl}/v1/imports/${encodeURIComponent(input.importId)}/commit`,
          { method: "POST" },
        );
      },
    },
  };
}

async function fetchJson<T>(fetchImpl: typeof fetch, url: string, init?: RequestInit): Promise<T> {
  const response = await fetchImpl(url, { credentials: "include", ...init });
  return (await response.json()) as T;
}
