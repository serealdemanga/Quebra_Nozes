import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import type { HoldingDetailData } from "@/core/data/contracts";
import { ErrorState, LoadingState } from "@/components/system/SystemState";

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
        <Card>
          <CardHeader>
            <CardTitle>Falta pouco</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="ty-body text-text-secondary">
              Complete seu onboarding para destravar este detalhe.
            </p>
            <div className="mt-3">
              <Button asChild>
                <Link to={normalizeAppTarget(data.redirectTo)}>Continuar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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
