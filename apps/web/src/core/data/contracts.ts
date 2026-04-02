import type { ApiEnvelope } from './types';

export type ScreenStateRedirect = {
  screenState: 'redirect_onboarding';
  redirectTo: string;
};

export type EmptyState = {
  title: string;
  body: string;
  ctaLabel: string;
  target: string;
};

// ===== Analysis (Radar) =====

export type AnalysisPendingData = {
  screenState: 'pending';
  portfolioId: string;
  pendingState: EmptyState;
};

export type AnalysisReadyData = {
  screenState: 'ready';
  analysisId: string;
  portfolioId: string;
  snapshotId: string;
  score: { value: number; status: string; explanation: string };
  primaryProblem: { code: string; title: string; body: string; severity: string };
  primaryAction: { code: string; title: string; body: string; ctaLabel: string; target: string };
  portfolioDecision: string;
  actionPlan: string[];
  summary: string;
  insights: Array<{ kind: string; title: string; body: string; priority: number }>;
  generatedAt: string;
};

export type AnalysisData = ScreenStateRedirect | AnalysisPendingData | AnalysisReadyData;
export type ApiAnalysisEnvelope = ApiEnvelope<AnalysisData>;

// ===== History snapshots =====

export type HistorySnapshotsEmptyData = {
  screenState: 'empty';
  portfolioId: string;
  emptyState: EmptyState;
  summary: { totalSnapshots: number; latestReferenceDate: string | null };
  snapshots: Array<unknown>;
};

export type HistorySnapshotsReadyData = {
  screenState: 'ready';
  portfolioId: string;
  summary: { totalSnapshots: number; latestReferenceDate: string | null };
  snapshots: Array<{
    id: string;
    referenceDate: string;
    totalEquity: number;
    totalInvested: number;
    totalProfitLoss: number;
    totalProfitLossPct: number;
    createdAt: string;
    analysisBadge: null | { status: string; primaryProblem: string; primaryAction: string };
  }>;
};

export type HistorySnapshotsData = ScreenStateRedirect | HistorySnapshotsEmptyData | HistorySnapshotsReadyData;
export type ApiHistorySnapshotsEnvelope = ApiEnvelope<HistorySnapshotsData>;

// ===== History timeline (snapshots + events) =====

export type HistoryTimelineItemSnapshot = {
  kind: 'snapshot';
  id: string;
  occurredAt: string;
  referenceDate: string;
  createdAt: string;
  totals: {
    totalEquity: number;
    totalInvested: number;
    totalProfitLoss: number;
    totalProfitLossPct: number;
  };
  recommendation: null | { status: string; primaryProblem: string; primaryAction: string };
};

export type HistoryTimelineItemEvent = {
  kind: 'event';
  id: string;
  occurredAt: string;
  portfolioId: string | null;
  type: string;
  status: string;
  message: string | null;
};

export type HistoryTimelineEmptyData = {
  screenState: 'empty';
  portfolioId: string;
  emptyState: EmptyState;
  summary: { totalItems: number; totalSnapshots: number; totalEvents: number; latestOccurredAt: string | null };
  items: Array<never>;
};

export type HistoryTimelineReadyData = {
  screenState: 'ready';
  portfolioId: string;
  summary: { totalItems: number; totalSnapshots: number; totalEvents: number; latestOccurredAt: string | null };
  items: Array<HistoryTimelineItemSnapshot | HistoryTimelineItemEvent>;
};

export type HistoryTimelineData = ScreenStateRedirect | HistoryTimelineEmptyData | HistoryTimelineReadyData;
export type ApiHistoryTimelineEnvelope = ApiEnvelope<HistoryTimelineData>;

// ===== Profile / Context =====

export type ProfilePlatformsUsed = {
  platformIds: string[];
  otherPlatforms: string[];
};

export type ProfileDisplayPreferences = {
  ghostMode: boolean;
};

export type ProfileContextPayload = {
  financialGoal: string | null;
  monthlyIncomeRange: string | null;
  monthlyInvestmentTarget: number | null;
  availableToInvest: number | null;
  riskProfileSelfDeclared: string | null;
  riskProfileQuizResult: string | null;
  riskProfileEffective: string | null;
  investmentHorizon: string | null;
  platformsUsed: ProfilePlatformsUsed | null;
  displayPreferences: ProfileDisplayPreferences | null;
};

export type ProfileOnboardingState = {
  currentStep: string;
  completed: boolean;
  completedAt: string | null;
  homeUnlocked: boolean;
  completedSteps: string[];
  missing: string[];
};

export type ProfileBackendHealth = {
  status: string;
  appEnv: string;
  apiVersion: string;
  services: Record<string, string>;
};

export type ProfileContextGetData = {
  userId: string;
  portfolioId: string | null;
  context: ProfileContextPayload;
  onboarding: ProfileOnboardingState;
  backendHealth: ProfileBackendHealth;
};

export type ProfileContextPutData = Omit<ProfileContextGetData, 'backendHealth'>;

export type ProfileContextStep = 'goal' | 'risk_quiz' | 'income_horizon' | 'platforms' | 'confirm';

export type ProfileContextPutRequest = {
  context?: Partial<ProfileContextPayload>;
  step?: ProfileContextStep;
} & Partial<ProfileContextPayload>;

export type ApiProfileContextGetEnvelope = ApiEnvelope<ProfileContextGetData>;
export type ApiProfileContextPutEnvelope = ApiEnvelope<ProfileContextPutData>;
