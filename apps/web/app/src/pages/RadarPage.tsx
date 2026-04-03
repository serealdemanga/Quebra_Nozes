import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import type { AnalysisData } from "@/core/data/contracts";
import { BlockedState, ErrorState, LoadingState } from "@/components/system/SystemState";

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
        <BlockedState
          title="Falta um passo para destravar"
          body="Complete seu onboarding para gerar uma leitura coerente da sua carteira."
          ctaLabel="Continuar onboarding"
          ctaTarget={normalizeAppTarget(data.redirectTo)}
          secondaryCtaLabel="Ir para o Perfil"
          secondaryCtaTarget="/app/profile"
        />
      ) : data && data.screenState === "pending" ? (
        <LoadingState title="Gerando sua análise" body={data.pendingState.body} />
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
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link to="/app/score">Ver detalhe do score</Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link to="/app/profile">Revisar contexto</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Principal problema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="ty-h3 font-display">{data.primaryProblem.title}</p>
                <p className="ty-body text-text-secondary">{data.primaryProblem.body}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Próxima ação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="ty-h3 font-display">{data.primaryAction.title}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Resumo executivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="ty-body text-text-secondary">{data.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {data.insights.length ? (
                <ul className="space-y-2">
                  {[...data.insights]
                    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
                    .slice(0, 8)
                    .map((i, idx) => (
                      <li
                        key={`${i.kind}-${idx}`}
                        className="rounded-md border border-border-default bg-bg-primary p-3"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="ty-body">{i.title}</p>
                          <p className="ty-caption text-text-secondary">
                            {i.severity ? severityLabel(i.severity) : ""}
                          </p>
                        </div>
                        <p className="ty-caption text-text-secondary">{i.body}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="secondary">
                            <Link to={`/app/alerts/${encodeURIComponent(buildAlertId(data.analysisId, idx))}`}>
                              Ver detalhe
                            </Link>
                          </Button>
                          {i.ctaLabel && i.target ? (
                            <Button asChild size="sm">
                              <Link to={normalizeAppTarget(i.target)}>{i.ctaLabel}</Link>
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="rounded-md border border-border-default bg-bg-surface p-3">
                  <p className="ty-caption text-text-secondary">Sem insights</p>
                  <p className="ty-body text-text-secondary">
                    Quando houver sinais suficientes, os insights aparecem aqui.
                  </p>
                  <div className="mt-3">
                    <Button asChild size="sm" variant="secondary">
                      <Link to="/app/portfolio">Ver carteira</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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

function buildAlertId(analysisId: string, index: number) {
  return `${analysisId}:${index}`;
}

function severityLabel(sev: "info" | "warning" | "critical") {
  if (sev === "critical") return "crítico";
  if (sev === "warning") return "atenção";
  return "info";
}
