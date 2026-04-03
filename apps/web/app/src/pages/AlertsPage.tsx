import React from "react";
import { EmptyState } from "@/components/system/SystemState";

export function AlertsPage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="ty-caption text-text-secondary">Alertas</p>
        <h1 className="ty-h1 font-display">Seus alertas</h1>
        <p className="ty-body text-text-secondary">
          Aqui vai ficar sua lista de alertas ativos, com prioridade e próximo passo.
        </p>
      </header>

      <EmptyState
        title="Em breve"
        body="Estamos preparando este módulo. Enquanto isso, use o Radar para ver o que merece atenção."
        ctaLabel="Abrir Radar"
        ctaTarget="/app/radar"
      />
    </div>
  );
}

