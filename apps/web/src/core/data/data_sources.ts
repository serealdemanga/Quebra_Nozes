import type {
  ApiAnalysisEnvelope,
  ApiHistorySnapshotsEnvelope,
  ApiHistoryTimelineEnvelope
} from './contracts';

export interface AnalysisDataSource {
  getAnalysis(): Promise<ApiAnalysisEnvelope>;
}

export interface HistoryDataSource {
  getHistorySnapshots(input?: { limit?: number }): Promise<ApiHistorySnapshotsEnvelope>;
  getHistoryTimeline(input?: { limit?: number }): Promise<ApiHistoryTimelineEnvelope>;
}

export interface AppDataSources {
  analysis: AnalysisDataSource;
  history: HistoryDataSource;
}

