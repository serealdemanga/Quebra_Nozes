import type { Env } from '../types/env';
import { ok, readJson } from '../lib/http';

export async function getProfileContext(_request: Request, env: Env): Promise<Response> {
  return ok(env.API_VERSION, {
    userId: 'stub-user',
    displayName: 'Usuario Esquilo',
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
  const payload = await readJson<Record<string, unknown>>(request).catch(() => ({}));
  const context = (payload.context ?? payload) as Record<string, unknown>;

  return ok(env.API_VERSION, {
    userId: 'stub-user',
    displayName: 'Usuario Esquilo',
    context: {
      financialGoal: context.financialGoal ?? '',
      monthlyIncomeRange: context.monthlyIncomeRange ?? '',
      monthlyInvestmentTarget: context.monthlyInvestmentTarget ?? 0,
      availableToInvest: context.availableToInvest ?? 0,
      riskProfile: context.riskProfile ?? '',
      investmentHorizon: context.investmentHorizon ?? '',
      platformsUsed: context.platformsUsed ?? [],
      displayPreferences: context.displayPreferences ?? { ghostMode: false }
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
    displayPreferences: (context.displayPreferences ?? {}) as Record<string, unknown>
  });
}
