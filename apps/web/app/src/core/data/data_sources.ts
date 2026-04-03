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

export interface AppDataSources {
  dashboard: DashboardDataSource;
  health: HealthDataSource;
  analysis: AnalysisDataSource;
  history: HistoryDataSource;
  portfolio: PortfolioDataSource;
  holdingDetail: HoldingDetailDataSource;
  profile: ProfileDataSource;
}

