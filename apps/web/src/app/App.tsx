import React, { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { AppEnv } from '../core/data';
import { createAppShell } from './app_shell';
import { createViteJsonLoader } from './vite_json_loader';
import { ROUTE_PATHS } from '../core/router/routes';
import type { DataSourceMode } from '../core/data/data_source_factory';

function getEnv(): AppEnv {
  const raw = String(import.meta.env.VITE_APP_ENV ?? 'local');
  return raw === 'prd' || raw === 'hml' || raw === 'local' ? raw : 'local';
}

function getDataSourceMode(): DataSourceMode | undefined {
  const raw = import.meta.env.VITE_DATA_MODE;
  if (!raw) return undefined;
  return raw === 'auto' || raw === 'mock_local' || raw === 'mock_hml' || raw === 'http' ? raw : undefined;
}

export function App(): JSX.Element {
  const env = getEnv();

  const shell = useMemo(() => {
    const mockLoader = createViteJsonLoader();
    return createAppShell(
      {
        env,
        dataSources: {
          mode: getDataSourceMode(),
          httpBaseUrl: import.meta.env.VITE_API_BASE_URL,
          mockLoader
        }
      },
      { pathname: window.location.pathname }
    );
  }, [env]);

  const state = useSyncExternalStore(shell.subscribe, shell.getState, shell.getState);

  useEffect(() => {
    const onPop = () => shell.navigateTo(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [shell]);

  function navigate(pathname: string) {
    if (window.location.pathname !== pathname) {
      window.history.pushState({}, '', pathname);
    }
    shell.navigateTo(pathname);
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h1 style={{ margin: 0, fontSize: 18 }}>Esquilo Web (base estrutural)</h1>
      <p style={{ marginTop: 8, marginBottom: 16, opacity: 0.8 }}>
        Sem layout final. Objetivo: provar navegação e wiring do app shell.
      </p>

      <div style={{ marginBottom: 12 }}>
        <strong>Env:</strong> {env} {' | '}
        <strong>Rota:</strong> <code>{state.route.id}</code>
        {state.route.id === 'holding_detail' ? (
          <>
            {' '}
            <span>
              (portfolioId=<code>{state.route.params.portfolioId}</code>, holdingId=<code>{state.route.params.holdingId}</code>)
            </span>
          </>
        ) : null}
        {state.route.id === 'imports_preview' ? (
          <>
            {' '}
            <span>
              (importId=<code>{state.route.params.importId}</code>)
            </span>
          </>
        ) : null}
      </div>

      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {Object.entries(ROUTE_PATHS).map(([id, p]) => {
          const target =
            id === 'holding_detail'
              ? '/portfolio/p1/holdings/pos_1'
              : id === 'imports_preview'
                ? '/imports/i1/preview'
                : p;
          return (
            <button
              key={id}
              onClick={() => navigate(target)}
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                background: '#fff',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              {id}
            </button>
          );
        })}
      </nav>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
        <h2 style={{ margin: 0, fontSize: 14 }}>Conteúdo</h2>
        <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.9 }}>
          Aqui entra a UI real por tela depois, sempre consumindo os data sources e contratos.
        </p>
      </section>
    </div>
  );
}
