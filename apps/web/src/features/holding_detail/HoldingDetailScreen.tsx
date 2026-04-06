import React, { useEffect, useMemo, useState } from 'react';
import type { AppDataSources } from '../../core/data/data_sources';
import { ShellLayout } from '../../app/ShellLayout';
import { formatMoney, formatPct } from '../../core/ops/format';
import { createHoldingDetailController, type HoldingDetailViewModel } from './holding_detail_controller';

export interface HoldingDetailScreenProps {
  dataSources: AppDataSources;
  input: { portfolioId: string; holdingId: string };
  onBack(): void;
  onOpenExternal(url: string): void;
}

export function HoldingDetailScreen(props: HoldingDetailScreenProps): JSX.Element {
  const [vm, setVm] = useState<HoldingDetailViewModel>({ kind: 'error', message: '' });
  const [loading, setLoading] = useState(true);

  const controller = useMemo(
    () => createHoldingDetailController({ holdingDetail: props.dataSources.holdingDetail }),
    [props.dataSources]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    controller.load(props.input).then((result) => {
      if (cancelled) return;
      setVm(result.viewModel);
      setLoading(false);
    }).catch((e) => {
      if (cancelled) return;
      setVm({ kind: 'error', message: e instanceof Error ? e.message : 'Falha ao carregar' });
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [controller, props.input.holdingId, props.input.portfolioId]);

  return (
    <ShellLayout
      title="Detalhe"
      activeRouteId="holding_detail"
      onNavigate={props.onBack}
      rightSlot={
        <button className="btn btnGhost" onClick={props.onBack}>
          Voltar
        </button>
      }
    >
      {loading ? (
        <div className="card" style={{ padding: 16 }}>Carregando...</div>
      ) : vm.kind === 'error' ? (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Nao foi possivel carregar</div>
          <div style={{ color: 'var(--c-slate)' }}>{vm.message}</div>
        </div>
      ) : vm.kind === 'redirect_onboarding' ? (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Antes de tudo</div>
          <div style={{ color: 'var(--c-slate)' }}>Complete seu contexto para personalizar a leitura.</div>
        </div>
      ) : (
        <HoldingDetailReady vm={vm} onOpenExternal={props.onOpenExternal} />
      )}
    </ShellLayout>
  );
}

function HoldingDetailReady(props: {
  vm: Extract<HoldingDetailViewModel, { kind: 'ready' }>;
  onOpenExternal(url: string): void;
}): JSX.Element {
  const { vm } = props;
  const h = vm.holding;
  const perfPct = h.performancePct ?? null;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Cabecalho do ativo */}
      <section className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: -0.25 }}>
              {h.code ? `${h.code} ` : ''}
              {h.name}
            </div>
            <div style={{ marginTop: 6, color: 'var(--c-slate)', fontSize: 12 }}>
              {vm.summary.subline}
            </div>
          </div>
          <div style={{ textAlign: 'right', color: 'var(--c-slate)', fontSize: 12 }}>
            <div style={{ fontWeight: 900, color: 'var(--c-ink)' }}>{h.statusLabel}</div>
            <div>{h.quotationStatus}</div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <Kpi label="Posicao" value={formatMoney(h.currentValue)} hint={h.quantity != null && h.currentPrice != null ? `${h.quantity} x ${formatMoney(h.currentPrice)}` : undefined} />
          <Kpi
            label="Performance"
            value={perfPct == null ? '—' : formatPct(perfPct)}
            tone={perfPct == null ? 'neutral' : perfPct >= 0 ? 'good' : 'bad'}
            hint={h.allocationPct != null ? `Peso: ${formatPct(h.allocationPct)}` : undefined}
          />
          <Kpi label="Score" value={String(vm.ranking.score)} hint={vm.ranking.status} />
        </div>

        {/* Papel do ativo na carteira (roleMessage) — feature das branches */}
        {vm.summary.roleMessage ? (
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(11,18,24,0.08)', color: 'var(--c-slate)', fontSize: 13, lineHeight: 1.55 }}>
            {vm.summary.roleMessage}
          </div>
        ) : null}
      </section>

      {/* Sinais de atencao — feature das branches */}
      {vm.attentionSignals.length > 0 ? (
        <section className="card" style={{ padding: 16, borderColor: 'rgba(232,92,92,0.35)' }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Pontos de atencao</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {vm.attentionSignals.map((s) => (
              <div key={s.code} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(232,92,92,0.07)', border: '1px solid rgba(232,92,92,0.2)' }}>
                <div style={{ fontWeight: 900, fontSize: 13 }}>{s.title}</div>
                <div style={{ marginTop: 4, color: 'var(--c-slate)', fontSize: 13, lineHeight: 1.5 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Sinais positivos — feature das branches */}
      {vm.positiveSignals.length > 0 ? (
        <section className="card" style={{ padding: 16, borderColor: 'rgba(111,207,151,0.35)' }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Pontos positivos</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {vm.positiveSignals.map((s) => (
              <div key={s.code} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(111,207,151,0.07)', border: '1px solid rgba(111,207,151,0.2)' }}>
                <div style={{ fontWeight: 900, fontSize: 13 }}>{s.title}</div>
                <div style={{ marginTop: 4, color: 'var(--c-slate)', fontSize: 13, lineHeight: 1.5 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Recomendacao */}
      <section className="card" style={{ padding: 16, borderColor: 'rgba(245,106,42,0.35)' }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Recomendacao</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: -0.2 }}>{vm.recommendation.title}</div>
        <div style={{ marginTop: 6, color: 'var(--c-slate)', lineHeight: 1.55 }}>{vm.recommendation.body}</div>
      </section>

      {/* Contexto da categoria */}
      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Contexto da categoria</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <Kpi label="Categoria" value={vm.categoryContext.categoryLabel} hint={`Risco: ${vm.categoryContext.categoryRisk}`} />
          <Kpi label="Total atual" value={formatMoney(vm.categoryContext.totalCurrent)} hint={`${vm.categoryContext.holdingsCount} holdings`} />
          <Kpi label="P&L" value={`${formatMoney(vm.categoryContext.totalProfitLoss)} (${formatPct(vm.categoryContext.totalProfitLossPct)})`} />
        </div>
        <div style={{ marginTop: 10, color: 'var(--c-slate)', lineHeight: 1.55 }}>{vm.categoryContext.primaryMessage}</div>
      </section>

      {/* Link externo */}
      {vm.externalLink ? (
        <section className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Link externo</div>
          <button className="btn btnGhost" onClick={() => props.onOpenExternal(vm.externalLink!)}>
            Abrir cotacao / referencia
          </button>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-slate)' }}>{vm.externalLink}</div>
        </section>
      ) : null}
    </div>
  );
}

function Kpi(props: { label: string; value: string; hint?: string; tone?: 'neutral' | 'good' | 'bad' }): JSX.Element {
  const tone = props.tone ?? 'neutral';
  const valueColor = tone === 'good' ? 'var(--c-success)' : tone === 'bad' ? 'var(--c-danger)' : 'var(--c-ink)';

  return (
    <div style={{ padding: 12, borderRadius: 14, border: '1px solid rgba(11,18,24,0.10)', background: 'rgba(255,255,255,0.7)' }}>
      <div style={{ fontSize: 12, color: 'var(--c-slate)', marginBottom: 6, fontWeight: 800 }}>{props.label}</div>
      <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.2, color: valueColor }}>{props.value}</div>
      {props.hint ? <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-slate)' }}>{props.hint}</div> : null}
    </div>
  );
}

