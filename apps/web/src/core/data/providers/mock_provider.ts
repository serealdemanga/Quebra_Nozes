import type { AppDataSources } from '../data_sources';
import type {
  ApiAnalysisEnvelope,
  ApiHistorySnapshotsEnvelope,
  ApiHistoryTimelineEnvelope
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
    }
  };
}

