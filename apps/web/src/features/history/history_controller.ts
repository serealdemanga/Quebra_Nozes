import type {
  ApiHistorySnapshotsEnvelope,
  ApiHistoryTimelineEnvelope,
  EmptyState,
  HistorySnapshotsData,
  HistorySnapshotsEmptyData,
  HistorySnapshotsReadyData,
  HistoryTimelineData,
  HistoryTimelineEmptyData,
  HistoryTimelineReadyData
} from '../../core/data/contracts';
import type { HistoryDataSource } from '../../core/data/data_sources';
import { createRouter, type Router } from '../../core/router';
import { toEmptyStateViewModel, type EmptyStateViewModel } from '../../core/view_models/empty_state';

export type HistoryViewModel =
  | { kind: 'redirect_onboarding'; redirectTo: string }
  | { kind: 'empty'; portfolioId: string; emptyState: EmptyStateViewModel }
  | {
      kind: 'ready';
      portfolioId: string;
      snapshots: HistorySnapshotsReadyData['snapshots'];
      timelineItems: HistoryTimelineReadyData['items'];
      targets: {
        openPortfolio: { pathname: string };
        openRadar: { pathname: string };
      };
    }
  | { kind: 'error'; code?: string; message?: string };

export interface HistoryControllerResult {
  snapshots: ApiHistorySnapshotsEnvelope;
  timeline: ApiHistoryTimelineEnvelope;
  viewModel: HistoryViewModel;
}

export interface HistoryController {
  load(input?: { limit?: number }): Promise<HistoryControllerResult>;
}

/**
 * Historico: snapshots + timeline/eventos de forma util, coerente com a Home/Radar.
 * Controller headless centraliza os dois endpoints.
 */
export function createHistoryController(input: { history: HistoryDataSource; router?: Router }): HistoryController {
  const history = input.history;
  const router = input.router ?? createRouter();

  return {
    async load(opts) {
      const [snapshots, timeline] = await Promise.all([
        history.getHistorySnapshots(opts),
        history.getHistoryTimeline(opts)
      ]);

      if (!snapshots.ok) return { snapshots, timeline, viewModel: { kind: 'error', code: snapshots.error.code, message: snapshots.error.message } };
      if (!timeline.ok) return { snapshots, timeline, viewModel: { kind: 'error', code: timeline.error.code, message: timeline.error.message } };

      const sData = snapshots.data as HistorySnapshotsData;
      const tData = timeline.data as HistoryTimelineData;

      if ('screenState' in sData && sData.screenState === 'redirect_onboarding') {
        return { snapshots, timeline, viewModel: { kind: 'redirect_onboarding', redirectTo: sData.redirectTo || '/onboarding' } };
      }

      if ('screenState' in tData && tData.screenState === 'redirect_onboarding') {
        return { snapshots, timeline, viewModel: { kind: 'redirect_onboarding', redirectTo: tData.redirectTo || '/onboarding' } };
      }

      if (sData.screenState === 'empty' || tData.screenState === 'empty') {
        const emptyState = (sData.screenState === 'empty'
          ? (sData as HistorySnapshotsEmptyData).emptyState
          : (tData as HistoryTimelineEmptyData).emptyState);
        const portfolioId = sData.portfolioId;
        return { snapshots, timeline, viewModel: { kind: 'empty', portfolioId, emptyState: toEmptyStateViewModel(emptyState) } };
      }

      const sReady = sData as HistorySnapshotsReadyData;
      const tReady = tData as HistoryTimelineReadyData;
      return {
        snapshots,
        timeline,
        viewModel: {
          kind: 'ready',
          portfolioId: sReady.portfolioId,
          snapshots: sReady.snapshots,
          timelineItems: tReady.items,
          targets: {
            openPortfolio: { pathname: router.build({ id: 'portfolio' }) },
            openRadar: { pathname: router.build({ id: 'radar' }) }
          }
        }
      };
    }
  };
}
