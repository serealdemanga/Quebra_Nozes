import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export function SplashPage() {
  return (
    <div className="min-h-dvh bg-bg-secondary text-text-primary">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-14">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Logo className="h-7 w-auto" />
          </div>
          <h1 className="ty-display">
            Você não precisa de mais informação. Precisa de clareza.
          </h1>
          <p className="ty-body-lg text-text-secondary">
            O Esquilo ajuda a organizar sua carteira e transformar dados em decisão,
            sem economês e sem prometer mágica.
          </p>
        </header>

        <section className="grid gap-3">
          <Pillar
            title="Consolidar"
            body="Juntar o que está espalhado e deixar visível o que importa."
          />
          <Pillar
            title="Traduzir"
            body="Explicar o que os números dizem, no seu contexto e no seu tempo."
          />
          <Pillar
            title="Orientar"
            body="Indicar o próximo passo com clareza, sem impor e sem executar ordens."
          />
        </section>

        <section className="rounded-lg border border-border-default bg-bg-primary p-5 shadow-card">
          <p className="ty-caption text-text-secondary">
            Importante: o Esquilo orienta. Você decide.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/start">Começar</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/app/profile">Definir meu contexto</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-primary p-5 shadow-card">
      <h2 className="ty-h2 font-display">{title}</h2>
      <p className="ty-body text-text-secondary">{body}</p>
    </div>
  );
}
