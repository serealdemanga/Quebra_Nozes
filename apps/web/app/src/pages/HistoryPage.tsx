import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDataSources } from "@/core/data/react";
import type { HistoryTimelineData } from "@/core/data/contracts";
import { useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "@/components/system/SystemState";

export function HistoryPage() {
  const ds = useDataSources();
  const [sp] = useSearchParams();
  const [data, setData] = React.useState<HistoryTimelineData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await ds.history.getHistoryTimeline({ limit: 50 });
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
  }, [ds]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="ty-caption text-text-secondary">Histórico</p>
          <h1 className="ty-h1 font-display">Sua trajetória</h1>
          <p className="ty-body text-text-secondary">
            O que mudou, quando mudou, e o que isso significa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to="/app/history/imports">Importações</Link>
          </Button>
        </div>
      </header>

      {sp.get("snapshotId") ? (
        <div className="rounded-lg border border-border-default bg-bg-primary p-5 shadow-card">
          <p className="ty-caption text-text-secondary">Importação concluída</p>
          <p className="ty-body">
            Snapshot {sp.get("snapshotId")} criado
            {sp.get("affected") ? ` • ${sp.get("affected")} posições afetadas` : ""}.
          </p>
        </div>
      ) : null}

      {error ? (
        <ErrorState
          title="Não consegui abrir seu histórico"
          body={error}
          ctaLabel="Tentar de novo"
          ctaTarget="/app/history"
        />
      ) : null}

      {!data && !error ? (
        <LoadingState title="Carregando histórico" body="Estamos montando sua linha do tempo." />
      ) : data && data.screenState === "redirect_onboarding" ? (
        <Card>
          <CardHeader>
            <CardTitle>Falta pouco</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="ty-body text-text-secondary">
              Complete seu contexto para destravar o histórico.
            </p>
            <div className="mt-3">
              <Button asChild>
                <Link to={normalizeAppTarget(data.redirectTo)}>Continuar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : data && data.screenState === "empty" ? (
        <EmptyState
          title={data.emptyState.title}
          body={data.emptyState.body}
          ctaLabel={data.emptyState.ctaLabel}
          ctaTarget={normalizeAppTarget(data.emptyState.target)}
        />
      ) : data ? (
        <Card>
          <CardHeader>
            <CardTitle>Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.items.map((it) =>
                it.kind === "snapshot" ? (
                  <li
                    key={it.id}
                    className="rounded-md border border-border-default bg-bg-primary p-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="ty-body">
                        Snapshot • {formatDate(it.referenceDate)}
                      </p>
                      <p className="ty-tabular">{formatMoney(it.totals.totalEquity)}</p>
                    </div>
                    {it.recommendation ? (
                      <p className="ty-caption text-text-secondary">
                        {it.recommendation.primaryProblem} • {it.recommendation.primaryAction}
                        {it.recommendation.scoreValue != null ? ` • Score ${it.recommendation.scoreValue}` : ""}
                      </p>
                    ) : (
                      <p className="ty-caption text-text-secondary">Sem recomendação associada.</p>
                    )}
                  </li>
                ) : (
                  <li
                    key={it.id}
                    className="rounded-md border border-border-default bg-bg-surface p-3"
                  >
                    <p className="ty-body">
                      Evento • {it.type} ({it.status})
                    </p>
                    {it.message ? (
                      <p className="ty-caption text-text-secondary">{it.message}</p>
                    ) : null}
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>
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

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(iso));
}
