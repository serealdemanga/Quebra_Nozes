import type {
  AnalysisData,
  AnalysisReadyData,
  DashboardHomeData,
  HistoryTimelineData,
  ProfileContextGetData
} from '../../core/data/contracts';
import type { AnalysisDataSource, DashboardDataSource, HistoryDataSource, ProfileDataSource } from '../../core/data/data_sources';
import { toEmptyStateViewModel, type EmptyStateViewModel } from '../../core/view_models/empty_state';
import { formatMoney } from '../../core/ops/format';

// ===== ViewModel =====

export type RadarScoreBreakdown = {
  positives: Array<{ title: string; body: string }>;
  negatives: Array<{ title: string; body: string }>;
};

export type RadarInsightBlock = { title: string; body: string; tips: string[] };
export type RadarRealityBlock = RadarInsightBlock & { cta: null | { label: string; target: string } };
export type RadarEvolutionBlock = { title: string; body: string; points: Array<{ id: string; value: number; label: string }> };

export type RadarReadyViewModel = {
  kind: 'ready';
  score: AnalysisReadyData['score'];
  primaryProblem: AnalysisReadyData['primaryProblem'];
  primaryAction: AnalysisReadyData['primaryAction'];
  actionPlan: string[];
  breakdown: RadarScoreBreakdown;
  concentrationAlert: RadarInsightBlock | null;
  structure: RadarInsightBlock | null;
  reality: RadarRealityBlock | null;
  behavior: RadarInsightBlock | null;
  evolution: RadarEvolutionBlock | null;
};

export type RadarViewModel =
  | { kind: 'redirect_onboarding'; redirectTo: string }
  | { kind: 'pending'; portfolioId: string; pendingState: EmptyStateViewModel }
  | RadarReadyViewModel
  | { kind: 'error'; message: string };

export interface RadarController {
  load(): Promise<RadarViewModel>;
}

export function createRadarController(input: {
  analysis: AnalysisDataSource;
  dashboard: DashboardDataSource;
  profile: ProfileDataSource;
  history: HistoryDataSource;
}): RadarController {
  return {
    async load(): Promise<RadarViewModel> {
      const [analysisRes, dashboardRes, profileRes, timelineRes] = await Promise.all([
        input.analysis.getAnalysis(),
        input.dashboard.getDashboardHome().catch(() => null),
        input.profile.getProfileContext().catch(() => null),
        input.history.getHistoryTimeline({ limit: 60 }).catch(() => null)
      ]);

      if (!analysisRes.ok) {
        return { kind: 'error', message: `${analysisRes.error.code}: ${analysisRes.error.message}` };
      }

      const data = analysisRes.data as AnalysisData;

      if ('screenState' in data && data.screenState === 'redirect_onboarding') {
        return { kind: 'redirect_onboarding', redirectTo: data.redirectTo || '/onboarding' };
      }

      if ('screenState' in data && data.screenState === 'pending') {
        return { kind: 'pending', portfolioId: data.portfolioId, pendingState: toEmptyStateViewModel(data.pendingState) };
      }

      const ready = data as AnalysisReadyData;
      const dashboard = dashboardRes?.ok ? dashboardRes.data : null;
      const profile = profileRes?.ok ? profileRes.data : null;
      const timeline = timelineRes?.ok ? timelineRes.data : null;

      return {
        kind: 'ready',
        score: ready.score,
        primaryProblem: ready.primaryProblem,
        primaryAction: ready.primaryAction,
        actionPlan: ready.actionPlan,
        breakdown: deriveBreakdown(ready),
        concentrationAlert: deriveConcentrationAlert(dashboard),
        structure: deriveStructure(dashboard),
        reality: deriveReality(profile, dashboard),
        behavior: deriveBehavior(timeline),
        evolution: deriveEvolution(timeline)
      };
    }
  };
}

// ===== Derive functions =====

function deriveBreakdown(data: AnalysisReadyData): RadarScoreBreakdown {
  const positives: Array<{ title: string; body: string }> = [];
  const negatives: Array<{ title: string; body: string }> = [];

  if (data.primaryProblem?.title) {
    negatives.push({ title: data.primaryProblem.title, body: data.primaryProblem.body || '' });
  }

  for (const insight of data.insights || []) {
    const text = `${insight.kind} ${insight.title} ${insight.body}`.toLowerCase();
    const isNeg = text.includes('concentr') || text.includes('risco') || text.includes('press') || text.includes('perda') || text.includes('alto');
    (isNeg ? negatives : positives).push({ title: insight.title || (isNeg ? 'Fator de risco' : 'Fator positivo'), body: insight.body });
  }

  if (!positives.length) {
    positives.push({ title: 'Base estruturada', body: data.score.value >= 60 ? 'A carteira tem base suficiente para evoluir com ajustes incrementais.' : 'Ha sinais positivos, mas a base ainda pede organizacao.' });
  }
  if (!negatives.length) {
    negatives.push({ title: 'Sem alertas dominantes', body: 'Nenhum fator negativo dominante foi identificado nesta leitura.' });
  }

  return { positives: dedupeByTitle(positives).slice(0, 4), negatives: dedupeByTitle(negatives).slice(0, 4) };
}

