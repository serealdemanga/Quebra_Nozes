import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDataSources } from "@/core/data/react";
import type { ProfileContextPayload } from "@/core/data/contracts";
import { ErrorState, LoadingState, SuccessState } from "@/components/system/SystemState";
import { Link } from "react-router-dom";

export function ProfilePage() {
  const ds = useDataSources();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [context, setContext] = React.useState<ProfileContextPayload>({
    financialGoal: null,
    monthlyIncomeRange: null,
    monthlyInvestmentTarget: null,
    availableToInvest: null,
    riskProfileSelfDeclared: null,
    riskProfileQuizResult: null,
    riskProfileEffective: null,
    investmentHorizon: null,
    platformsUsed: null,
    displayPreferences: { ghostMode: false },
  });

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await ds.profile.getProfileContext();
        if (cancelled) return;
        if (!res.ok) {
          setError(res.error.message);
          setLoading(false);
          return;
        }
        setContext(res.data.context);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Falha ao carregar.");
        setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [ds]);

  async function onSave() {
    setSaved(false);
    setError(null);
    try {
      const res = await ds.profile.putProfileContext({
        step: "income_horizon",
        context: {
          monthlyIncomeRange: context.monthlyIncomeRange,
          monthlyInvestmentTarget: context.monthlyInvestmentTarget,
          availableToInvest: context.availableToInvest,
        },
      });
      if (!res.ok) {
        setError(res.error.message);
      } else {
        setSaved(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <header>
          <p className="ty-caption text-text-secondary">Perfil</p>
          <h1 className="ty-h1 font-display">Seu contexto</h1>
        </header>
        <LoadingState title="Carregando seu perfil" body="Só um instante." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <header>
          <p className="ty-caption text-text-secondary">Perfil</p>
          <h1 className="ty-h1 font-display">Seu contexto</h1>
        </header>
        <ErrorState
          title="Não consegui abrir seu perfil"
          body={error}
          ctaLabel="Tentar de novo"
          ctaTarget="/app/profile"
          secondaryCtaLabel="Ir para a Home"
          secondaryCtaTarget="/app/home"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="ty-caption text-text-secondary">Perfil</p>
        <h1 className="ty-h1 font-display">Seu contexto</h1>
        <p className="ty-body text-text-secondary">
          Este é o contexto que o produto usa para interpretar sua carteira e
          evitar recomendações fora da sua realidade.
        </p>
      </header>

      {saved ? (
        <SuccessState
          title="Salvo"
          body="Seu contexto foi atualizado."
          ctaLabel="Voltar para a Home"
          ctaTarget="/app/home"
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Como isso afeta sua leitura</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="ty-body text-text-secondary">
                Renda e capacidade de aporte ajudam a priorizar o que importa agora.
              </li>
              <li className="ty-body text-text-secondary">
                Horizonte e objetivo ajudam a calibrar risco e expectativas.
              </li>
              <li className="ty-body text-text-secondary">
                Plataformas usadas evitam “sugestões impossíveis” e melhoram o import.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do contexto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md border border-border-default bg-bg-surface p-3">
              <p className="ty-caption text-text-secondary">Objetivo</p>
              <p className="ty-body">{context.financialGoal ?? "—"}</p>
            </div>
            <div className="rounded-md border border-border-default bg-bg-surface p-3">
              <p className="ty-caption text-text-secondary">Horizonte</p>
              <p className="ty-body">{context.investmentHorizon ?? "—"}</p>
            </div>
            <div className="rounded-md border border-border-default bg-bg-surface p-3">
              <p className="ty-caption text-text-secondary">Plataformas</p>
              <p className="ty-body">
                {context.platformsUsed?.platformIds?.length
                  ? context.platformsUsed.platformIds.join(", ")
                  : "—"}
              </p>
            </div>
            <div className="pt-1">
              <Button asChild variant="secondary">
                <Link to="/app/onboarding">Editar onboarding</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados base</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="ty-label text-text-secondary">Renda mensal (faixa)</label>
              <select
                className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 ty-body"
                value={context.monthlyIncomeRange ?? ""}
                onChange={(e) =>
                  setContext((c) => ({ ...c, monthlyIncomeRange: e.target.value || null }))
                }
              >
                <option value="">Selecione</option>
                <option value="0-5k">0-5k</option>
                <option value="5k-10k">5k-10k</option>
                <option value="10k-15k">10k-15k</option>
                <option value="15k-25k">15k-25k</option>
                <option value="25k+">25k+</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="ty-label text-text-secondary">Meta de aporte (mês)</label>
              <Input
                placeholder="Ex: 1200"
                inputMode="numeric"
                value={context.monthlyInvestmentTarget ?? ""}
                onChange={(e) =>
                  setContext((c) => ({
                    ...c,
                    monthlyInvestmentTarget: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="ty-label text-text-secondary">Disponível para investir</label>
              <Input
                placeholder="Ex: 500"
                inputMode="numeric"
                value={context.availableToInvest ?? ""}
                onChange={(e) =>
                  setContext((c) => ({
                    ...c,
                    availableToInvest: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={onSave}>Salvar</Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
