import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDataSources } from "@/core/data/react";
import type { ProfileContextPayload } from "@/core/data/contracts";

export function ProfilePage() {
  const ds = useDataSources();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
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
      if (!res.ok) setError(res.error.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="ty-caption text-text-secondary">Perfil</p>
        <h1 className="ty-h1 font-display">Seu contexto</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dados base</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="ty-body text-text-secondary">Carregando…</p>
          ) : (
            <>
              {error ? <p className="ty-body text-state-error">{error}</p> : null}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
