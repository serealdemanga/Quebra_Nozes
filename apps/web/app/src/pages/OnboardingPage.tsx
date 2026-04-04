import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import type { ProfileContextPayload, ProfileContextStep } from "@/core/data/contracts";
import { ErrorState, InsufficientDataState, LoadingState } from "@/components/system/SystemState";

export function OnboardingPage() {
  const ds = useDataSources();
  const nav = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<ProfileContextStep>("goal");
  const [context, setContext] = React.useState<ProfileContextPayload | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await ds.profile.getProfileContext();
      if (!res.ok) {
        setError(res.error.message);
        setLoading(false);
        return;
      }
      setContext(res.data.context);
      setStep((res.data.onboarding.currentStep as ProfileContextStep) ?? "goal");
      if (res.data.onboarding.completedSteps?.length) setStarted(true);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar.");
      setLoading(false);
    }
  }, [ds]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function save(nextStep?: ProfileContextStep) {
    if (!context) return;
    setSaving(true);
    setError(null);
    try {
      const res = await ds.profile.putProfileContext({
        step: nextStep ?? step,
        context,
      });
      if (!res.ok) {
        setError(res.error.message);
      } else {
        await load();
        // Se o backend liberou a home, seguimos automaticamente.
        if (res.data.onboarding.homeUnlocked) {
          nav("/app/home", { replace: true });
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <p className="ty-caption text-text-secondary">Onboarding</p>
          <h1 className="ty-h1 font-display">Preparando</h1>
        </header>
        <LoadingState title="Carregando onboarding" body="Sem burocracia." />
      </div>
    );
  }

  if (!started && step === "goal") {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <p className="ty-caption text-text-secondary">Onboarding</p>
          <h1 className="ty-h1 font-display">Bem-vindo</h1>
          <p className="ty-body text-text-secondary">
            Rápido, leve e sem burocracia. Você ajusta depois no Perfil.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>O que vamos perguntar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              <li className="ty-body text-text-secondary">Objetivo principal da sua carteira</li>
              <li className="ty-body text-text-secondary">Renda e horizonte (para calibrar recomendações)</li>
              <li className="ty-body text-text-secondary">Onde você investe (para evitar sugestões impossíveis)</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setStarted(true)}>Começar</Button>
              <Button asChild variant="secondary">
                <Link to="/app/home">Pular por agora</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="ty-caption text-text-secondary">Onboarding</p>
        <h1 className="ty-h1 font-display">Vamos destravar seu valor</h1>
        <p className="ty-body text-text-secondary">
          Leve e rápido. Você ajusta depois no Perfil.
        </p>
      </header>

      {error ? (
        <ErrorState
          title="Não consegui abrir seu onboarding"
          body={error}
          ctaLabel="Tentar de novo"
          ctaTarget="/app/onboarding"
          secondaryCtaLabel="Voltar para a Home"
          secondaryCtaTarget="/app/home"
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{stepTitle(step)}</CardTitle>
        </CardHeader>
        <CardContent>
          {!context ? (
            <InsufficientDataState
              title="Sem dados de contexto"
              body="Tente novamente. Se persistir, avance para a Home e volte depois."
              ctaLabel="Recarregar onboarding"
              ctaTarget="/app/onboarding"
            />
          ) : (
            <>
              {step === "goal" ? (
                <GoalStep
                  value={context.financialGoal}
                  onChange={(v) => setContext((c) => (c ? { ...c, financialGoal: v } : c))}
                />
              ) : null}

              {step === "risk_quiz" ? (
                <RiskStep
                  value={context.riskProfileQuizResult}
                  onChange={(v) =>
                    setContext((c) => (c ? { ...c, riskProfileQuizResult: v, riskProfileEffective: v } : c))
                  }
                />
              ) : null}

              {step === "income_horizon" ? (
                <IncomeStep
                  incomeRange={context.monthlyIncomeRange}
                  horizon={context.investmentHorizon}
                  onChange={(patch) =>
                    setContext((c) => (c ? { ...c, ...patch } : c))
                  }
                />
              ) : null}

              {step === "platforms" ? (
                <PlatformsStep
                  value={context.platformsUsed?.platformIds ?? []}
                  onChange={(platformIds) =>
                    setContext((c) =>
                      c
                        ? {
                            ...c,
                            platformsUsed: { platformIds, otherPlatforms: [] },
                          }
                        : c,
                    )
                  }
                />
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {step !== "goal" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(prevStep(step))}
                    disabled={saving}
                  >
                    Voltar
                  </Button>
                ) : null}
                <Button
                  onClick={() => save(nextStep(step))}
                  disabled={saving}
                >
                  {saving ? "Salvando…" : step === "platforms" ? "Concluir" : "Continuar"}
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/app/home">Pular por agora</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function stepTitle(step: ProfileContextStep) {
  if (step === "goal") return "Seu objetivo";
  if (step === "risk_quiz") return "Seu perfil de risco";
  if (step === "income_horizon") return "Renda e horizonte";
  if (step === "platforms") return "Onde você investe";
  return "Onboarding";
}

function nextStep(step: ProfileContextStep): ProfileContextStep {
  if (step === "goal") return "risk_quiz";
  if (step === "risk_quiz") return "income_horizon";
  if (step === "income_horizon") return "platforms";
  return "platforms";
}

function prevStep(step: ProfileContextStep): ProfileContextStep {
  if (step === "platforms") return "income_horizon";
  if (step === "income_horizon") return "goal";
  if (step === "risk_quiz") return "goal";
  return "goal";
}

function GoalStep({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const options = [
    { key: "equilibrar_e_crescer", label: "Equilibrar e crescer" },
    { key: "reduzir_risco", label: "Reduzir risco" },
    { key: "aposentadoria", label: "Construir aposentadoria" },
  ];

  return (
    <div className="space-y-3">
      <p className="ty-body text-text-secondary">
        Qual é a intenção principal da sua carteira hoje?
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Button
            key={o.key}
            type="button"
            variant={value === o.key ? "default" : "secondary"}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function RiskStep({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const options = [
    { key: "conservador", label: "Conservador" },
    { key: "moderado", label: "Moderado" },
    { key: "arrojado", label: "Arrojado" },
  ];

  return (
    <div className="space-y-3">
      <p className="ty-body text-text-secondary">
        Qual perfil mais combina com você hoje?
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Button
            key={o.key}
            type="button"
            variant={value === o.key ? "default" : "secondary"}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </Button>
        ))}
      </div>
      <p className="ty-caption text-text-secondary">
        Isso não executa ordens. Só calibra a orientação.
      </p>
    </div>
  );
}

function IncomeStep({
  incomeRange,
  horizon,
  onChange,
}: {
  incomeRange: string | null;
  horizon: string | null;
  onChange: (patch: { monthlyIncomeRange?: string | null; investmentHorizon?: string | null }) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="ty-label text-text-secondary">Renda mensal (faixa)</label>
        <select
          className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 ty-body"
          value={incomeRange ?? ""}
          onChange={(e) => onChange({ monthlyIncomeRange: e.target.value || null })}
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
        <label className="ty-label text-text-secondary">Horizonte</label>
        <select
          className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 ty-body"
          value={horizon ?? ""}
          onChange={(e) => onChange({ investmentHorizon: e.target.value || null })}
        >
          <option value="">Selecione</option>
          <option value="curto_prazo">Curto</option>
          <option value="medio_prazo">Médio</option>
          <option value="longo_prazo">Longo</option>
        </select>
      </div>
    </div>
  );
}

function PlatformsStep({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const options = [
    { key: "xp", label: "XP" },
    { key: "ion", label: "Íon Itaú" },
    { key: "nubank", label: "Nubank" },
    { key: "btg", label: "BTG" },
  ];

  function toggle(k: string) {
    const next = value.includes(k) ? value.filter((x) => x !== k) : [...value, k];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <p className="ty-body text-text-secondary">
        Onde você costuma investir? (pode marcar mais de um)
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Button
            key={o.key}
            type="button"
            variant={value.includes(o.key) ? "default" : "secondary"}
            onClick={() => toggle(o.key)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ConfirmStep removido: o backend nao aceita step=confirm (release 0.1).
