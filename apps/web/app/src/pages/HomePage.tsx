import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDataSources } from "@/core/data/react";
import type { DashboardHomeData } from "@/core/data/contracts";
import { Link } from "react-router-dom";
import {
  BlockedState,
  ErrorState,
  LoadingState,
} from "@/components/system/SystemState";

export function HomePage() {
  const ds = useDataSources();
  const [data, setData] = React.useState<DashboardHomeData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await ds.dashboard.getDashboardHome();
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
      <section className="rounded-lg border border-border-default bg-bg-primary p-5 shadow-card">
        <p className="ty-caption text-text-secondary">Resumo</p>
        <h1 className="ty-h1 font-display">Seu panorama</h1>

        {error ? (
          <ErrorState
            title="Não consegui abrir sua Home"
            body={error}
            ctaLabel="Tentar de novo"
            ctaTarget="/app/home"
            secondaryCtaLabel="Ir para o perfil"
            secondaryCtaTarget="/app/profile"
          />
        ) : !data ? (
          <LoadingState
            title="Carregando Home"
            body="Estamos montando seu panorama."
          />
        ) : data.screenState === "redirect_onboarding" ? (
          <BlockedState
            title="Falta um passo para destravar"
            body="Complete o onboarding para liberar seus dados e recomendações."
            ctaLabel="Continuar onboarding"
            ctaTarget={normalizeAppTarget(data.redirectTo)}
            secondaryCtaLabel="Ver importação"
            secondaryCtaTarget="/app/import"
          />
        ) : (
          <>
            <div className="mt-4 grid gap-3 rounded-lg border border-border-default bg-bg-surface p-4 md:grid-cols-3">
              <div>
                <p className="ty-caption text-text-secondary">Patrimônio</p>
                <p className="ty-number-hi">{formatMoney(data.hero.totalEquity)}</p>
              </div>
              <div>
                <p className="ty-caption text-text-secondary">Investido</p>
                <p className="ty-tabular">{formatMoney(data.hero.totalInvested)}</p>
              </div>
              <div>
                <p className="ty-caption text-text-secondary">Resultado</p>
                <p className="ty-tabular">
                  {formatMoney(data.hero.totalProfitLoss)} ({formatPct(data.hero.totalProfitLossPct)})
                </p>
              </div>
            </div>

            {data.sourceWarning ? (
              <div className="mt-3 rounded-md border border-border-default bg-bg-surface p-3">
                <p className="ty-caption text-text-secondary">Aviso</p>
                <p className="ty-body">{data.sourceWarning}</p>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="ty-caption text-text-secondary">Score</p>
                <p className="ty-h2 font-display">
                  {data.score.value} <span className="ty-caption text-text-secondary">{data.score.status}</span>
                </p>
                <p className="ty-body text-text-secondary">{data.score.explanation}</p>
              </div>
              <Button asChild>
                <Link to={normalizeAppTarget(data.primaryAction.target)}>
                  {data.primaryAction.ctaLabel}
                </Link>
              </Button>
            </div>

            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowDetails((v) => !v)}
              >
                {showDetails ? "Ocultar detalhes" : "Ver detalhes"}
              </Button>
            </div>

            {showDetails ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.distribution.map((d) => (
                        <li
                          key={d.key}
                          className="flex items-center justify-between gap-3 rounded-md border border-border-default bg-bg-primary p-3"
                        >
                          <div className="min-w-0">
                            <p className="ty-body">{d.label}</p>
                            <p className="ty-caption text-text-secondary">
                              {d.sharePct.toFixed(2)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="ty-tabular">{formatMoney(d.value)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <Button asChild variant="secondary">
                        <Link to="/app/portfolio">Abrir carteira</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.insights.length === 0 ? (
                      <p className="ty-body text-text-secondary">Nada urgente por aqui.</p>
                    ) : (
                      <ul className="space-y-2">
                        {data.insights.map((i, idx) => (
                          <li
                            key={`${i.kind}-${idx}`}
                            className="rounded-md border border-border-default bg-bg-primary p-3"
                          >
                            <p className="ty-body">{i.title}</p>
                            <p className="ty-caption text-text-secondary">{i.body}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </>
        )}
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximo passo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="ty-body text-text-secondary">
              Conectar com API real via <code>VITE_API_BASE_URL</code> e trocar
              o modo para <code>http</code>.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="ty-body text-text-secondary">
              Placeholder para estado de risco, concentração e recomendações.
            </p>
          </CardContent>
        </Card>
      </div>
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

function formatPct(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(v / 100);
}
