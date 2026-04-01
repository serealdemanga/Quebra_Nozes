export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  version: string;
  sourceWarning?: string;
}

export interface ApiEnvelope<T> {
  ok: boolean;
  meta: ResponseMeta;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface HomeHero { totalEquity: number; totalInvested: number; totalProfitLoss: number; totalProfitLossPct: number; statusLabel: string; }
export interface PrimaryProblem { code: string; title: string; body: string; severity: string; }
export interface PrimaryAction { code: string; title: string; body: string; ctaLabel: string; target: string; }
export interface ScoreData { value: number; status: string; explanation: string; }
export interface DistributionItem { key: string; label: string; value: number; sharePct: number; performancePct: number; sourceType: string; }
export interface InsightItem { kind: string; title: string; body: string; }
export interface HomeData { screenState: 'redirect_onboarding' | 'empty' | 'portfolio_ready_analysis_pending' | 'ready'; redirectTo?: string; portfolioId: string; hero: HomeHero; primaryProblem: PrimaryProblem; primaryAction: PrimaryAction; score: ScoreData; distribution: DistributionItem[]; insights: InsightItem[]; updatedAt: string; }
export interface PortfolioSummary { totalEquity: number; totalInvested: number; totalProfitLoss: number; totalProfitLossPct: number; statusLabel: string; }
export interface PortfolioHoldingListItem { id: string; assetId: string; code: string; name: string; categoryKey: string; categoryLabel: string; platformId: string; platformName: string; quantity: number; averagePrice: number; currentPrice: number | null; currentValue: number; investedAmount: number; performanceValue: number; performancePct: number | null; allocationPct: number; quotationStatus: 'priced' | 'missing_quote'; }
export interface PortfolioGroup { categoryKey: string; categoryLabel: string; totalInvested: number; totalCurrent: number; totalProfitLoss: number; totalProfitLossPct: number | null; holdings: PortfolioHoldingListItem[]; }
export interface PortfolioEmptyState { title: string; body: string; ctaLabel: string; target: string; }
export interface PortfolioData { screenState: 'redirect_onboarding' | 'empty' | 'ready'; redirectTo?: string; portfolioId: string; summary: PortfolioSummary; emptyState?: PortfolioEmptyState; groups: PortfolioGroup[]; filters: { performance: 'all' | 'best' | 'worst' }; orders: Array<never>; }
export interface HoldingDetailData { screenState?: 'redirect_onboarding'; redirectTo?: string; holding: { id: string; assetId: string; code: string; name: string; categoryKey: string; categoryLabel: string; platformId: string; platformName: string; quantity: number; averagePrice: number; currentPrice: number | null; currentValue: number; investedAmount: number; performanceValue: number; performancePct: number | null; allocationPct: number; recommendation: string; statusLabel: string; quotationStatus: 'priced' | 'missing_quote'; notes: string; stopLoss: number | null; targetPrice: number | null; sourceKind: string; assetTypeCode: string; }; ranking: { score: number; status: string; motives: string[]; opportunityScore: number; }; recommendation: { code: string; title: string; body: string; }; categoryContext: { categoryKey: string; categoryLabel: string; categoryRisk: string; categoryRecommendation: string; primaryMessage: string; holdingsCount: number; totalCurrent: number; totalInvested: number; totalProfitLoss: number; totalProfitLossPct: number | null; }; externalLink: string; }
export interface HistorySnapshotItem { id: string; referenceDate: string; totalEquity: number; totalInvested: number; totalProfitLoss: number; totalProfitLossPct: number; createdAt: string; analysisBadge: { status: string; primaryProblem: string; primaryAction: string; } | null; }
export interface HistoryData { screenState: 'redirect_onboarding' | 'empty' | 'ready'; redirectTo?: string; portfolioId: string; emptyState?: { title: string; body: string; ctaLabel: string; target: string; }; summary: { totalSnapshots: number; latestReferenceDate: string | null; }; snapshots: HistorySnapshotItem[]; }
export interface AnalysisData { screenState: 'redirect_onboarding' | 'pending' | 'ready'; redirectTo?: string; portfolioId?: string; analysisId?: string; snapshotId?: string; pendingState?: { title: string; body: string; ctaLabel: string; target: string; }; score?: { value: number; status: string; explanation: string; }; primaryProblem?: { code: string; title: string; body: string; severity: string; }; primaryAction?: { code: string; title: string; body: string; ctaLabel: string; target: string; }; portfolioDecision?: string; actionPlan?: string[]; summary?: string; insights?: Array<{ kind: string; title: string; body: string; priority: number; }>; generatedAt?: string; }
export interface ImportStartData { importId: string; status: string; nextStep: string; totals: { totalRows: number; validRows: number; invalidRows: number; duplicateRows: number; }; }
export interface ImportPreviewData { importId: string; status: string; origin: string; totals: { totalRows: number; validRows: number; invalidRows: number; duplicateRows: number; }; readyToCommit: boolean; rows: Array<{ id: string; rowNumber: number; source: Record<string, unknown>; normalized: Record<string, unknown>; resolutionStatus: string; errorMessage: string | null; }>; }
export interface ImportCommitData { importId: string; status: string; createdSnapshotId: string; affectedPositions: number; nextStep: string; }
export interface ImportTemplateDownloadData { kind: 'CUSTOM_TEMPLATE' | 'B3_TEMPLATE'; fileName: string; contentType: string; }
