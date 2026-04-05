import React, { useEffect, useState } from 'react';
import type { AppDataSources } from '../../core/data/data_sources';
import type { DashboardHomeData } from '../../core/data/contracts';
import { ShellLayout } from '../../app/ShellLayout';

export interface HomeScreenProps {
  dataSources: AppDataSources;
  onGoToOnboarding(): void;
  onGoToPortfolio(): void;
  onGoToRadar(): void;
}

export function HomeScreen(props: HomeScreenProps): JSX.Element {
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'error'; message: string }
    | { kind: 'ready'; data: DashboardHomeData }
  >({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await props.dataSources.dashboard.getDashboardHome();
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
    <ShellLayout
      title="Home"
      activeRouteId="home"
      onNavigate={(href) => {
        if (href === '/portfolio') props.onGoToPortfolio();
        else if (href === '/radar') props.onGoToRadar();
        else if (href === '/profile') props.onGoToOnboarding();
      }}
      rightSlot={
        <button className="btn btnGhost" onClick={props.onGoToOnboarding}>
          Editar contexto
        </button>
      }
    >
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
            <HomeContent data={state.data} onGoToPortfolio={props.onGoToPortfolio} onGoToRadar={props.onGoToRadar} />
          )}
    </ShellLayout>
  );
}

function HomeContent(props: { data: DashboardHomeData; onGoToPortfolio(): void; onGoToRadar(): void }): JSX.Element {
  const d = props.data;

  if (d.screenState === 'redirect_onboarding') {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Antes de tudo</div>
        <div style={{ color: 'var(--c-slate)' }}>Vamos completar seu contexto para personalizar a leitura.</div>
      </div>
    );
  }

  if (d.screenState === 'empty') {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>{d.emptyState.title}</div>
        <div style={{ color: 'var(--c-slate)' }}>{d.emptyState.body}</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={props.onGoToPortfolio}>
            {d.emptyState.ctaLabel}
          </button>
        </div>
      </div>
    );
  }

  // ready / portfolio_ready_analysis_pending: para US002 o valor é o herói + problema + ação.
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Resumo</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <Kpi label="Patrimonio" value={formatMoney(d.hero.totalEquity)} />
          <Kpi label="Score" value={String(d.score.value)} />
          <Kpi label="Disponivel" value={formatMoney(d.hero.totalEquity * 0.02)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnGhost" onClick={props.onGoToRadar}>
            Abrir score
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Problema principal</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{d.primaryProblem.title}</div>
        <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.5 }}>{d.primaryProblem.body}</div>
      </div>

      <div className="card" style={{ padding: 16, borderColor: 'rgba(245,106,42,0.35)' }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Acao recomendada</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{d.primaryAction.title}</div>
        <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.5 }}>{d.primaryAction.body}</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={props.onGoToPortfolio}>
            {d.primaryAction.ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi(props: { label: string; value: string }): JSX.Element {
  return (
    <div style={{ padding: 12, borderRadius: 14, border: '1px solid rgba(11,18,24,0.10)', background: 'rgba(255,255,255,0.7)' }}>
      <div style={{ fontSize: 12, color: 'var(--c-slate)', marginBottom: 6 }}>{props.label}</div>
      <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.2 }}>{props.value}</div>
    </div>
  );
}

function formatMoney(v: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  } catch {
    return `R$ ${v.toFixed(2)}`;
  }
}
