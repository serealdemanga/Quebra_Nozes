import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getDataSources } from "@/core/data";
import { useAppStore } from "@/core/state/app_store";

export function StartPage() {
  const nav = useNavigate();
  const store = useAppStore();
  const [status, setStatus] = React.useState<"loading" | "error">("loading");

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const ds = getDataSources();
        const res = await ds.profile.getProfileContext();

        if (!cancelled) {
          if (res.ok) {
            store.setState((s) => ({
              ...s,
              session: {
                status: "identified",
                identity: { userId: res.data.userId },
              },
            }));

            // Sem fricção: se o onboarding ainda não liberou a Home, vai direto para ele.
            if (!res.data.onboarding.homeUnlocked) {
              nav("/app/onboarding", { replace: true });
              return;
            }

            nav("/app/home", { replace: true });
            return;
          }
        }
      } catch {
        // Sem fricção: não bloqueia o usuário por falha de rede; abre Home e a UI mostra vazio/erro depois.
      }

      if (!cancelled) {
        setStatus("error");
        nav("/app/home", { replace: true });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [nav, store]);

  return (
    <div className="min-h-dvh bg-bg-secondary text-text-primary">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 py-14">
        <p className="ty-caption text-text-secondary">Início</p>
        <h1 className="ty-h1 font-display">
          {status === "loading" ? "Preparando seu panorama" : "Abrindo…"}
        </h1>
        <p className="ty-body text-text-secondary">
          Sem cadastro pesado. Você entra e vê valor primeiro.
        </p>
      </div>
    </div>
  );
}
