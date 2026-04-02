import type {
  ApiAnalysisEnvelope,
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

export interface ProfileDataSource {
  getProfileContext(): Promise<ApiProfileContextGetEnvelope>;
  putProfileContext(input: ProfileContextPutRequest): Promise<ApiProfileContextPutEnvelope>;
}

export interface AppDataSources {
  analysis: AnalysisDataSource;
  history: HistoryDataSource;
  profile: ProfileDataSource;
}