function deriveConcentrationAlert(dashboard: DashboardHomeData | null): RadarInsightBlock | null {
  const dist = getDist(dashboard);
  if (!dist) return null;

  const top = dist[0];
  const topPct = Number(top.sharePct || 0);
  const hhi = dist.reduce((acc, item) => { const p = Math.max(0, Number(item.sharePct || 0)) / 100; return acc + p * p; }, 0);

  if (topPct < 40 && hhi < 0.35) return null;

  return {
    title: 'Concentracao excessiva',
    body: `${top.label} esta com cerca de ${Math.round(topPct)}% do patrimonio. Isso aumenta o risco e tende a pressionar o score.`,
    tips: [
      'Pare de reforcar o bloco dominante nos proximos aportes.',
      'Direcione aportes para blocos menores ate reduzir a concentracao.',
      'Defina um teto por classe (ex: 35%) e use isso como regra simples.'
    ]
  };
}

function deriveStructure(dashboard: DashboardHomeData | null): RadarInsightBlock | null {
  const dist = getDist(dashboard);
  if (!dist) return null;

  const top = dist[0];
  const topPct = Number(top.sharePct || 0);
  const uniqueBuckets = dist.length;
  const hhi = dist.reduce((acc, item) => { const p = Math.max(0, Number(item.sharePct || 0)) / 100; return acc + p * p; }, 0);

  const tips: string[] = [];
  let title = 'Distribuicao equilibrada';
  let body = `Hoje sua carteira esta distribuida em ${uniqueBuckets} blocos. Isso tende a deixar o score mais estavel.`;

  if (topPct >= 40 || hhi >= 0.35) {
    title = 'Concentracao alta pressiona a nota';
    body = `${top.label} esta com cerca de ${Math.round(topPct)}% do patrimonio. Quando um bloco domina, o risco aumenta e o score tende a cair.`;
    tips.push('Defina um teto por classe e pare de reforcar o bloco dominante.');
    tips.push('Use novos aportes para crescer a parte sub-representada antes de vender.');
  } else if (topPct >= 25 || hhi >= 0.25) {
    title = 'Concentracao moderada';
    body = `${top.label} e um bloco relevante (~${Math.round(topPct)}%). Pode pressionar o score se continuar crescendo sozinho.`;
    tips.push('Direcione os proximos aportes para outros blocos para diluir a concentracao.');
  } else if (uniqueBuckets <= 3) {
    title = 'Poucos blocos na carteira';
    body = `A carteira esta concentrada em poucos blocos (${uniqueBuckets}). Isso aumenta oscilacao e tende a pressionar o score.`;
    tips.push('Crie pelo menos um bloco adicional para reduzir dependencia.');
  }

  return { title, body, tips };
}

function deriveReality(profile: ProfileContextGetData | null, dashboard: DashboardHomeData | null): RadarRealityBlock | null {
  if (!profile) return null;
  if (!dashboard || (dashboard.screenState !== 'ready' && dashboard.screenState !== 'portfolio_ready_analysis_pending')) return null;

  const ctx = profile.context;
  const monthlyInvestmentTarget = ctx.monthlyInvestmentTarget ?? null;
  const availableToInvest = ctx.availableToInvest ?? null;
  const equity = Number((dashboard as any).hero?.totalEquity || 0);

  if (!ctx.monthlyIncomeRange || !monthlyInvestmentTarget || monthlyInvestmentTarget <= 0) {
    return {
      title: 'Sem contexto suficiente para personalizar',
      body: 'Complete sua renda e meta de aporte para evitar uma analise generica.',
      tips: ['Defina um alvo de aporte mensal que caiba na sua realidade.', 'Use o score como guia de decisao, nao como julgamento.'],
      cta: { label: 'Completar contexto', target: '/onboarding' }
    };
  }

  const targetPct = equity > 0 ? monthlyInvestmentTarget / equity : null;
  const tips: string[] = [];
  let title = 'Aporte consistente acelera melhoria do score';
  let body = 'Seu alvo de aporte ajuda a definir o ritmo de melhoria do score sem depender de vender nada agora.';

  if (availableToInvest != null && monthlyInvestmentTarget > availableToInvest) {
    title = 'Meta de aporte acima da capacidade';
    body = `Seu alvo mensal (${formatMoney(monthlyInvestmentTarget)}) esta acima do que voce disse que consegue investir (${formatMoney(availableToInvest)}). Ajustar isso evita frustracao.`;
    tips.push('Ajuste o alvo mensal para algo sustentavel por pelo menos 3 meses.');
    tips.push('Foque em diluir concentracao com aportes pequenos e repetidos.');
  } else if (targetPct != null && targetPct < 0.005) {
    title = 'Ritmo lento para mudar a estrutura';
    body = `Com patrimonio de ~${formatMoney(equity)}, um aporte de ${formatMoney(monthlyInvestmentTarget)} muda a estrutura devagar.`;
    tips.push('Aumente o aporte ou crie aportes extras pontuais quando houver folga.');
    tips.push('Priorize aportes no bloco sub-representado para diluir concentracao.');
  } else if (targetPct != null && targetPct >= 0.015) {
    title = 'Ritmo forte para rebalancear com aportes';
    body = `Com patrimonio de ~${formatMoney(equity)}, seu aporte de ${formatMoney(monthlyInvestmentTarget)} permite rebalancear sem pressa.`;
    tips.push('Defina um teto por classe e use o aporte para trazer o que esta abaixo do alvo.');
  } else {
    title = 'Ritmo razoavel e previsivel';
    body = `Seu aporte de ${formatMoney(monthlyInvestmentTarget)} cria um caminho previsivel para ajustar a carteira.`;
    tips.push('Mantenha consistencia e reavalie a distribuicao a cada 30 dias.');
  }

  if (ctx.monthlyIncomeRange) {
    tips.push(`Renda declarada: ${ctx.monthlyIncomeRange}. Use como referencia para manter metas realistas.`);
  }

  return { title, body, tips: tips.slice(0, 4), cta: null };
}

