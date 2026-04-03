import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";

export function ImportStartPage() {
  const ds = useDataSources();
  const nav = useNavigate();
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onStart() {
    setLoading(true);
    setError(null);
    try {
      const res = await ds.imports.startImport({
        payload: {
          origin: "MANUAL_ENTRY",
          text,
        },
      });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      nav(`/app/import/${encodeURIComponent(res.data.importId)}/preview`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao iniciar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="ty-caption text-text-secondary">Importar</p>
        <h1 className="ty-h1 font-display">Traga seus dados</h1>
        <p className="ty-body text-text-secondary">
          Comece simples. Gere um preview e revise antes de confirmar.
        </p>
      </header>

      {error ? <p className="ty-body text-state-error">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Entrada rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="ty-label text-text-secondary">
            Cole aqui um resumo (CSV/linhas) ou deixe em branco para demo
          </label>
          <textarea
            className="mt-2 h-40 w-full rounded-md border border-border-default bg-bg-primary p-3 ty-body"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: ITSA4,27,13.84"
          />
          <div className="mt-4 flex gap-2">
            <Button onClick={onStart} disabled={loading}>
              {loading ? "Gerando…" : "Gerar preview"}
            </Button>
            <Button variant="secondary" onClick={() => setText("")} disabled={loading}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

