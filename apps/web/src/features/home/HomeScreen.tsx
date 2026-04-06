import React, { useEffect, useMemo, useState } from 'react';
import type { AppDataSources } from '../../core/data/data_sources';
import type { DashboardHomeData, DashboardDistributionItem, DashboardInsight } from '../../core/data/contracts';
import { ShellLayout } from '../../app/ShellLayout';
import { formatMoney, formatPctShare, clampPct } from '../../core/ops/format';
import type { ExternalDataBanner } from '../../core/view_models/external_data';
import { createHomeController, type HomeNavigationTargets } from './home_controller';

export interface HomeScreenProps {
  dataSources: AppDataSources;
  onGoToTarget(path: string): void;
}

type HomeState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: DashboardHomeData; nav: HomeNavigationTargets; banner: ExternalDataBanner | null };

export function HomeScreen(props: HomeScreenProps): JSX.Element {
  const [state, setState] = useState<HomeState>({ kind: 'loading' });

  const controller = useMemo(
    () => createHomeController({ dashboard: props.dataSources.dashboard }),
    [props.dataSources]
  );

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    controller.load().then((result) => {
      if (cancelled) return;
      if (!result.envelope.ok) {
        setState({ kind: 'error', message: `${result.envelope.error.code}: ${result.envelope.error.message}` });
        return;
      }
      setState({ kind: 'ready', data: result.envelope.data, nav: result.nav, banner: result.externalDataBanner ?? null });
    }).catch((e) => {
      if (cancelled) return;
      setState({ kind: 'error', message: e instanceof Error ? e.message : 'Falha ao carregar' });
    });
    return () => { cancelled = true; };
  }, [controller]);

  return (
    <ShellLayout
      title="Home"
      activeRouteId="home"
      onNavigate={(href) => props.onGoToTarget(href)}
      rightSlot={
        <button className="btn btnGhost" onClick={() => props.onGoToTarget('/profile')}>
          Editar contexto
        </button>
      }
    >
      {state.kind === 'loading' ? (
        <div className="card" style={{ padding: 16 }}>Carregando...</div>
      ) : state.kind === 'error' ? (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Nao foi possivel carregar</div>
          <div style={{ color: 'var(--c-slate)' }}>{state.message}</div>
        </div>
      ) : (
        <HomeContent data={state.data} nav={state.nav} banner={state.banner} onGoToTarget={props.onGoToTarget} />
      )}
    </ShellLayout>
  );
}

function HomeContent(props: {
  data: DashboardHomeData;
  nav: HomeNavigationTargets;
  banner: ExternalDataBanner | null;
  onGoToTarget(path: string): void;
}): JSX.Element {
  const d = props.data;

  if (d.screenState === 'redirect_onboarding') {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Antes de tudo</div>
        <div style={{ color: 'var(--c-slate)' }}>Vamos completar seu contexto para personalizar a leitura.</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={() => props.onGoToTarget(props.nav.primaryAction?.pathname ?? d.redirectTo)}>
            Completar contexto
          </button>
        </div>
      </div>
    );
  }

  if (d.screenState === 'empty') {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>{d.emptyState.title}</div>
        <div style={{ color: 'var(--c-slate)' }}>{d.emptyState.body}</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={() => props.onGoToTarget(props.nav.primaryAction?.pathname ?? d.emptyState.target)}>
            {d.emptyState.ctaLabel}
          </button>
        </div>
      </div>
    );
  }

  // ready / portfolio_ready_analysis_pending
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {props.banner ? (
        <div className="card" style={{ padding: 14, borderColor: props.banner.severity === 'warning' ? 'rgba(242,181,68,0.4)' : 'rgba(11,18,24,0.14)', background: 'rgba(255,255,255,0.72)' }}>
          <div style={{ fontWeight: 900, marginBottom: 4 }}>{props.banner.title}</div>
          <div style={{ color: 'var(--c-slate)', fontSize: 13, lineHeight: 1.5 }}>{props.banner.body}</div>
        </div>
      ) : null}

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Resumo</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <Kpi label="Patrimonio" value={formatMoney(d.hero.totalEquity)} />
          <Kpi label="Score" value={String(d.score.value)} />
          <Kpi label="Status" value={d.hero.statusLabel} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnGhost" onClick={() => props.onGoToTarget(props.nav.openRadar?.pathname ?? '/radar')}>
            Abrir score
          </button>
        </div>
      </div>

      <DistributionCard distribution={d.distribution} onGoToTarget={props.onGoToTarget} portfolioPathname={props.nav.openPortfolio?.pathname ?? '/portfolio'} />
      <InsightsCard insights={d.insights} />

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
          <button className="btn btnPrimary" onClick={() => props.onGoToTarget(props.nav.primaryAction?.pathname ?? d.primaryAction.target)}>
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

function DistributionCard(props: { distribution: DashboardDistributionItem[]; onGoToTarget(path: string): void; portfolioPathname: string }): JSX.Element {
  const items = [...(props.distribution ?? [])]
    .filter((it) => it.label && Number.isFinite(it.sharePct))
    .sort((a, b) => (b.sharePct ?? 0) - (a.sharePct ?? 0))
    .slice(0, 6);

  if (!items.length) return <></>;

  return (
    <section className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Distribuicao</div>
          <div style={{ color: 'var(--c-slate)', lineHeight: 1.55 }}>Leitura rapida de concentracao por categoria.</div>
        </div>
        <button className="btn btnGhost" onClick={() => props.onGoToTarget(props.portfolioPathname)}>
          Abrir carteira
        </button>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        {items.map((it) => <DistributionRow key={it.key} it={it} />)}
      </div>
    </section>
  );
}

function DistributionRow(props: { it: DashboardDistributionItem }): JSX.Element {
  const pct = clampPct(props.it.sharePct ?? 0);
  return (
    <div style={{ padding: 12, borderRadius: 14, border: '1px solid rgba(11,18,24,0.10)', background: 'rgba(255,255,255,0.72)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <div style={{ fontWeight: 900 }}>{props.it.label}</div>
        <div style={{ fontSize: 12, color: 'var(--c-slate)', fontWeight: 900 }}>{formatPctShare(pct)}</div>
      </div>
      <div style={{ marginTop: 8, height: 10, borderRadius: 999, background: 'rgba(11,18,24,0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(245,106,42,0.55)' }} />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-slate)' }}>
        {formatMoney(props.it.value)} • origem: {props.it.sourceType}
      </div>
    </div>
  );
}

function InsightsCard(props: { insights: DashboardInsight[] }): JSX.Element {
  const items = [...(props.insights ?? [])].slice(0, 4);
  if (!items.length) return <></>;

  return (
    <section className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 900, marginBottom: 6 }}>Insights rapidos</div>
      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {items.map((it, idx) => (
          <div key={`${idx}-${it.kind}`} style={{ padding: 12, borderRadius: 14, border: '1px solid rgba(11,18,24,0.10)', background: 'rgba(255,255,255,0.72)' }}>
            <div style={{ fontWeight: 900 }}>{it.title}</div>
            <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{it.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
