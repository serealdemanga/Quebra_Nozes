import type { ApiEnvelope } from "./types";

export type ScreenStateRedirect = {
  screenState: "redirect_onboarding";
  redirectTo: string;
};

export type EmptyState = {
  title: string;
  body: string;
  ctaLabel: string;
  target: string;
};

// ===== Dashboard (Home) =====

export type DashboardDistributionItem = {
  key: string;
  label: string;
  value: number;
  sharePct: number;
  performancePct: number;
  sourceType: string;
};

export type DashboardHomeReadyData = {
  screenState: "ready";
  portfolioId: string;
  hero: {
    totalEquity: number;
    totalInvested: number;
    totalProfitLoss: number;
    totalProfitLossPct: number;
    statusLabel: string;
  };
  score: { value: number; status: string; explanation: string };
  primaryProblem: { code: string; title: string; body: string; severity: string };
  primaryAction: { code: string; title: string; body: string; ctaLabel: string; target: string };
  distribution: DashboardDistributionItem[];
  insights: Array<{ kind: string; title: string; body: string; severity: string }>;
  updatedAt: string;
  sourceWarning: string | null;
};

export type DashboardHomeData = ScreenStateRedirect | DashboardHomeReadyData;
export type ApiDashboardHomeEnvelope = ApiEnvelope<DashboardHomeData>;

// ===== Analysis (Radar) =====

export type AnalysisPendingData = {
  screenState: "pending";
  portfolioId: string;
  pendingState: EmptyState;
};

export type AnalysisReadyData = {
  screenState: "ready";
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

// ===== Health =====

export type HealthData = {
  status: string;
  appEnv: string;
  version: string;
  services: Record<string, string>;
};
export type ApiHealthEnvelope = ApiEnvelope<HealthData>;

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

export type ProfileContextPutData = Omit<ProfileContextGetData, "backendHealth">;

export type ProfileContextStep = "goal" | "risk_quiz" | "income_horizon" | "platforms" | "confirm";

export type ProfileContextPutRequest = {
  context?: Partial<ProfileContextPayload>;
  step?: ProfileContextStep;
} & Partial<ProfileContextPayload>;

export type ApiProfileContextGetEnvelope = ApiEnvelope<ProfileContextGetData>;
export type ApiProfileContextPutEnvelope = ApiEnvelope<ProfileContextPutData>;

// ===== Portfolio =====

export type PortfolioFilters = {
  performance: "all" | "best" | "worst";
};

export type PortfolioHolding = {
  id: string;
  assetId: string;
  code: string | null;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  platformId: string | null;
  platformName: string | null;
  quantity: number | null;
  averagePrice: number | null;
  currentPrice: number | null;
  currentValue: number;
  investedAmount: number | null;
  performanceValue: number | null;
  performancePct: number | null;
  allocationPct: number | null;
  quotationStatus: string;
};

export type PortfolioGroup = {
  categoryKey: string;
  categoryLabel: string;
  totalInvested: number;
  totalCurrent: number;
  totalProfitLoss: number;
  totalProfitLossPct: number;
  holdings: PortfolioHolding[];
};

export type PortfolioDataEmpty = {
  screenState: "empty";
  portfolioId: string;
  emptyState: EmptyState;
  summary: {
    totalEquity: number;
    totalInvested: number;
    totalProfitLoss: number;
    totalProfitLossPct: number;
    statusLabel: string;
  };
  groups: [];
  filters: PortfolioFilters;
  orders: unknown[];
};

export type PortfolioDataReady = {
  screenState: "ready";
  portfolioId: string;
  summary: {
    totalEquity: number;
    totalInvested: number;
    totalProfitLoss: number;
    totalProfitLossPct: number;
    statusLabel: string;
  };
  groups: PortfolioGroup[];
  filters: PortfolioFilters;
  orders: unknown[];
};

export type PortfolioData = ScreenStateRedirect | PortfolioDataEmpty | PortfolioDataReady;
export type ApiPortfolioEnvelope = ApiEnvelope<PortfolioData>;

// ===== Holding detail =====

export type HoldingDetailDataReady = {
  holding: PortfolioHolding & {
    recommendation: string;
    statusLabel: string;
    notes: string;
    stopLoss: number | null;
    targetPrice: number | null;
    sourceKind: string;
    assetTypeCode: string;
  };
  ranking: {
    score: number;
    status: string;
    motives: string[];
    opportunityScore: number;
  };
  recommendation: {
    code: string;
    title: string;
    body: string;
  };
  categoryContext: {
    categoryKey: string;
    categoryLabel: string;
    categoryRisk: string;
    categoryRecommendation: string;
    primaryMessage: string;
    holdingsCount: number;
    totalCurrent: number;
    totalInvested: number;
    totalProfitLoss: number;
    totalProfitLossPct: number;
  };
  externalLink: string | null;
};

export type HoldingDetailData = ScreenStateRedirect | HoldingDetailDataReady;
export type ApiHoldingDetailEnvelope = ApiEnvelope<HoldingDetailData>;

// ===== History snapshots =====

export type HistorySnapshotsEmptyData = {
  screenState: "empty";
  portfolioId: string;
  emptyState: EmptyState;
  summary: { totalSnapshots: number; latestReferenceDate: string | null };
  snapshots: Array<unknown>;
};

export type HistorySnapshotsReadyData = {
  screenState: "ready";
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
    analysisBadge: null | { status: string; primaryProblem: string; primaryAction: string; scoreValue?: number };
  }>;
};

export type HistorySnapshotsData = ScreenStateRedirect | HistorySnapshotsEmptyData | HistorySnapshotsReadyData;
export type ApiHistorySnapshotsEnvelope = ApiEnvelope<HistorySnapshotsData>;

// ===== History timeline =====

export type HistoryTimelineItemSnapshot = {
  kind: "snapshot";
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
  recommendation: null | {
    status: string;
    primaryProblem: string;
    primaryAction: string;
    scoreValue?: number;
  };
};

export type HistoryTimelineItemEvent = {
  kind: "event";
  id: string;
  occurredAt: string;
  portfolioId: string | null;
  type: string;
  status: string;
  message: string | null;
};

export type HistoryTimelineEmptyData = {
  screenState: "empty";
  portfolioId: string;
  emptyState: EmptyState;
  summary: { totalItems: number; totalSnapshots: number; totalEvents: number; latestOccurredAt: string | null };
  items: Array<never>;
};

export type HistoryTimelineReadyData = {
  screenState: "ready";
  portfolioId: string;
  summary: { totalItems: number; totalSnapshots: number; totalEvents: number; latestOccurredAt: string | null };
  items: Array<HistoryTimelineItemSnapshot | HistoryTimelineItemEvent>;
};

export type HistoryTimelineData = ScreenStateRedirect | HistoryTimelineEmptyData | HistoryTimelineReadyData;
export type ApiHistoryTimelineEnvelope = ApiEnvelope<HistoryTimelineData>;
