import React, { useEffect, useMemo, useState } from 'react';
import type { AppDataSources } from '../../core/data/data_sources';
import type { PortfolioHolding } from '../../core/data/contracts';
import { ShellLayout } from '../../app/ShellLayout';
import { formatMoney, formatPct } from '../../core/ops/format';
import {
  createPortfolioController,
  type PortfolioReadyViewModel,
  type PortfolioViewModel
} from './portfolio_controller';

type PerfFilter = 'all' | 'best' | 'worst';

export interface PortfolioScreenProps {
  dataSources: AppDataSources;
  onBack(): void;
  onOpenHolding(input: { portfolioId: string; holdingId: string }): void;
  onGoToHome(): void;
  onGoToRadar(): void;
}

export function PortfolioScreen(props: PortfolioScreenProps): JSX.Element {
  const [perf, setPerf] = useState<PerfFilter>('all');
  const [query, setQuery] = useState('');
  const [vm, setVm] = useState<PortfolioViewModel | null>(null);

  const controller = useMemo(
    () => createPortfolioController({ portfolio: props.dataSources.portfolio }),
    [props.dataSources]
  );

  useEffect(() => {
    let cancelled = false;
    setVm(null);
    controller.load({ performance: perf }).then((r) => {
      if (!cancelled) setVm(r.viewModel);
    }).catch((e) => {
      if (!cancelled) setVm({ kind: 'error', message: e instanceof Error ? e.message : 'Falha ao carregar' });
    });
    return () => { cancelled = true; };
  }, [controller, perf]);

  const filteredGroups = useMemo(() => {
    if (vm?.kind !== 'ready') return null;
    const q = query.trim().toLowerCase();
    if (!q) return vm.groups;
    return vm.groups
      .map((g) => ({ ...g, holdings: g.holdings.filter((h) => `${h.code ?? ''} ${h.name}`.toLowerCase().includes(q)) }))
      .filter((g) => g.holdings.length > 0);
  }, [vm, query]);

  return (
    <ShellLayout
      title="Carteira"
      activeRouteId="portfolio"
      onNavigate={(href) => {
        if (href === '/home') props.onGoToHome();
        else if (href === '/radar') props.onGoToRadar();
      }}
      rightSlot={<button className="btn btnGhost" onClick={props.onBack}>Voltar</button>}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <FilterPill label="Todos" selected={perf === 'all'} onClick={() => setPerf('all')} />
              <FilterPill label="Melhores" selected={perf === 'best'} onClick={() => setPerf('best')} />
              <FilterPill label="Piores" selected={perf === 'worst'} onClick={() => setPerf('worst')} />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou codigo"
              style={{ width: 'min(360px, 100%)', padding: '10px 12px', borderRadius: 14, border: '1px solid rgba(11,18,24,0.14)', background: 'rgba(255,255,255,0.72)', font: 'inherit' }}
            />
          </div>
        </div>

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
            <div style={{ color: 'var(--c-slate)' }}>Complete seu contexto para personalizar a leitura.</div>
          </div>
        ) : vm.kind === 'empty' ? (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{vm.emptyState.title}</div>
            <div style={{ color: 'var(--c-slate)' }}>{vm.emptyState.body}</div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btnPrimary">{vm.emptyState.ctaLabel}</button>
            </div>
          </div>
        ) : (
          <PortfolioReady
            vm={vm}
            filteredGroups={filteredGroups ?? vm.groups}
            onOpenHolding={props.onOpenHolding}
          />
        )}
      </div>
    </ShellLayout>
  );
}