function deriveBehavior(timeline: HistoryTimelineData | null): RadarInsightBlock | null {
  if (!timeline || timeline.screenState !== 'ready') return null;

  const snapshots = timeline.items.filter((it) => it.kind === 'snapshot') as Array<{ kind: 'snapshot'; occurredAt: string; referenceDate: string }>;

  if (snapshots.length < 2) {
    return {
      title: 'Ainda nao da para medir regularidade',
      body: 'Sem pelo menos dois snapshots, nao e possivel diferenciar evolucao de acaso.',
      tips: ['Crie um habito simples: revisar e atualizar a carteira 1x por mes.']
    };
  }

  const gapDays = diffDays(snapshots[1].occurredAt, snapshots[0].occurredAt);
  const tips: string[] = [];
  let title: string;
  let body: string;

  if (gapDays <= 35) {
    title = 'Boa regularidade de acompanhamento';
    body = `O ultimo intervalo entre snapshots foi de ~${gapDays} dias. Isso melhora a qualidade das recomendacoes.`;
    tips.push('Mantenha o ciclo mensal: aporte, revisar distribuicao, ajustar o proximo passo.');
  } else if (gapDays <= 75) {
    title = 'Regularidade ok, mas pode melhorar';
    body = `O ultimo intervalo foi de ~${gapDays} dias. Um ritmo mais constante tende a reduzir ansiedade e decisoes reativas.`;
    tips.push('Escolha um dia fixo no mes para revisar e registrar a carteira.');
  } else {
    title = 'Baixa regularidade aumenta risco de decisoes reativas';
    body = `O ultimo intervalo foi de ~${gapDays} dias. Quando voce olha pouco, tende a agir no pico da emocao.`;
    tips.push('Volte para um ciclo mensal mesmo que o aporte seja pequeno.');
    tips.push('Registre o que mudou e por que para evitar mexer por mexer.');
  }

  return { title, body, tips };
}

function deriveEvolution(timeline: HistoryTimelineData | null): RadarEvolutionBlock | null {
  if (!timeline || timeline.screenState !== 'ready') return null;

  const points = timeline.items
    .filter((it) => it.kind === 'snapshot')
    .map((it: any) => {
      const value = it.recommendation?.scoreValue;
      return value != null ? { id: it.id, value: Number(value), label: it.referenceDate } : null;
    })
    .filter(Boolean) as Array<{ id: string; value: number; label: string }>;

  if (points.length < 2) {
    return { title: 'Evolucao ainda nao disponivel', body: 'Para enxergar tendencia, o produto precisa de pelo menos dois snapshots com analise registrada.', points: points.slice(0, 3) };
  }

  const delta = points[0].value - points[1].value;
  const direction = delta > 0 ? 'subiu' : delta < 0 ? 'caiu' : 'ficou estavel';

  return {
    title: `Seu score ${direction}`,
    body: `Do snapshot anterior para o mais recente, a nota mudou ${delta === 0 ? '0' : Math.abs(delta).toFixed(0)} pontos.`,
    points: points.slice(0, 3)
  };
}

// ===== Helpers =====

function getDist(dashboard: DashboardHomeData | null): Array<{ label: string; sharePct: number }> | null {
  if (!dashboard) return null;
  if (dashboard.screenState !== 'ready' && dashboard.screenState !== 'portfolio_ready_analysis_pending') return null;
  const dist = (dashboard as any).distribution;
  return Array.isArray(dist) && dist.length > 0 ? dist : null;
}

function dedupeByTitle(items: Array<{ title: string; body: string }>): Array<{ title: string; body: string }> {
  const seen = new Set<string>();
  return items.filter((it) => { const k = it.title.trim().toLowerCase(); return k && !seen.has(k) && seen.add(k) !== undefined; });
}

function diffDays(a: string, b: string): number {
  const da = safeDate(a);
  const db = safeDate(b);
  if (!da || !db) return 0;
  return Math.max(0, Math.round(Math.abs(db.getTime() - da.getTime()) / 86400000));
}

function safeDate(v: string): Date | null {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
