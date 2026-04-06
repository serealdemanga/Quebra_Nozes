import React, { useEffect, useMemo, useState } from 'react';
import type { AppDataSources } from '../../core/data/data_sources';
import type { HistoryTimelineItemSnapshot, HistoryTimelineItemEvent } from '../../core/data/contracts';
import { ShellLayout } from '../../app/ShellLayout';
import { formatMoney, formatPct, formatDateTime } from '../../core/ops/format';
import { createHistoryController, type HistoryViewModel } from './history_controller';

export interface HistoryScreenProps {
  dataSources: AppDataSources;
  onGoToTarget(path: string): void;
}

export function HistoryScreen(props: HistoryScreenProps): JSX.Element {
  const [vm, setVm] = useState<HistoryViewModel | null>(null);

  const controller = useMemo(
    () => createHistoryController({ history: props.dataSources.history }),
    [props.dataSources]
  );

  useEffect(() => {
    let cancelled = false;
    setVm(null);
    controller.load({ limit: 40 }).then((result) => {
      if (cancelled) return;
      setVm(result.viewModel);
    }).catch((e) => {
      if (cancelled) return;
      setVm({ kind: 'error', message: e instanceof Error ? e.message : 'Falha ao carregar' });
    });
    return () => { cancelled = true; };
  }, [controller]);

  return (
    <ShellLayout title="Historico" activeRouteId="history" onNavigate={(href) => props.onGoToTarget(href)}>
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
          <div style={{ color: 'var(--c-slate)' }}>Complete seu contexto para gerar leitura temporal.</div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" onClick={() => props.onGoToTarget(vm.redirectTo)}>
              Completar contexto
            </button>
          </div>
        </div>
      ) : vm.kind === 'empty' ? (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>{vm.emptyState.title}</div>
          <div style={{ color: 'var(--c-slate)', lineHeight: 1.55 }}>{vm.emptyState.body}</div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" onClick={() => props.onGoToTarget(vm.emptyState.target)}>
              {vm.emptyState.ctaLabel}
            </button>
          </div>
        </div>
      ) : (
        <HistoryReady vm={vm} onGoToTarget={props.onGoToTarget} />
      )}
    </ShellLayout>
  );
}

function HistoryReady(props: {
  vm: Extract<HistoryViewModel, { kind: 'ready' }>;
  onGoToTarget(path: string): void;
}): JSX.Element {
  const { vm } = props;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Snapshots */}
      {vm.snapshots.length > 0 ? (
        <section className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Snapshots ({vm.snapshots.length})</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {vm.snapshots.map((s) => (
              <div key={s.id} style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(11,18,24,0.10)', background: 'rgba(255,255,255,0.72)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>Ref: {s.referenceDate}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-slate)' }}>{formatDateTime(s.createdAt)}</div>
                  </div>
                  {s.analysisBadge ? (
                    <div style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(242,181,68,0.18)', border: '1px solid rgba(242,181,68,0.35)', fontSize: 12, fontWeight: 900 }}>
                      {s.analysisBadge.status}
                    </div>
                  ) : null}
                </div>
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                  <Kpi label="Patrimonio" value={formatMoney(s.totalEquity)} />
                  <Kpi label="Investido" value={formatMoney(s.totalInvested)} />
                  <Kpi label="P&L" value={`${formatMoney(s.totalProfitLoss)} (${formatPct(s.totalProfitLossPct)})`} />
                </div>
                {s.analysisBadge ? (
                  <div style={{ marginTop: 8, color: 'var(--c-slate)', lineHeight: 1.55, fontSize: 13 }}>
                    <div><strong>Problema:</strong> {s.analysisBadge.primaryProblem}</div>
                    <div><strong>Acao:</strong> {s.analysisBadge.primaryAction}</div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Timeline de eventos */}
      {vm.timelineItems.length > 0 ? (
        <section className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Timeline</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {vm.timelineItems.map((it) =>
              it.kind === 'snapshot' ? (
                <SnapshotItem key={it.id} it={it} />
              ) : (
                <EventItem key={it.id} it={it} />
              )
            )}
          </div>
        </section>
      ) : null}

      {/* Navegacao */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btnGhost" onClick={() => props.onGoToTarget(vm.targets.openPortfolio.pathname)}>
          Ver carteira
        </button>
        <button className="btn btnGhost" onClick={() => props.onGoToTarget(vm.targets.openRadar.pathname)}>
          Ver radar
        </button>
      </div>
    </div>
  );
}

function SnapshotItem(props: { it: HistoryTimelineItemSnapshot }): JSX.Element {
  const it = props.it;
  return (
    <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(11,18,24,0.10)', background: 'rgba(255,255,255,0.72)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 900 }}>Snapshot</div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-slate)' }}>
            Ref: <strong>{it.referenceDate}</strong> • {formatDateTime(it.occurredAt)}
          </div>
        </div>
        {it.recommendation ? (
          <div style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(242,181,68,0.18)', border: '1px solid rgba(242,181,68,0.35)', fontSize: 12, fontWeight: 900 }}>
            {it.recommendation.status}
          </div>
        ) : null}
      </div>
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        <Kpi label="Patrimonio" value={formatMoney(it.totals.totalEquity)} />
        <Kpi label="Investido" value={formatMoney(it.totals.totalInvested)} />
        <Kpi label="P&L" value={`${formatMoney(it.totals.totalProfitLoss)} (${formatPct(it.totals.totalProfitLossPct)})`} />
      </div>
      {it.recommendation ? (
        <div style={{ marginTop: 8, color: 'var(--c-slate)', lineHeight: 1.55, fontSize: 13 }}>
          <div><strong>Problema:</strong> {it.recommendation.primaryProblem}</div>
          <div><strong>Acao:</strong> {it.recommendation.primaryAction}</div>
        </div>
      ) : null}
    </div>
  );
}

function EventItem(props: { it: HistoryTimelineItemEvent }): JSX.Element {
  const it = props.it;
  const isOk = it.status === 'ok';
  return (
    <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${isOk ? 'rgba(111,207,151,0.35)' : 'rgba(232,92,92,0.35)'}`, background: isOk ? 'rgba(111,207,151,0.07)' : 'rgba(232,92,92,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 900 }}>Evento</div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-slate)' }}>{it.type} • {formatDateTime(it.occurredAt)}</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 900 }}>{it.status}</div>
      </div>
      {it.message ? <div style={{ marginTop: 8, color: 'var(--c-slate)', lineHeight: 1.55 }}>{it.message}</div> : null}
    </div>
  );
}

function Kpi(props: { label: string; value: string }): JSX.Element {
  return (
    <div style={{ padding: 10, borderRadius: 12, border: '1px solid rgba(11,18,24,0.10)', background: 'rgba(255,255,255,0.7)' }}>
      <div style={{ fontSize: 12, color: 'var(--c-slate)', marginBottom: 4, fontWeight: 800 }}>{props.label}</div>
      <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: -0.2 }}>{props.value}</div>
    </div>
  );
}


