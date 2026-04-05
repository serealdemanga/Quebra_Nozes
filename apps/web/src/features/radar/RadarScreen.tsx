import React, { useEffect, useState } from 'react';
import type { AppDataSources } from '../../core/data/data_sources';
import type { AnalysisData, DashboardHomeData } from '../../core/data/contracts';

export interface RadarScreenProps {
  dataSources: AppDataSources;
  onBack(): void;
  onGoToTarget(path: string): void;
}

export function RadarScreen(props: RadarScreenProps): JSX.Element {
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'error'; message: string }
    | { kind: 'ready'; data: AnalysisData; dashboard: DashboardHomeData | null }
  >({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    (async () => {
      try {
        const [analysisRes, dashboardRes] = await Promise.all([
          props.dataSources.analysis.getAnalysis(),
          props.dataSources.dashboard.getDashboardHome().catch((e) => ({
            ok: false,
            meta: { requestId: 'req_dash_failed', timestamp: new Date().toISOString(), version: 'v1' },
            error: { code: 'dashboard_failed', message: e instanceof Error ? e.message : 'Falha ao carregar dashboard' }
          }))
        ]);
        if (cancelled) return;
        if (!analysisRes.ok) {
          setState({ kind: 'error', message: `${analysisRes.error.code}: ${analysisRes.error.message}` });
          return;
        }
        setState({ kind: 'ready', data: analysisRes.data, dashboard: dashboardRes.ok ? dashboardRes.data : null });
      } catch (e) {
        if (cancelled) return;
        setState({ kind: 'error', message: e instanceof Error ? e.message : 'Falha ao carregar' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.dataSources]);

  return (
    <div className="app">
      <div className="container" style={{ paddingTop: 18, paddingBottom: 28 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/brand/esquilo-icon.png"
              alt="Esquilo"
              width={34}
              height={34}
              style={{ borderRadius: 12, background: 'rgba(255,255,255,0.85)', boxShadow: 'var(--shadow-1)' }}
            />
            <div style={{ fontWeight: 900 }}>Radar</div>
          </div>
          <button className="btn btnGhost" onClick={props.onBack}>
            Voltar
          </button>
        </header>

        <main style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          {state.kind === 'loading' ? (
            <div className="card" style={{ padding: 16 }}>
              Carregando...
            </div>
          ) : state.kind === 'error' ? (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Nao foi possivel carregar</div>
              <div style={{ color: 'var(--c-slate)' }}>{state.message}</div>
            </div>
          ) : (
            <RadarContent data={state.data} dashboard={state.dashboard} onGoToTarget={props.onGoToTarget} />
          )}
        </main>
      </div>
    </div>
  );
}

function RadarContent(props: { data: AnalysisData; dashboard: DashboardHomeData | null; onGoToTarget(path: string): void }): JSX.Element {
  const d = props.data;

  if (d.screenState === 'redirect_onboarding') {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Antes de tudo</div>
        <div style={{ color: 'var(--c-slate)' }}>Complete seu contexto para personalizar o score.</div>
      </div>
    );
  }

  if (d.screenState === 'pending') {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Analise em processamento</div>
        <div style={{ color: 'var(--c-slate)' }}>{d.pendingState.body}</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={() => props.onGoToTarget(d.pendingState.target)}>
            {d.pendingState.ctaLabel}
          </button>
        </div>
      </div>
    );
  }

  // ready
  const breakdown = deriveScoreBreakdown(d);
  const structure = deriveStructureImpact(props.dashboard);
  return (
    <>
      <section className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: -0.25 }}>Seu score</div>
            <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.5 }}>{d.score.explanation}</div>
          </div>
          <ScoreBadge value={d.score.value} status={d.score.status} />
        </div>
      </section>

      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>O que compoe a nota</div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Ajuda</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--c-slate)', lineHeight: 1.55 }}>
              {breakdown.positives.map((item, idx) => (
                <li key={idx}>
                  <div style={{ fontWeight: 900, color: 'var(--c-ink)' }}>{item.title}</div>
                  <div>{item.body}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Atrasa</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--c-slate)', lineHeight: 1.55 }}>
              {breakdown.negatives.map((item, idx) => (
                <li key={idx}>
                  <div style={{ fontWeight: 900, color: 'var(--c-ink)' }}>{item.title}</div>
                  <div>{item.body}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {structure ? (
        <section className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Estrutura x score</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{structure.title}</div>
          <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{structure.body}</div>
          {structure.tips.length ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Como melhorar</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--c-slate)', lineHeight: 1.55 }}>
                {structure.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Problema principal</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{d.primaryProblem.title}</div>
        <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{d.primaryProblem.body}</div>
      </section>

      <section className="card" style={{ padding: 16, borderColor: 'rgba(245,106,42,0.35)' }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Acao principal</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{d.primaryAction.title}</div>
        <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{d.primaryAction.body}</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={() => props.onGoToTarget(d.primaryAction.target)}>
            {d.primaryAction.ctaLabel}
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Plano rapido</div>
        <ol style={{ margin: 0, paddingLeft: 18, color: 'var(--c-slate)', lineHeight: 1.6 }}>
          {d.actionPlan.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ol>
      </section>
    </>
  );
}

function ScoreBadge(props: { value: number; status: string }): JSX.Element {
  const v = Math.max(0, Math.min(100, props.value));
  const tone = v >= 80 ? 'good' : v >= 60 ? 'warn' : 'bad';
  const bg =
    tone === 'good' ? 'rgba(111,207,151,0.16)'
      : tone === 'warn' ? 'rgba(242,181,68,0.18)'
        : 'rgba(232,92,92,0.16)';
  const border =
    tone === 'good' ? 'rgba(111,207,151,0.35)'
      : tone === 'warn' ? 'rgba(242,181,68,0.35)'
        : 'rgba(232,92,92,0.35)';

  return (
    <div style={{ padding: '10px 12px', borderRadius: 16, background: bg, border: `1px solid ${border}`, textAlign: 'right' }}>
      <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.3 }}>{v}</div>
      <div style={{ fontSize: 12, color: 'var(--c-slate)' }}>{props.status}</div>
    </div>
  );
}

function deriveScoreBreakdown(
  data: Extract<AnalysisData, { screenState: 'ready' }>
): { positives: Array<{ title: string; body: string }>; negatives: Array<{ title: string; body: string }> } {
  const positives: Array<{ title: string; body: string }> = [];
  const negatives: Array<{ title: string; body: string }> = [];

  // Negativo mais explícito (para não virar "caixa preta").
  if (data.primaryProblem?.title || data.primaryProblem?.body) {
    negatives.push({
      title: data.primaryProblem.title || 'Ponto de atencao',
      body: data.primaryProblem.body || 'Existe um fator que pressiona seu score.'
    });
  }

  for (const insight of data.insights || []) {
    const text = `${insight.kind} ${insight.title} ${insight.body}`.toLowerCase();
    const isNegative = text.includes('concentr') || text.includes('risco') || text.includes('press') || text.includes('perda') || text.includes('alto');
    const bucket = isNegative ? negatives : positives;
    bucket.push({
      title: insight.title || (isNegative ? 'Fator de risco' : 'Fator positivo'),
      body: insight.body
    });
  }

  if (!positives.length) {
    positives.push({
      title: 'Base estruturada',
      body: data.score.value >= 60 ? 'A carteira tem base suficiente para evoluir com ajustes incrementais.' : 'Ha sinais positivos, mas a base ainda pede organizacao.'
    });
  }
  if (!negatives.length) {
    negatives.push({
      title: 'Sem alertas dominantes',
      body: 'Nenhum fator negativo dominante foi identificado nesta leitura.'
    });
  }

  return {
    positives: dedupeByTitle(positives).slice(0, 4),
    negatives: dedupeByTitle(negatives).slice(0, 4)
  };
}

function dedupeByTitle(items: Array<{ title: string; body: string }>): Array<{ title: string; body: string }> {
  const seen = new Set<string>();
  const out: Array<{ title: string; body: string }> = [];
  for (const item of items) {
    const key = item.title.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function deriveStructureImpact(
  dashboard: DashboardHomeData | null
): null | { title: string; body: string; tips: string[] } {
  if (!dashboard) return null;
  if (dashboard.screenState !== 'ready' && dashboard.screenState !== 'portfolio_ready_analysis_pending') return null;

  const dist = dashboard.distribution || [];
  if (!dist.length) return null;

  const top = dist[0];
  const topPct = Number(top.sharePct || 0);
  const uniqueBuckets = dist.length;
  const hhi = dist.reduce((acc, item) => {
    const p = Math.max(0, Number(item.sharePct || 0)) / 100;
    return acc + p * p;
  }, 0);

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
    body = `${top.label} e um bloco relevante (~${Math.round(topPct)}%). Isso pode pressionar o score se continuar crescendo sozinho.`;
    tips.push('Direcione os proximos aportes para outros blocos para diluir a concentracao.');
  } else if (uniqueBuckets <= 3) {
    title = 'Poucos blocos na carteira';
    body = `A carteira esta concentrada em poucos blocos (${uniqueBuckets}). Isso aumenta oscilacao e tende a pressionar o score.`;
    tips.push('Crie pelo menos um bloco adicional (ex: renda fixa, acoes, fundos) para reduzir dependencia.');
  }

  return { title, body, tips };
}
