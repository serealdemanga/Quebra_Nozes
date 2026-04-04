import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSources } from "@/core/data/react";
import { ErrorState } from "@/components/system/SystemState";

export function ImportStartPage() {
  const ds = useDataSources();
  const nav = useNavigate();
  const [csvContent, setCsvContent] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
  const templateCustomUrl = apiBaseUrl ? `${apiBaseUrl}/v1/imports/templates/csv-v1` : "/v1/imports/templates/csv-v1";

  async function onStart() {
    setLoading(true);
    setError(null);
    try {
      const res = await ds.imports.startImport({
        payload: {
          // Release 0.1: um unico layout oficial.
          origin: "CUSTOM_TEMPLATE",
          csvContent: csvContent.trim() ? csvContent : defaultCustomTemplateCsv(),
          fileName,
          mimeType: "text/csv",
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

      {error ? (
        <ErrorState
          title="Não consegui gerar o preview"
          body={error}
          ctaLabel="Tentar de novo"
          ctaTarget="/app/import"
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Upload do CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild type="button" size="sm" variant="secondary" disabled={loading}>
              <a href={templateCustomUrl} target="_blank" rel="noreferrer">
                Baixar template oficial
              </a>
            </Button>
            <p className="ty-caption text-text-secondary">
              Layout: <code>tipo,codigo,nome,quantidade,valor_investido,valor_atual,categoria,observacoes</code>
            </p>
          </div>

          <div className="mt-4 space-y-1">
            <label className="ty-label text-text-secondary">Selecione o arquivo CSV</label>
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={loading}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setFileName(f.name);
                try {
                  const text = await f.text();
                  setCsvContent(text);
                } catch {
                  setError("Não consegui ler esse arquivo. Tente novamente.");
                }
              }}
            />
            {fileName ? (
              <p className="ty-caption text-text-secondary">Arquivo: {fileName}</p>
            ) : null}
          </div>

          <label className="mt-4 block ty-label text-text-secondary">
            Conteúdo CSV (auto-preenchido após upload)
          </label>
          <textarea
            className="mt-2 h-40 w-full rounded-md border border-border-default bg-bg-primary p-3 ty-body"
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder={placeholderCustomTemplateCsv()}
          />
          <div className="mt-4 flex gap-2">
            <Button onClick={onStart} disabled={loading}>
              {loading ? "Gerando…" : "Gerar preview"}
            </Button>
            <Button variant="secondary" onClick={() => setCsvContent("")} disabled={loading}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ajuda rápida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="ty-body text-text-secondary">
            Você sempre verá um preview antes de confirmar. Se aparecer duplicidade, o produto vai pedir decisão explícita.
          </p>
          <div className="rounded-md border border-border-default bg-bg-surface p-3">
            <p className="ty-caption text-text-secondary">Limitações atuais</p>
            <p className="ty-body">
              Nesta release, aceitamos apenas o template CSV v1 oficial. Outros layouts entram depois.
            </p>
          </div>
          {!apiBaseUrl ? (
            <p className="ty-caption text-text-secondary">
              Dica: para usar o download de templates apontando para o Worker, configure <code>VITE_API_BASE_URL</code>.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function defaultCustomTemplateCsv() {
  return [
    "tipo,codigo,nome,quantidade,valor_investido,valor_atual,categoria,observacoes",
    "ACOES,PETR4,Petrobras PN,100,3200.00,3510.00,Ações,Exemplo",
    "FUNDOS,,XP Selection Multimercado,1,42022.73,43810.20,Fundos,Exemplo",
  ].join("\n");
}

function placeholderCustomTemplateCsv() {
  return "Cole o CSV do template proprio aqui. Ex:\\n" + defaultCustomTemplateCsv();
}
