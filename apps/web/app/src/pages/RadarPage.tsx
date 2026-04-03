import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import type { AnalysisData } from "@/core/data/contracts";
import { ErrorState, LoadingState } from "@/components/system/SystemState";

export function RadarPage() {
  const ds = useDataSources();
  const [data, setData] = React.useState<AnalysisData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showPlan, setShowPlan] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await ds.analysis.getAnalysis();
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
      <header className="space-y-1">
        <p className="ty-caption text-text-secondary">Radar</p>
        <h1 className="ty-h1 font-display">O que merece atenção</h1>
        <p className="ty-body text-text-secondary">
          Tradução do momento e próximo passo, sem economês.
        </p>
      </header>

      {error ? (
        <ErrorState
          title="Não consegui abrir o Radar"
          body={error}
          ctaLabel="Tentar de novo"
          ctaTarget="/app/radar"
        />
      ) : null}

      {!data && !error ? (
        <LoadingState title="Carregando Radar" body="Estamos buscando sua análise." />
      ) : data && data.screenState === "redirect_onboarding" ? (
        <Card>
          <CardHeader>
            <CardTitle>Falta pouco</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="ty-body text-text-secondary">
              Complete seu contexto para destravar o Radar.
            </p>
            <div className="mt-3">
              <Button asChild>
                <Link to={normalizeAppTarget(data.redirectTo)}>Continuar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : data && data.screenState === "pending" ? (
        <Card>
          <CardHeader>
            <CardTitle>Gerando sua análise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="ty-body text-text-secondary">{data.pendingState.body}</p>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="ty-number-hi">
                {data.score.value}{" "}
                <span className="ty-caption text-text-secondary">{data.score.status}</span>
              </p>
              <p className="ty-body text-text-secondary">{data.score.explanation}</p>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{data.primaryProblem.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="ty-body text-text-secondary">{data.primaryProblem.body}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{data.primaryAction.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="ty-body text-text-secondary">{data.primaryAction.body}</p>
                <div className="mt-3">
                  <Button asChild>
                    <Link to={normalizeAppTarget(data.primaryAction.target)}>
                      {data.primaryAction.ctaLabel}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Button variant="secondary" onClick={() => setShowPlan((v) => !v)}>
              {showPlan ? "Ocultar plano" : "Ver plano"}
            </Button>
          </div>

          {showPlan ? (
            <Card>
              <CardHeader>
                <CardTitle>Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="ty-body text-text-secondary">{data.portfolioDecision}</p>
                <ul className="mt-3 space-y-2">
                  {data.actionPlan.map((x, idx) => (
                    <li
                      key={idx}
                      className="rounded-md border border-border-default bg-bg-primary p-3"
                    >
                      <p className="ty-body">{x}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function normalizeAppTarget(target: string) {
  if (!target.startsWith("/")) return `/app/${target}`;
  if (target.startsWith("/app/")) return target;
  return `/app${target}`;
}
