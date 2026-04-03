import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import type { ImportPreviewData } from "@/core/data/contracts";
import { ErrorState, LoadingState } from "@/components/system/SystemState";
import { useNavigate } from "react-router-dom";

export function ImportPreviewPage() {
  const { importId } = useParams();
  const ds = useDataSources();
  const nav = useNavigate();
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
        setError(
          res.error.message ||
            "Não consegui confirmar a importação. Você pode ajustar e tentar de novo.",
        );
        return;
      }
      const next = normalizeAppTarget(res.data.nextStep);
      const url = new URL(next, window.location.origin);
      url.searchParams.set("importId", res.data.importId);
      url.searchParams.set("snapshotId", res.data.createdSnapshotId);
      url.searchParams.set("affected", String(res.data.affectedPositions));
      nav(`${url.pathname}${url.search}`, { replace: true });
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

      {error ? (
        <ErrorState
          title="Não deu para concluir agora"
          body={error}
          ctaLabel="Voltar para o import"
          ctaTarget="/app/import"
          secondaryCtaLabel="Ver perfil"
          secondaryCtaTarget="/app/profile"
        />
      ) : null}

      {!data && !error ? (
        <LoadingState title="Gerando preview" body="Estamos preparando as linhas para você revisar." />
      ) : data ? (
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
      ) : null}
    </div>
  );
}

function normalizeAppTarget(target: string) {
  if (!target.startsWith("/")) return `/app/${target}`;
  if (target.startsWith("/app/")) return target;
  return `/app${target}`;
}
