import * as React from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useDataSources } from "@/core/data/react";
import { useAppStore } from "@/core/state/app_store";
import { LoadingState, ErrorState } from "@/components/system/SystemState";
import { AppShell } from "@/app/shell/AppShell";

/**
 * Release 0.1: bloqueia uso anonimo. Se nao houver sessao, manda para /login.
 * Mantem o backend como fonte unica de verdade (GET /v1/auth/session).
 */
export function AuthedAppShell() {
  const ds = useDataSources();
  const store = useAppStore();
  const nav = useNavigate();
  const location = useLocation();

  const [state, setState] = React.useState<
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready" }
  >({ kind: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await ds.auth.getSession();
        if (cancelled) return;
        if (!res.ok) {
          setState({ kind: "error", message: res.error.message });
          return;
        }

        if (!res.data.authenticated) {
          nav("/login", { replace: true, state: { from: location.pathname } });
          return;
        }

        store.setState((s) => ({
          ...s,
          session: { status: "authenticated", identity: { userId: (res.data as any).userId } },
        }));

        setState({ kind: "ready" });
      } catch (e) {
        if (cancelled) return;
        setState({ kind: "error", message: e instanceof Error ? e.message : "Falha ao validar sessão." });
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [ds, location.pathname, nav, store]);

  if (state.kind === "loading") {
    return (
      <div className="min-h-dvh bg-bg-secondary text-text-primary">
        <div className="mx-auto w-full max-w-5xl px-4 py-10">
          <LoadingState title="Validando sua sessão" body="Só um instante." />
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="min-h-dvh bg-bg-secondary text-text-primary">
        <div className="mx-auto w-full max-w-5xl px-4 py-10">
          <ErrorState
            title="Não consegui validar sua sessão"
            body={state.message}
            ctaLabel="Ir para login"
            ctaTarget="/login"
          />
        </div>
      </div>
    );
  }

  // Usa o layout existente, mas garante sessao antes.
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

