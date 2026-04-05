import React, { useEffect, useState } from 'react';
import type { AppDataSources } from '../../core/data/data_sources';
import type { AnalysisData } from '../../core/data/contracts';

export interface RadarScreenProps {
  dataSources: AppDataSources;
  onBack(): void;
  onGoToTarget(path: string): void;
}

export function RadarScreen(props: RadarScreenProps): JSX.Element {
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'error'; message: string }
    | { kind: 'ready'; data: AnalysisData }
  >({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    (async () => {
      try {
        const res = await props.dataSources.analysis.getAnalysis();
        if (cancelled) return;
        if (!res.ok) {
          setState({ kind: 'error', message: `${res.error.code}: ${res.error.message}` });
          return;
        }
        setState({ kind: 'ready', data: res.data });
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
            <RadarContent data={state.data} onGoToTarget={props.onGoToTarget} />
          )}
        </main>
      </div>
    </div>
  );
}

function RadarContent(props: { data: AnalysisData; onGoToTarget(path: string): void }): JSX.Element {
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

