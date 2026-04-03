import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import type { HoldingDetailData, HoldingDetailDataReady } from "@/core/data/contracts";
import { BlockedState, ErrorState, LoadingState } from "@/components/system/SystemState";

export function HoldingDetailPage() {
  const { portfolioId, holdingId } = useParams();
  const ds = useDataSources();
  const [data, setData] = React.useState<HoldingDetailData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!portfolioId || !holdingId) return;
      try {
        const res = await ds.holdingDetail.getHoldingDetail({ portfolioId, holdingId });
        if (cancelled) return;
        if (!res.ok) {
          setError(res.error.message);
          return;
        }
        setData(res.data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Falha ao carregar.");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [ds, portfolioId, holdingId]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="ty-caption text-text-secondary">Detalhe</p>
          <h1 className="ty-h1 font-display">Investimento</h1>
        </div>
        <Button asChild variant="secondary">
          <Link to="/app/portfolio">Voltar</Link>
        </Button>
      </header>

      {error ? (
        <ErrorState
          title="Não consegui abrir o detalhe"
          body={error}
          ctaLabel="Voltar"
          ctaTarget="/app/portfolio"
        />
      ) : null}

      {!data && !error ? (
        <LoadingState title="Carregando detalhe" body="Só um instante." />
      ) : data && data.screenState === "redirect_onboarding" ? (
        <BlockedState
          title="Falta um passo para destravar"
          body="Complete o onboarding para ver o detalhe e recomendações deste investimento."
          ctaLabel="Continuar onboarding"
          ctaTarget={normalizeAppTarget(data.redirectTo)}
          secondaryCtaLabel="Voltar para a carteira"
          secondaryCtaTarget="/app/portfolio"
        />
      ) : data ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{data.holding.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="ty-caption text-text-secondary">
                {data.holding.code ?? "Sem código"}{" "}
                {data.holding.platformName ? `• ${data.holding.platformName}` : ""}
              </p>
              <div className="mt-3 grid gap-3 rounded-md border border-border-default bg-bg-surface p-3 md:grid-cols-2">
                <div>
                  <p className="ty-caption text-text-secondary">Valor atual</p>
                  <p className="ty-tabular">{formatMoney(data.holding.currentValue)}</p>
                </div>
                <div>
                  <p className="ty-caption text-text-secondary">Alocação</p>
                  <p className="ty-tabular">
                    {data.holding.allocationPct != null ? `${data.holding.allocationPct.toFixed(2)}%` : "—"}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <p className="ty-caption text-text-secondary">Recomendação</p>
                <p className="ty-body">{data.holding.recommendation}</p>
              </div>

              <div className="mt-4">
                <p className="ty-caption text-text-secondary">Sinais</p>
                <SignalsBlock data={data} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{data.recommendation.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="ty-body text-text-secondary">{data.recommendation.body}</p>
              <div className="mt-3 rounded-md border border-border-default bg-bg-surface p-3">
                <p className="ty-caption text-text-secondary">Ranking</p>
                <p className="ty-body">
                  {data.ranking.status} • {data.ranking.score}/100
                </p>
              </div>
              {data.externalLink ? (
                <div className="mt-3">
                  <Button asChild variant="ghost">
                    <a href={data.externalLink} target="_blank" rel="noreferrer">
                      Abrir referência externa
                    </a>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function normalizeAppTarget(target: string) {
  if (!target.startsWith("/")) return `/app/${target}`;
  if (target.startsWith("/app/")) return target;
  return `/app${target}`;
}

function formatMoney(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(v);
}

type Signal = { kind: "positive" | "attention"; label: string; body?: string };

function renderSignals(data: HoldingDetailDataReady): Signal[] {
  const res: Signal[] = [];
  const h = data.holding;

  const perf = h.performancePct ?? null;
  if (typeof perf === "number") {
    if (perf > 0.01) {
      res.push({
        kind: "positive",
        label: "Em alta no seu preço médio",
        body: `Este investimento está ${perf.toFixed(2)}% acima do seu preço médio.`,
      });
    } else if (perf < -0.01) {
      res.push({
        kind: "attention",
        label: "Abaixo do seu preço médio",
        body: `Este investimento está ${Math.abs(perf).toFixed(2)}% abaixo do seu preço médio.`,
      });
    }
  }

  const alloc = h.allocationPct ?? null;
  if (typeof alloc === "number") {
    if (alloc >= 20) {
      res.push({
        kind: "attention",
        label: "Concentração alta",
        body: `Peso na carteira: ${alloc.toFixed(2)}%.`,
      });
    } else if (alloc <= 2 && alloc > 0) {
      res.push({
        kind: "positive",
        label: "Peso controlado",
        body: `Peso na carteira: ${alloc.toFixed(2)}%.`,
      });
    }
  }

  if (data.ranking.motives.length) {
    const kind: Signal["kind"] = data.ranking.score >= 70 ? "positive" : "attention";
    for (const m of data.ranking.motives.slice(0, 4)) {
      res.push({ kind, label: m });
    }
  }

  if (res.length === 0) {
    res.push({
      kind: "attention",
      label: "Sem sinais suficientes",
      body: "Precisamos de mais dados para indicar sinais com confiança.",
    });
  }

  return res;
}

function SignalsBlock({ data }: { data: HoldingDetailDataReady }) {
  const signals = renderSignals(data);
  const positive = signals.filter((s) => s.kind === "positive");
  const attention = signals.filter((s) => s.kind === "attention");

  return (
    <div className="mt-2 grid gap-3 md:grid-cols-2">
      <div className="rounded-md border border-border-default bg-bg-surface p-3">
        <p className="ty-caption text-text-secondary">Sinais favoráveis</p>
        {positive.length ? (
          <ul className="mt-2 space-y-2">
            {positive.map((s) => (
              <li key={`p:${s.label}`} className="rounded-md border border-border-default bg-bg-primary p-3">
                <p className="ty-body">{s.label}</p>
                {s.body ? <p className="ty-caption text-text-secondary">{s.body}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 ty-body text-text-secondary">Sem sinais claros por enquanto.</p>
        )}
      </div>

      <div className="rounded-md border border-border-default bg-bg-surface p-3">
        <p className="ty-caption text-text-secondary">Pontos de atenção</p>
        {attention.length ? (
          <ul className="mt-2 space-y-2">
            {attention.map((s) => (
              <li key={`a:${s.label}`} className="rounded-md border border-border-default bg-bg-primary p-3">
                <p className="ty-body">{s.label}</p>
                {s.body ? <p className="ty-caption text-text-secondary">{s.body}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 ty-body text-text-secondary">Nada crítico identificado.</p>
        )}
      </div>
    </div>
  );
}
