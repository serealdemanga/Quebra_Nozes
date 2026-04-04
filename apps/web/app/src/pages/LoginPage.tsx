import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";
import { useDataSources } from "@/core/data/react";
import { ErrorState } from "@/components/system/SystemState";

export function LoginPage() {
  const ds = useDataSources();
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberDevice, setRememberDevice] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await ds.auth.login({ identifier, password, rememberDevice });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      const next = normalizeAppTarget(res.data.nextStep);
      // se veio de /app/*, respeita; senao segue nextStep do backend.
      nav(from ?? next, { replace: true });
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Falha ao logar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg-secondary text-text-primary">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-12">
        <header className="space-y-2">
          <Logo className="h-7 w-auto" />
          <h1 className="ty-h1 font-display">Entrar</h1>
          <p className="ty-body text-text-secondary">
            Acesse sua conta para importar, revisar e consolidar sua carteira.
          </p>
        </header>

        {error ? (
          <ErrorState
            title="Não consegui entrar"
            body={error}
            ctaLabel="Tentar de novo"
            ctaTarget="/login"
            secondaryCtaLabel="Criar conta"
            secondaryCtaTarget="/register"
          />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Credenciais</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit}>
              <div className="space-y-1">
                <label className="ty-label text-text-secondary">CPF ou e-mail</label>
                <input
                  className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 ty-body"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  placeholder="seu@email.com ou 000.000.000-00"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="ty-label text-text-secondary">Senha</label>
                <input
                  type="password"
                  className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 ty-body"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  disabled={loading}
                />
              </div>

              <label className="flex items-center gap-2 ty-caption text-text-secondary">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  disabled={loading}
                />
                Manter sessão
              </label>

              <Button
                type="submit"
                isLoading={loading}
                loadingLabel="Entrando"
                disabled={!identifier.trim() || !password}
              >
                Entrar
              </Button>

              <p className="ty-caption text-text-secondary">
                Não tem conta? <Link className="underline" to="/register">Criar agora</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function normalizeAppTarget(target: string) {
  if (!target.startsWith("/")) return `/app/${target}`;
  if (target.startsWith("/app/")) return target;
  return `/app${target}`;
}