function PortfolioReady(props: {
  vm: PortfolioReadyViewModel;
  filteredGroups: PortfolioReadyViewModel['groups'];
  onOpenHolding(input: { portfolioId: string; holdingId: string }): void;
}): JSX.Element {
  const { vm } = props;

  return (
    <>
      {/* Resumo */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Resumo</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <Kpi label="Patrimonio" value={formatMoney(vm.summary.totalEquity)} />
          <Kpi label="Investido" value={formatMoney(vm.summary.totalInvested)} />
          <Kpi label="P&L" value={`${formatMoney(vm.summary.totalProfitLoss)} (${formatPct(vm.summary.totalProfitLossPct)})`} />
        </div>
      </div>

      {/* Concentracao por ativo — feature das branches */}
      {vm.assets.some((a) => a.concentrationLevel !== 'low') ? (
        <section className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Concentracao por ativo</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {vm.assets.filter((a) => a.concentrationLevel !== 'low').map((a) => (
              <div
                key={a.assetId}
                style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(232,92,92,0.25)', background: 'rgba(232,92,92,0.05)', cursor: 'pointer' }}
                onClick={() => props.onOpenHolding({ portfolioId: vm.portfolioId, holdingId: a.primaryHoldingId })}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{a.code || a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-slate)', fontWeight: 900 }}>{formatPct(a.sharePct)}</div>
                </div>
                {a.attentionLabel ? <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-slate)' }}>{a.attentionLabel}</div> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Concentracao por instituicao — feature das branches */}
      {vm.institutions.some((i) => i.concentrationLevel !== 'low') ? (
        <section className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Concentracao por instituicao</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {vm.institutions.filter((i) => i.concentrationLevel !== 'low').map((i) => (
              <div key={i.platformId} style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(242,181,68,0.3)', background: 'rgba(242,181,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{i.platformName}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-slate)', fontWeight: 900 }}>{formatPct(i.sharePct)}</div>
                </div>
                {i.attentionLabel ? <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-slate)' }}>{i.attentionLabel}</div> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Grupos por categoria */}
      {props.filteredGroups.map((g) => (
        <section key={g.categoryKey} className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 900 }}>{g.categoryLabel}</div>
              <div style={{ fontSize: 12, color: 'var(--c-slate)' }}>{g.holdings.length} posicoes</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--c-slate)' }}>
              {formatMoney(g.totalCurrent)} | {formatPct(g.totalProfitLossPct)}
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            {g.holdings.map((h) => (
              <HoldingRow
                key={h.id}
                holding={h}
                onClick={() => props.onOpenHolding({ portfolioId: vm.portfolioId, holdingId: h.id })}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function HoldingRow(props: { holding: PortfolioHolding; onClick(): void }): JSX.Element {
  const h = props.holding;
  const perf = h.performancePct ?? null;
  return (
    <button
      type="button"
      className="btn btnGhost"
      onClick={props.onClick}
      style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }}
    >
      <div>
        <div style={{ fontWeight: 900, letterSpacing: -0.2 }}>
          {h.code ? `${h.code} ` : ''}
          <span style={{ fontWeight: 800, color: 'var(--c-slate)' }}>{h.name}</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-slate)' }}>
          {formatMoney(h.currentValue)}
          {h.allocationPct != null ? ` • ${formatPct(h.allocationPct)}` : ''}
          {h.platformName ? ` • ${h.platformName}` : ''}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 900 }}>{perf == null ? '—' : formatPct(perf)}</div>
        <div style={{ marginTop: 4, fontSize: 12, color: perf == null ? 'var(--c-slate)' : perf >= 0 ? 'var(--c-success)' : 'var(--c-danger)' }}>
          {h.quotationStatus}
        </div>
      </div>
    </button>
  );
}

function FilterPill(props: { label: string; selected: boolean; onClick(): void }): JSX.Element {
  return (
    <button
      type="button"
      className="btn btnGhost"
      onClick={props.onClick}
      style={{ padding: '8px 12px', borderRadius: 999, fontWeight: 900, borderColor: props.selected ? 'rgba(11,18,24,0.28)' : 'rgba(11,18,24,0.14)', background: props.selected ? 'rgba(11,18,24,0.06)' : 'rgba(255,255,255,0.72)' }}
    >
      {props.label}
    </button>
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

