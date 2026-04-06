import React, { useEffect, useMemo, useState } from 'react';
import type { AppDataSources } from '../../core/data/data_sources';
import { ShellLayout } from '../../app/ShellLayout';
import {
  createRadarController,
  type RadarViewModel,
  type RadarReadyViewModel,
  type RadarInsightBlock,
  type RadarRealityBlock,
  type RadarEvolutionBlock
} from './radar_controller';

export interface RadarScreenProps {
  dataSources: AppDataSources;
  onGoToTarget(path: string): void;
}

export function RadarScreen(props: RadarScreenProps): JSX.Element {
  const [vm, setVm] = useState<RadarViewModel | null>(null);

  const controller = useMemo(() => createRadarController({
    analysis: props.dataSources.analysis,
    dashboard: props.dataSources.dashboard,
    profile: props.dataSources.profile,
    history: props.dataSources.history
  }), [props.dataSources]);

  useEffect(() => {
    let cancelled = false;
    setVm(null);
    controller.load().then((result) => {
      if (!cancelled) setVm(result);
    }).catch((e) => {
      if (!cancelled) setVm({ kind: 'error', message: e instanceof Error ? e.message : 'Falha ao carregar' });
    });
    return () => { cancelled = true; };
  }, [controller]);

  return (
    <ShellLayout title="Radar" activeRouteId="radar" onNavigate={(href) => props.onGoToTarget(href)}>
      {vm === null ? (
        <div className="card" style={{ padding: 16 }}>Carregando...</div>
      ) : vm.kind === 'error' ? (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Nao foi possivel carregar</div>
          <div style={{ color: 'var(--c-slate)' }}>{vm.message}</div>
        </div>
      ) : vm.kind === 'redirect_onboarding' ? (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Antes de tudo</div>
          <div style={{ color: 'var(--c-slate)' }}>Complete seu contexto para personalizar o score.</div>
        </div>
      ) : vm.kind === 'pending' ? (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Analise em processamento</div>
          <div style={{ color: 'var(--c-slate)' }}>{vm.pendingState.body}</div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" onClick={() => props.onGoToTarget(vm.pendingState.target)}>
              {vm.pendingState.ctaLabel}
            </button>
          </div>
        </div>
      ) : (
        <RadarReady vm={vm} onGoToTarget={props.onGoToTarget} />
      )}
    </ShellLayout>
  );
}

function RadarReady(props: { vm: RadarReadyViewModel; onGoToTarget(path: string): void }): JSX.Element {
  const { vm } = props;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <section className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: -0.25 }}>Seu score</div>
            <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.5 }}>{vm.score.explanation}</div>
          </div>
          <ScoreBadge value={vm.score.value} status={vm.score.status} />
        </div>
      </section>

      {vm.concentrationAlert ? <InsightCard block={vm.concentrationAlert} accentColor="rgba(245,106,42,0.45)" onGoToTarget={props.onGoToTarget} showPortfolioLink /> : null}

      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>O que compoe a nota</div>
        <div style={{ display: 'grid', gap: 12 }}>
          <BreakdownList label="Ajuda" items={vm.breakdown.positives} />
          <BreakdownList label="Atrasa" items={vm.breakdown.negatives} />
        </div>
      </section>

      {vm.structure ? <InsightCard block={vm.structure} accentColor={undefined} onGoToTarget={props.onGoToTarget} /> : null}
      {vm.reality ? <RealityCard block={vm.reality} onGoToTarget={props.onGoToTarget} /> : null}
      {vm.behavior ? <InsightCard block={vm.behavior} accentColor={undefined} onGoToTarget={props.onGoToTarget} /> : null}
      {vm.evolution ? <EvolutionCard block={vm.evolution} /> : null}

      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Problema principal</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{vm.primaryProblem.title}</div>
        <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{vm.primaryProblem.body}</div>
      </section>

      <section className="card" style={{ padding: 16, borderColor: 'rgba(245,106,42,0.35)' }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Acao principal</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{vm.primaryAction.title}</div>
        <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{vm.primaryAction.body}</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={() => props.onGoToTarget(vm.primaryAction.target)}>
            {vm.primaryAction.ctaLabel}
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Plano rapido</div>
        <ol style={{ margin: 0, paddingLeft: 18, color: 'var(--c-slate)', lineHeight: 1.6 }}>
          {vm.actionPlan.map((s, idx) => <li key={idx}>{s}</li>)}
        </ol>
      </section>
    </div>
  );
}

