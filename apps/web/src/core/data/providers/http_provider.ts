import type { AppDataSources } from '../data_sources';
import type {
  ApiAnalysisEnvelope,
  ApiHistorySnapshotsEnvelope,
  ApiHistoryTimelineEnvelope,
  ApiProfileContextGetEnvelope,
  ApiProfileContextPutEnvelope,
  ProfileContextPutRequest
} from '../contracts';

export interface HttpProviderOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export function createHttpDataSources(options: HttpProviderOptions): AppDataSources {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/+$/, '');

  return {
    analysis: {
      async getAnalysis(): Promise<ApiAnalysisEnvelope> {
        return await fetchJson<ApiAnalysisEnvelope>(fetchImpl, `${baseUrl}/v1/analysis`);
      }
    },
    history: {
      async getHistorySnapshots(input?: { limit?: number }): Promise<ApiHistorySnapshotsEnvelope> {
        const url = new URL(`${baseUrl}/v1/history/snapshots`);
        if (input?.limit != null) url.searchParams.set('limit', String(input.limit));
        return await fetchJson<ApiHistorySnapshotsEnvelope>(fetchImpl, url.toString());
      },
      async getHistoryTimeline(input?: { limit?: number }): Promise<ApiHistoryTimelineEnvelope> {
        const url = new URL(`${baseUrl}/v1/history/timeline`);
        if (input?.limit != null) url.searchParams.set('limit', String(input.limit));
        return await fetchJson<ApiHistoryTimelineEnvelope>(fetchImpl, url.toString());
      }
    },
    profile: {
      async getProfileContext(): Promise<ApiProfileContextGetEnvelope> {
        return await fetchJson<ApiProfileContextGetEnvelope>(fetchImpl, `${baseUrl}/v1/profile/context`);
      },
      async putProfileContext(input: ProfileContextPutRequest): Promise<ApiProfileContextPutEnvelope> {
        return await fetchJson<ApiProfileContextPutEnvelope>(fetchImpl, `${baseUrl}/v1/profile/context`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input)
        });
      }
    }
  };
}

async function fetchJson<T>(fetchImpl: typeof fetch, url: string, init?: RequestInit): Promise<T> {
  const response = await fetchImpl(url, { credentials: 'include', ...init });
  return await response.json() as T;
}
