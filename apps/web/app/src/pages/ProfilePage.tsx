import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProfilePage() {
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
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="ty-label text-text-secondary">Renda mensal</label>
              <Input placeholder="Ex: 8000" inputMode="numeric" />
            </div>
            <div className="space-y-1">
              <label className="ty-label text-text-secondary">Aporte mensal</label>
              <Input placeholder="Ex: 1200" inputMode="numeric" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button>Salvar</Button>
            <Button variant="secondary">Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

