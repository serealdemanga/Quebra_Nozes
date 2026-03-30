import type { Env } from '../types/env';
import { ok, readJson } from '../lib/http';

export async function getProfileContext(_request: Request, env: Env): Promise<Response> {
  return ok(env.API_VERSION, {
    userId: 'stub-user',
    displayName: 'Usuário Esquilo',
    context: {
      financialGoal: '',
      monthlyIncomeRange: '',
      monthlyInvestmentTarget: 0,
      availableToInvest: 0,
      riskProfile: '',
      investmentHorizon: '',
      platformsUsed: [],
      displayPreferences: {
        ghostMode: false
      }
    },
    backendHealth: {
      status: 'ok',
      appEnv: env.APP_ENV,
      apiVersion: env.API_VERSION,
      services: {
        d1: 'ok',
        externalReferences: 'unknown'
      }
    },
    displayPreferences: {
      ghostMode: false
    }
  });
}

export async function putProfileContext(request: Request, env: Env): Promise<Response> {
  const payload = await readJson<Record<string, unknown>>(request);

  return ok(env.API_VERSION, {
    userId: 'stub-user',
    displayName: 'Usuário Esquilo',
    context: payload,
    backendHealth: {
      status: 'ok',
      appEnv: env.APP_ENV,
      apiVersion: env.API_VERSION,
      services: {
        d1: 'ok',
        externalReferences: 'unknown'
      }
    },
    displayPreferences: (payload.displayPreferences ?? {}) as Record<string, unknown>
  });
}
