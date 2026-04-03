import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";
import { useDataSources } from "@/core/data/react";
import { ErrorState } from "@/components/system/SystemState";

export function RegisterPage() {
  const ds = useDataSources();
  const nav = useNavigate();

  const [cpf, setCpf] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [rememberDevice, setRememberDevice] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await ds.auth.register({
        cpf,
        email,
        displayName,
        password,
        confirmPassword,
        rememberDevice,
      });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      nav(normalizeAppTarget(res.data.nextStep), { replace: true });
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Falha ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    cpf.trim().length > 0 &&
    email.trim().length > 0 &&
    displayName.trim().length > 0 &&
    password.length >= 8 &&
    confirmPassword.length >= 8;

  return (
    <div className="min-h-dvh bg-bg-secondary text-text-primary">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-12">
        <header className="space-y-2">
          <Logo className="h-7 w-auto" />
          <h1 className="ty-h1 font-display">Criar conta</h1>
          <p className="ty-body text-text-secondary">
            Em poucos passos você já consegue importar e revisar sua carteira.
          </p>
        </header>

        {error ? (
          <ErrorState
            title="Não consegui criar sua conta"
            body={error}
            ctaLabel="Tentar de novo"
            ctaTarget="/register"
            secondaryCtaLabel="Ir para login"
            secondaryCtaTarget="/login"
          />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Dados básicos</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit}>
              <div className="space-y-1">
                <label className="ty-label text-text-secondary">Nome</label>
                <input
                  className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 ty-body"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                  placeholder="Como você quer ser chamado"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="ty-label text-text-secondary">CPF</label>
                <input
                  className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 ty-body"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  autoComplete="username"
                  placeholder="000.000.000-00"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="ty-label text-text-secondary">E-mail</label>
                <input
                  className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 ty-body"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="seu@email.com"
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
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="ty-label text-text-secondary">Confirmar senha</label>
                <input
                  type="password"
                  className="w-full rounded-md border border-border-default bg-bg-primary px-3 py-2 ty-body"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repita a senha"
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
                loadingLabel="Criando"
                disabled={!canSubmit}
              >
                Criar conta
              </Button>

              <p className="ty-caption text-text-secondary">
                Já tem conta? <Link className="underline" to="/login">Entrar</Link>
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

