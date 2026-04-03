import React from "react";
import { EmptyState } from "@/components/system/SystemState";

export function ScorePage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="ty-caption text-text-secondary">Score</p>
        <h1 className="ty-h1 font-display">Seu score</h1>
        <p className="ty-body text-text-secondary">
          Este espaço vai detalhar fatores do score sem virar “painel técnico”.
        </p>
      </header>

      <EmptyState
        title="Em breve"
        body="O resumo do score já aparece na Home. Este detalhe entra com breakdown por fatores quando o motor estiver fechado."
        ctaLabel="Voltar para a Home"
        ctaTarget="/app/home"
      />
    </div>
  );
}

