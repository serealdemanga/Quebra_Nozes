import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HomePage() {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border-default bg-bg-primary p-5 shadow-card">
        <p className="ty-caption text-text-secondary">Resumo</p>
        <h1 className="ty-h1 font-display">Seu panorama financeiro</h1>
        <p className="ty-body text-text-secondary">
          Wireframe executável. Layout final vem depois; tipografia e tokens já
          estão travados no BrandBook.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button>Consolidar</Button>
          <Button variant="secondary">Traduzir</Button>
          <Button variant="ghost">Orientar</Button>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximo passo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="ty-body text-text-secondary">
              Conectar com API real via <code>VITE_API_BASE_URL</code>.
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

