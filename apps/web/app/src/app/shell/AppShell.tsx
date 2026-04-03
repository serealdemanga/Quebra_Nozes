import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@/core/state/app_store";

export function AppShell() {
  const store = useAppStore();
  const location = useLocation();

  React.useEffect(() => {
    store.setState((s) => ({ ...s, route: { path: location.pathname } }));
  }, [location.pathname, store]);

  return (
    <div className="min-h-dvh bg-bg-secondary text-text-primary">
      <header className="sticky top-0 z-10 border-b border-border-default bg-bg-primary">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="ty-h3 font-display">Esquilo</span>
            <span className="ty-caption text-text-secondary">Invest</span>
          </div>
          <nav className="flex items-center gap-2">
            <TopLink to="/" end>
              Home
            </TopLink>
            <TopLink to="/portfolio">Carteira</TopLink>
            <TopLink to="/profile">Perfil</TopLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function TopLink({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "rounded-md px-3 py-2 ty-label transition-colors",
          isActive
            ? "bg-bg-surface text-text-primary"
            : "text-text-secondary hover:bg-bg-surface hover:text-text-primary",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
