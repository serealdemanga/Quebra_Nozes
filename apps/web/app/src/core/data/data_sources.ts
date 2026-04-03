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
} from "./contracts";

export interface AnalysisDataSource {
  getAnalysis(): Promise<ApiAnalysisEnvelope>;
}

export interface DashboardDataSource {
  getDashboardHome(): Promise<ApiDashboardHomeEnvelope>;
}

export interface HealthDataSource {
  getHealth(): Promise<ApiHealthEnvelope>;
}

export interface HistoryDataSource {
  getHistorySnapshots(input?: { limit?: number }): Promise<ApiHistorySnapshotsEnvelope>;
  getHistoryTimeline(input?: { limit?: number }): Promise<ApiHistoryTimelineEnvelope>;
  getHistoryImports(input?: { limit?: number }): Promise<ApiHistoryImportsEnvelope>;
}

export interface PortfolioDataSource {
  getPortfolio(input?: { performance?: "all" | "best" | "worst" }): Promise<ApiPortfolioEnvelope>;
}

export interface HoldingDetailDataSource {
  getHoldingDetail(input: { portfolioId: string; holdingId: string }): Promise<ApiHoldingDetailEnvelope>;
}

export interface ProfileDataSource {
  getProfileContext(): Promise<ApiProfileContextGetEnvelope>;
  putProfileContext(input: ProfileContextPutRequest): Promise<ApiProfileContextPutEnvelope>;
}

export interface ImportsDataSource {
  startImport(input?: { payload?: Record<string, unknown> }): Promise<ApiImportStartEnvelope>;
  getPreview(input: { importId: string }): Promise<ApiImportPreviewEnvelope>;
  commitImport(input: { importId: string }): Promise<ApiImportCommitEnvelope>;
}

export interface AppDataSources {
  dashboard: DashboardDataSource;
  health: HealthDataSource;
  analysis: AnalysisDataSource;
  history: HistoryDataSource;
  portfolio: PortfolioDataSource;
  holdingDetail: HoldingDetailDataSource;
  profile: ProfileDataSource;
  imports: ImportsDataSource;
}
