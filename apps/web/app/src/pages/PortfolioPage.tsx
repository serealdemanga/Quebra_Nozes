import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import type { PortfolioData } from "@/core/data/contracts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  BlockedState,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/system/SystemState";

export function PortfolioPage() {
  const ds = useDataSources();
  const [performance, setPerformance] = React.useState<"all" | "best" | "worst">(
    "all",
  );
  const [data, setData] = React.useState<PortfolioData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await ds.portfolio.getPortfolio({ performance });
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
  }, [ds, performance]);

  return (
    <div className="space-y-4">
      <header>
        <p className="ty-caption text-text-secondary">Carteira</p>
        <h1 className="ty-h1 font-display">Visão geral</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Posições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="ty-caption text-text-secondary">Filtro</span>
            <Button
              variant={performance === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setPerformance("all")}
            >
              Todas
            </Button>
            <Button
              variant={performance === "best" ? "default" : "secondary"}
              size="sm"
              onClick={() => setPerformance("best")}
            >
              Melhores
            </Button>
            <Button
              variant={performance === "worst" ? "default" : "secondary"}
              size="sm"
              onClick={() => setPerformance("worst")}
            >
              Piores
            </Button>
          </div>

          {error ? (
            <ErrorState
              title="Não consegui abrir sua carteira"
              body={error}
              ctaLabel="Tentar de novo"
              ctaTarget="/app/portfolio"
              secondaryCtaLabel="Ir para a Home"
              secondaryCtaTarget="/app/home"
            />
          ) : !data ? (
            <LoadingState
              title="Carregando posições"
              body="Estamos puxando suas posições e agrupando por categoria."
            />
          ) : data.screenState === "redirect_onboarding" ? (
            <BlockedState
              title="Falta um passo para destravar"
              body="Complete o onboarding para liberar sua visão de carteira."
              ctaLabel="Continuar onboarding"
              ctaTarget={normalizeAppTarget(data.redirectTo)}
              secondaryCtaLabel="Ver importação"
              secondaryCtaTarget="/app/import"
            />
          ) : data.screenState === "empty" ? (
            <EmptyState
              title={data.emptyState.title}
              body={data.emptyState.body}
              ctaLabel={data.emptyState.ctaLabel}
              ctaTarget={normalizeAppTarget(data.emptyState.target)}
            />
          ) : (
            <div className="space-y-4">
              {data.groups.map((g) => (
                <div key={g.categoryKey} className="rounded-md border border-border-default p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="ty-h3 font-display">{g.categoryLabel}</h3>
                    <span className="ty-tabular">{formatMoney(g.totalCurrent)}</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {g.holdings.map((h) => (
                      <li key={h.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`/app/portfolio/${encodeURIComponent(data.portfolioId)}/holdings/${encodeURIComponent(h.id)}`}
                            className="ty-body underline decoration-border-default underline-offset-4 hover:decoration-text-secondary"
                          >
                            {h.name}
                          </Link>
                          <p className="ty-caption text-text-secondary">
                            {h.code ?? "Sem código"} {h.platformName ? `• ${h.platformName}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="ty-tabular">{formatMoney(h.currentValue)}</p>
                          <p className="ty-caption text-text-secondary">
                            {h.performancePct != null ? `${h.performancePct.toFixed(2)}%` : "—"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
