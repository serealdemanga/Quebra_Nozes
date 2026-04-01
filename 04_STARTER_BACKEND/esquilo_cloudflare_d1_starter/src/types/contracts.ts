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

export interface PortfolioSummary {
  totalEquity: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPct: number;
  statusLabel: string;
}

export interface PortfolioHoldingListItem {
  id: string;
  assetId: string;
  code: string;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  platformId: string;
  platformName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number | null;
  currentValue: number;
  investedAmount: number;
  performanceValue: number;
  performancePct: number | null;
  allocationPct: number;
  quotationStatus: 'priced' | 'missing_quote';
}

export interface PortfolioGroup {
  categoryKey: string;
  categoryLabel: string;
  totalInvested: number;
  totalCurrent: number;
  totalProfitLoss: number;
  totalProfitLossPct: number | null;
  holdings: PortfolioHoldingListItem[];
}

export interface PortfolioData {
  screenState: 'redirect_onboarding' | 'empty' | 'ready';
  redirectTo?: string;
  portfolioId: string;
  summary: PortfolioSummary;
  groups: PortfolioGroup[];
  filters: {
    performance: 'all' | 'best' | 'worst';
  };
  orders: Array<never>;
}
