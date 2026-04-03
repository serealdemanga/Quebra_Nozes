import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@/core/state/app_store";
import { Logo } from "@/components/brand/Logo";
import { Icon, type IconName } from "@/components/brand/Icon";

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
          <div className="flex items-center gap-3">
            <Logo className="h-6 w-auto text-text-primary" />
          </div>
          <nav className="flex items-center gap-2">
            <TopLink to="/app/home" end icon="home" filledIcon="home-filled">
              Home
            </TopLink>
            <TopLink to="/app/import" icon="importar">
              Importar
            </TopLink>
            <TopLink to="/app/portfolio" icon="carteira" filledIcon="carteira-filled">
              Carteira
            </TopLink>
            <TopLink to="/app/profile" icon="perfil" filledIcon="perfil-filled">
              Perfil
            </TopLink>
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
  icon,
  filledIcon,
  children,
}: {
  to: string;
  end?: boolean;
  icon: IconName;
  filledIcon?: IconName;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-md px-3 py-2 ty-label transition-colors",
          isActive
            ? "bg-bg-surface text-text-primary"
            : "text-text-secondary hover:bg-bg-surface hover:text-text-primary",
        ].join(" ")
      }
    >
      {({ isActive }) => {
        const iconName = isActive ? (filledIcon ?? icon) : icon;
        return (
          <>
            <Icon name={iconName} className="text-[18px]" />
            <span>{children}</span>
          </>
        );
      }}
    </NavLink>
  );
}
