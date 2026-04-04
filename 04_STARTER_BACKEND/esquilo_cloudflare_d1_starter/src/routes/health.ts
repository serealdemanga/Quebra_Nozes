import type { Env } from '../types/env';
import { ok, fail } from '../lib/http';

export async function getHealth(_request: Request, env: Env): Promise<Response> {
  try {
    await env.DB.prepare('SELECT 1 as ok').first();

    return ok(env.API_VERSION, {
      status: 'ok',
      appEnv: env.APP_ENV,
      apiVersion: env.API_VERSION,
      services: {
        d1: 'ok',
        externalReferences: 'unknown'
      }
    });
  } catch (error) {
    return fail(env.API_VERSION, 'health_check_failed', 'Falha ao verificar saúde da API.', 500, {
      reason: String(error)
    });
  }
}
