import type { Env } from '../types/env';
import { ok, readJson } from '../lib/http';

export async function postAuthRegister(request: Request, env: Env): Promise<Response> {
  const payload = await readJson<Record<string, unknown>>(request);

  return ok(env.API_VERSION, {
    userId: crypto.randomUUID(),
    authMode: 'mvp_stub',
    nextStep: '/onboarding',
    receivedKeys: Object.keys(payload)
  }, 'auth_stub');
}

export async function postAuthLogin(request: Request, env: Env): Promise<Response> {
  const payload = await readJson<Record<string, unknown>>(request);

  return ok(env.API_VERSION, {
    sessionId: crypto.randomUUID(),
    userId: 'stub-user',
    rememberDevice: Boolean(payload.rememberDevice),
    status: 'ok'
  }, 'auth_stub');
}

export async function postAuthLogout(_request: Request, env: Env): Promise<Response> {
  return ok(env.API_VERSION, {
    status: 'logged_out'
  }, 'auth_stub');
}

export async function postAuthRecover(request: Request, env: Env): Promise<Response> {
  const payload = await readJson<Record<string, unknown>>(request);

  return ok(env.API_VERSION, {
    channel: 'telegram',
    status: 'requested',
    receivedKeys: Object.keys(payload)
  }, 'auth_stub');
}
