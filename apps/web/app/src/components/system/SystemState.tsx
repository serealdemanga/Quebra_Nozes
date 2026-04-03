import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type StateAction = {
  label: string;
  target: string;
  variant?: "default" | "secondary";
};

function StateCard({
  kicker,
  title,
  body,
  actions,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  actions?: StateAction[];
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-primary p-5 shadow-card">
      <p className="ty-caption text-text-secondary">{kicker}</p>
      <h2 className="ty-h2 font-display">{title}</h2>
      <p className="ty-body text-text-secondary">{body}</p>
      {children ? <div className="mt-3">{children}</div> : null}
      {actions && actions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((a) => (
            <Button key={`${a.target}:${a.label}`} asChild variant={a.variant ?? "default"}>
              <Link to={a.target}>{a.label}</Link>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LoadingState({
  title = "Carregando",
  body = "Só um instante.",
}: {
  title?: string;
  body?: string;
}) {
  return <StateCard kicker="Aguarde" title={title} body={body} />;
}

export function ErrorState({
  title = "Algo não funcionou",
  body = "Tente novamente em instantes.",
  ctaLabel = "Voltar",
  ctaTarget = "/app/home",
  secondaryCtaLabel,
  secondaryCtaTarget,
}: {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaTarget?: string;
  secondaryCtaLabel?: string;
  secondaryCtaTarget?: string;
}) {
  const actions: StateAction[] = [{ label: ctaLabel, target: ctaTarget, variant: "default" }];
  if (secondaryCtaLabel && secondaryCtaTarget) {
    actions.push({
      label: secondaryCtaLabel,
      target: secondaryCtaTarget,
      variant: "secondary",
    });
  }
  const displayBody = humanizeErrorMessage(body);
  return (
    <StateCard kicker="Erro" title={title} body={displayBody} actions={actions} />
  );
}

export function EmptyState({
  title = "Nada por aqui ainda",
  body = "Quando tiver dados, eles aparecem aqui.",
  ctaLabel,
  ctaTarget,
}: {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaTarget?: string;
}) {
  const actions =
    ctaLabel && ctaTarget ? ([{ label: ctaLabel, target: ctaTarget }] satisfies StateAction[]) : undefined;
  return (
    <StateCard kicker="Vazio" title={title} body={body} actions={actions} />
  );
}

export function SuccessState({
  title = "Tudo certo",
  body = "Ação concluída.",
  ctaLabel,
  ctaTarget,
}: {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaTarget?: string;
}) {
  const actions =
    ctaLabel && ctaTarget ? ([{ label: ctaLabel, target: ctaTarget }] satisfies StateAction[]) : undefined;
  return (
    <StateCard kicker="Sucesso" title={title} body={body} actions={actions} />
  );
}

export function BlockedState({
  title = "Falta um passo",
  body = "Precisamos de um pouco mais de contexto para continuar.",
  ctaLabel = "Continuar",
  ctaTarget = "/app/onboarding",
  secondaryCtaLabel,
  secondaryCtaTarget,
}: {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaTarget?: string;
  secondaryCtaLabel?: string;
  secondaryCtaTarget?: string;
}) {
  const actions: StateAction[] = [{ label: ctaLabel, target: ctaTarget, variant: "default" }];
  if (secondaryCtaLabel && secondaryCtaTarget) {
    actions.push({
      label: secondaryCtaLabel,
      target: secondaryCtaTarget,
      variant: "secondary",
    });
  }
  return <StateCard kicker="Bloqueado" title={title} body={body} actions={actions} />;
}

export function InsufficientDataState({
  title = "Sem dados suficientes",
  body = "Quando tiver mais dados, a gente consegue te orientar melhor.",
  ctaLabel,
  ctaTarget,
}: {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaTarget?: string;
}) {
  return <EmptyState title={title} body={body} ctaLabel={ctaLabel} ctaTarget={ctaTarget} />;
}

export function ConfirmState({
  title = "Confirmar ação",
  body = "Revise antes de continuar.",
  primaryAction,
  secondaryAction,
}: {
  title?: string;
  body?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <StateCard kicker="Confirmação" title={title} body={body}>
      <div className="flex flex-wrap gap-2">
        {primaryAction ?? null}
        {secondaryAction ?? null}
      </div>
    </StateCard>
  );
}

function humanizeErrorMessage(body: string) {
  const raw = (body ?? "").trim();
  if (!raw) return "Tente novamente em instantes.";

  const s = raw.toLowerCase();
  if (
    s.includes("typeerror") ||
    s.includes("failed to fetch") ||
    s.includes("networkerror") ||
    s.includes("econn") ||
    s.includes("timeout") ||
    s.includes("fetch")
  ) {
    return "Não consegui concluir agora. Verifique sua conexão e tente novamente.";
  }
  if (s.includes("unauthorized") || s.includes("sessao")) {
    return "Sua sessão parece ter expirado. Volte e tente novamente.";
  }
  if (s.includes("not found") || s.includes("nao encontrado")) {
    return "Não encontrei esse item. Volte e tente novamente.";
  }
  if (s.includes("sql") || s.includes("d1") || s.includes("database")) {
    return "Falha interna ao buscar dados. Tente novamente em instantes.";
  }

  // Quando a API já retorna linguagem humana, usamos direto.
  return raw;
}
