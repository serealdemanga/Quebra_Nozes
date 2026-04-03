import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import type { ImportPreviewData } from "@/core/data/contracts";

export function ImportPreviewPage() {
  const { importId } = useParams();
  const ds = useDataSources();
  const [data, setData] = React.useState<ImportPreviewData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [committing, setCommitting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!importId) return;
      try {
        const res = await ds.imports.getPreview({ importId });
        if (cancelled) return;
        if (!res.ok) {
          setError(res.error.message);
          return;
        }
        setData(res.data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Falha ao carregar.");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [ds, importId]);

  async function onCommit() {
    if (!importId) return;
    setCommitting(true);
    setError(null);
    try {
      const res = await ds.imports.commitImport({ importId });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      // Ainda não temos as telas de histórico; deixamos o caminho claro.
      setError(`Commit realizado. Próximo passo: ${res.data.nextStep}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao commit.");
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="ty-caption text-text-secondary">Preview</p>
          <h1 className="ty-h1 font-display">Revisar importação</h1>
        </div>
        <Button asChild variant="secondary">
          <Link to="/app/import">Voltar</Link>
        </Button>
      </header>

      {error ? <p className="ty-body text-text-secondary">{error}</p> : null}
      {!data ? (
        <p className="ty-body text-text-secondary">Carregando…</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="ty-body">
                {data.totals.totalRows} linhas • {data.totals.validRows} válidas •{" "}
                {data.totals.invalidRows} inválidas • {data.totals.duplicateRows} duplicadas
              </p>
              <div className="mt-3">
                <Button onClick={onCommit} disabled={!data.readyToCommit || committing}>
                  {committing ? "Confirmando…" : "Confirmar importação"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linhas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.rows.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-md border border-border-default bg-bg-primary p-3"
                  >
                    <p className="ty-body">
                      Linha {r.rowNumber}: {r.resolutionStatus}
                    </p>
                    {r.errorMessage ? (
                      <p className="ty-caption text-state-error">{r.errorMessage}</p>
                    ) : (
                      <p className="ty-caption text-text-secondary">
                        {Object.keys(r.source).join(", ") || "—"}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

