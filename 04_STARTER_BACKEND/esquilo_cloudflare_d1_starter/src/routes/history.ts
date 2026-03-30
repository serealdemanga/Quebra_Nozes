import type { Env } from '../types/env';
import { ok } from '../lib/http';

export async function getSnapshots(_request: Request, env: Env): Promise<Response> {
  return ok(env.API_VERSION, {
    portfolioId: 'primary',
    snapshots: [],
    events: []
  });
}
