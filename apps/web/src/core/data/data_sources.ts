import type {
  ApiAnalysisEnvelope,
  ApiHoldingDetailEnvelope,
  ApiPortfolioEnvelope,
  ApiHistorySnapshotsEnvelope,
  ApiHistoryTimelineEnvelope,
  ApiProfileContextGetEnvelope,
  ApiProfileContextPutEnvelope,
  ProfileContextPutRequest
} from './contracts';

export interface AnalysisDataSource {
  getAnalysis(): Promise<ApiAnalysisEnvelope>;
}

export interface HistoryDataSource {
  getHistorySnapshots(input?: { limit?: number }): Promise<ApiHistorySnapshotsEnvelope>;
  getHistoryTimeline(input?: { limit?: number }): Promise<ApiHistoryTimelineEnvelope>;
}

export interface PortfolioDataSource {
  getPortfolio(input?: { performance?: 'all' | 'best' | 'worst' }): Promise<ApiPortfolioEnvelope>;
}

export interface HoldingDetailDataSource {
  getHoldingDetail(input: { portfolioId: string; holdingId: string }): Promise<ApiHoldingDetailEnvelope>;
}

export interface ProfileDataSource {
  getProfileContext(): Promise<ApiProfileContextGetEnvelope>;
  putProfileContext(input: ProfileContextPutRequest): Promise<ApiProfileContextPutEnvelope>;
}

export interface AppDataSources {
  analysis: AnalysisDataSource;
  history: HistoryDataSource;
  portfolio: PortfolioDataSource;
  holdingDetail: HoldingDetailDataSource;
  profile: ProfileDataSource;
}

