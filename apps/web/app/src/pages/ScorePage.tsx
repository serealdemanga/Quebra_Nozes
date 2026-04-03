import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import type { AnalysisData } from "@/core/data/contracts";
import { BlockedState, ErrorState, LoadingState } from "@/components/system/SystemState";

export function ScorePage() {
  const ds = useDataSources();
  const [data, setData] = React.useState<AnalysisData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
      <header>
        <p className="ty-caption text-text-secondary">Score</p>
        <h1 className="ty-h1 font-display">Seu score</h1>
        <p className="ty-body text-text-secondary">Uma leitura simples do que pesa na sua nota.</p>
      </header>

      {error ? (
        <ErrorState
          title="Não consegui abrir seu score"
          body={error}
          ctaLabel="Tentar de novo"
          ctaTarget="/app/score"
          secondaryCtaLabel="Voltar para o Radar"
          secondaryCtaTarget="/app/radar"
        />
      ) : null}

      {!data && !error ? (
        <LoadingState title="Carregando score" body="Só um instante." />
      ) : data && data.screenState === "redirect_onboarding" ? (
        <BlockedState
          title="Falta um passo para destravar"
          body="Complete seu onboarding para gerar um score coerente."
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
              <CardTitle>Nota</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="ty-number-hi">
                {data.score.value}{" "}
                <span className="ty-caption text-text-secondary">
                  {humanScoreBand(data.score.value)}
                </span>
              </p>
              <p className="ty-body text-text-secondary">{data.score.explanation}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link to="/app/radar">Abrir Radar</Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link to="/app/portfolio">Ver carteira</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>O que mais pesa</CardTitle>
            </CardHeader>
            <CardContent>
              {data.insights.length ? (
                <ul className="space-y-2">
                  {[...data.insights]
                    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
                    .slice(0, 10)
                    .map((i, idx) => (
                      <li
                        key={`${i.kind}-${idx}`}
                        className="rounded-md border border-border-default bg-bg-primary p-3"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="ty-body">{i.title}</p>
                          <p className="ty-caption text-text-secondary">
                            {severityLabel(i.severity)}
                          </p>
                        </div>
                        <p className="ty-caption text-text-secondary">{i.body}</p>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="ty-body text-text-secondary">
                  Sem fatores suficientes para explicar o score.
                </p>
              )}
            </CardContent>
          </Card>
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

function humanScoreBand(value: number) {
  if (value < 40) return "precisa de atenção";
  if (value < 70) return "ok, mas melhorável";
  return "saudável";
}

function severityLabel(sev?: "info" | "warning" | "critical") {
  if (sev === "critical") return "crítico";
  if (sev === "warning") return "atenção";
  return "info";
}
