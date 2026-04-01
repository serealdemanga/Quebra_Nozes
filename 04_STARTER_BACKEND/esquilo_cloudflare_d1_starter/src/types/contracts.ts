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

export interface HomeHero {
  totalEquity: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPct: number;
  statusLabel: string;
}

export interface PrimaryProblem {
  code: string;
  title: string;
  body: string;
  severity: string;
}

export interface PrimaryAction {
  code: string;
  title: string;
  body: string;
  ctaLabel: string;
  target: string;
}

export interface ScoreData {
  value: number;
  status: string;
  explanation: string;
}

export interface DistributionItem {
  key: string;
  label: string;
  value: number;
  sharePct: number;
  performancePct: number;
  sourceType: string;
}

export interface InsightItem {
  kind: string;
  title: string;
  body: string;
}

export interface HomeData {
  screenState: 'redirect_onboarding' | 'empty' | 'portfolio_ready_analysis_pending' | 'ready';
  redirectTo?: string;
  portfolioId: string;
  hero: HomeHero;
  primaryProblem: PrimaryProblem;
  primaryAction: PrimaryAction;
  score: ScoreData;
  distribution: DistributionItem[];
  insights: InsightItem[];
  updatedAt: string;
}