function InsightCard(props: {
  block: RadarInsightBlock;
  accentColor: string | undefined;
  onGoToTarget(path: string): void;
  showPortfolioLink?: boolean;
}): JSX.Element {
  const style = props.accentColor ? { padding: 16, borderColor: props.accentColor } : { padding: 16 };
  return (
    <section className="card" style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{props.block.title}</div>
          <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{props.block.body}</div>
        </div>
        {props.showPortfolioLink ? (
          <button className="btn btnPrimary" onClick={() => props.onGoToTarget('/portfolio')}>Ver carteira</button>
        ) : null}
      </div>
      {props.block.tips.length ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Como melhorar</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--c-slate)', lineHeight: 1.55 }}>
            {props.block.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function RealityCard(props: { block: RadarRealityBlock; onGoToTarget(path: string): void }): JSX.Element {
  return (
    <section className="card" style={{ padding: 16 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{props.block.title}</div>
      <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{props.block.body}</div>
      {props.block.tips.length ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Como usar isso</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--c-slate)', lineHeight: 1.55 }}>
            {props.block.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
          </ul>
        </div>
      ) : null}
      {props.block.cta ? (
        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={() => props.onGoToTarget(props.block.cta!.target)}>
            {props.block.cta.label}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function EvolutionCard(props: { block: RadarEvolutionBlock }): JSX.Element {
  return (
    <section className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 900, marginBottom: 6 }}>Evolucao do score</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{props.block.title}</div>
      <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{props.block.body}</div>
      {props.block.points.length ? (
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {props.block.points.map((p) => (
            <div key={p.id} style={{ padding: '8px 10px', border: '1px solid rgba(31,33,37,0.12)', borderRadius: 14, background: 'rgba(255,255,255,0.7)' }}>
              <div style={{ fontWeight: 900, letterSpacing: -0.25 }}>{p.value}</div>
              <div style={{ fontSize: 12, color: 'var(--c-slate)' }}>{p.label}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function BreakdownList(props: { label: string; items: Array<{ title: string; body: string }> }): JSX.Element {
  return (
    <div>
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{props.label}</div>
      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--c-slate)', lineHeight: 1.55 }}>
        {props.items.map((item, idx) => (
          <li key={idx}>
            <div style={{ fontWeight: 900, color: 'var(--c-ink)' }}>{item.title}</div>
            <div>{item.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreBadge(props: { value: number; status: string }): JSX.Element {
  const v = Math.max(0, Math.min(100, props.value));
  const tone = v >= 80 ? 'good' : v >= 60 ? 'warn' : 'bad';
  const bg = tone === 'good' ? 'rgba(111,207,151,0.16)' : tone === 'warn' ? 'rgba(242,181,68,0.18)' : 'rgba(232,92,92,0.16)';
  const border = tone === 'good' ? 'rgba(111,207,151,0.35)' : tone === 'warn' ? 'rgba(242,181,68,0.35)' : 'rgba(232,92,92,0.35)';

  return (
    <div style={{ padding: '10px 12px', borderRadius: 16, background: bg, border: `1px solid ${border}`, textAlign: 'right' }}>
      <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.3 }}>{v}</div>
      <div style={{ fontSize: 12, color: 'var(--c-slate)' }}>{props.status}</div>
    </div>
  );
}
