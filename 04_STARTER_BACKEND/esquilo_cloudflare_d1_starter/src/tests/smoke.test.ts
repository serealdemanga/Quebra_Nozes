import { describe, it, expect } from 'vitest';
import worker from '../index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Constrói um env mínimo para testes unitários.
 * O DB padrão simula prepared statements sem retornar dados — suficiente para
 * cobrir os caminhos que fazem auth check antes de qualquer query.
 */
function buildEnv(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const mockDB = {
    prepare: (_sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: async () => null,
        all: async () => ({ results: [] }),
        run: async () => {},
      }),
      first: async () => null,
    }),
    batch: async () => [],
  };
  return {
    DB: mockDB,
    APP_ENV: 'local',
    API_VERSION: 'v1',
    ASSETS: undefined,
    CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
    ...overrides,
  };
}

function req(url: string, init?: RequestInit): Request {
  return new Request(`http://localhost${url}`, init);
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

describe('Health route', () => {
  it('retorna 200 quando DB responde', async () => {
    const env = buildEnv({
      DB: {
        prepare: () => ({
          bind: () => ({ first: async () => ({ ok: 1 }), all: async () => ({ results: [] }) }),
          first: async () => ({ ok: 1 }),
        }),
      },
    });
    const res = await worker.fetch(req('/v1/health'), env as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe('ok');
  });

  it('retorna 500 quando DB falha', async () => {
    const env = buildEnv({
      DB: {
        prepare: () => ({
          first: async () => { throw new Error('D1 unavailable'); },
        }),
      },
    });
    const res = await worker.fetch(req('/v1/health'), env as any);
    expect(res.status).toBe(500);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Proteção de autenticação: rotas protegidas devem retornar 401 sem cookie
// ---------------------------------------------------------------------------

describe('Auth enforcement — rotas protegidas sem cookie retornam 401', () => {
  const protectedRoutes = [
    'GET /v1/dashboard/home',
    'GET /v1/portfolio',
    'GET /v1/analysis',
    'GET /v1/history/snapshots',
    'GET /v1/history/timeline',
    'GET /v1/history/imports',
    'GET /v1/profile/context',
    'GET /v1/onboarding/portfolio-entry',
    'GET /v1/ops/events',
  ] as const;

  for (const route of protectedRoutes) {
    const [method, path] = route.split(' ') as [string, string];
    it(`${method} ${path}`, async () => {
      const env = buildEnv();
      const res = await worker.fetch(req(path, { method }), env as any);
      expect(res.status).toBe(401);
      const body = (await res.json()) as any;
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('unauthorized');
    });
  }
});

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

describe('CORS — preflight OPTIONS', () => {
  it('origem permitida recebe 204 com headers CORS', async () => {
    const env = buildEnv();
    const res = await worker.fetch(
      req('/v1/health', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173' } }),
      env as any
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBeTruthy();
  });

  it('origem desconhecida recebe 204 SEM headers CORS', async () => {
    const env = buildEnv();
    const res = await worker.fetch(
      req('/v1/health', { method: 'OPTIONS', headers: { Origin: 'https://attacker.example.com' } }),
      env as any
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('CORS_ALLOWED_ORIGINS não configurado recebe 204 sem headers CORS', async () => {
    const env = buildEnv({ CORS_ALLOWED_ORIGINS: undefined });
    const res = await worker.fetch(
      req('/v1/health', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173' } }),
      env as any
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('CORS — respostas de API incluem header para origem permitida', () => {
  it('GET /v1/dashboard/home sem cookie retorna 401 com CORS header', async () => {
    const env = buildEnv();
    const res = await worker.fetch(
      req('/v1/dashboard/home', { headers: { Origin: 'http://localhost:5173' } }),
      env as any
    );
    expect(res.status).toBe(401);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
  });

  it('origem desconhecida não recebe CORS header na resposta', async () => {
    const env = buildEnv();
    const res = await worker.fetch(
      req('/v1/dashboard/home', { headers: { Origin: 'https://evil.example.com' } }),
      env as any
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Rotas desconhecidas
// ---------------------------------------------------------------------------

describe('Rotas desconhecidas', () => {
  it('GET /v1/rota-inexistente retorna 404 com código route_not_found', async () => {
    const env = buildEnv();
    const res = await worker.fetch(req('/v1/rota-inexistente'), env as any);
    expect(res.status).toBe(404);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('route_not_found');
  });
});
