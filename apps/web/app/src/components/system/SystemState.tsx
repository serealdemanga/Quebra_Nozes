import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LoadingState({
  title = "Carregando",
  body = "Só um instante.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-primary p-5 shadow-card">
      <p className="ty-caption text-text-secondary">Aguarde</p>
      <h2 className="ty-h2 font-display">{title}</h2>
      <p className="ty-body text-text-secondary">{body}</p>
    </div>
  );
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
  return (
    <div className="rounded-lg border border-border-default bg-bg-primary p-5 shadow-card">
      <p className="ty-caption text-text-secondary">Erro</p>
      <h2 className="ty-h2 font-display">{title}</h2>
      <p className="ty-body text-text-secondary">{body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild>
          <Link to={ctaTarget}>{ctaLabel}</Link>
        </Button>
        {secondaryCtaLabel && secondaryCtaTarget ? (
          <Button asChild variant="secondary">
            <Link to={secondaryCtaTarget}>{secondaryCtaLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
