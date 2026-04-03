import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PortfolioPage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="ty-caption text-text-secondary">Carteira</p>
        <h1 className="ty-h1 font-display">Visão geral</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Posições</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="ty-body text-text-secondary">
            Tabela/lista virá por US. Aqui fica a estrutura e o design system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

