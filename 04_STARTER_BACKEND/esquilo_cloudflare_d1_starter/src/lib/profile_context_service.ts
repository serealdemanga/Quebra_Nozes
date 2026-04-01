import type { Env } from '../types/env';
import { ok, fail, readJson } from './http';
import { buildEntityId, hashToken } from './auth_crypto';
import { findSessionStateByTokenHash } from '../repositories/auth_session_repository';
import { findProfileContextByUserId, upsertProfileContext } from '../repositories/profile_context_repository';

const AUTH_COOKIE_NAME = 'esquilo_session';
const VALID_ONBOARDING_STEPS = ['goal', 'risk_quiz', 'income_horizon', 'platforms'];
const VALID_RISK_PROFILES = ['conservador', 'moderado', 'arrojado'];

export async function getProfileContextForOnboarding(request: Request, env: Env): Promise<Response> {
  const session = await requireActiveSession(request, env);
  if (session instanceof Response) return session;

  const context = await findProfileContextByUserId(env, session.userId);
  const normalized = normalizeStoredContext(context);

  return ok(env.API_VERSION, {
    userId: session.userId,
    portfolioId: session.portfolioId,
    context: normalized.context,
    onboarding: normalized.onboarding,
    backendHealth: {
      status: 'ok',
      appEnv: env.APP_ENV,
      apiVersion: env.API_VERSION,
      services: {
        d1: 'ok',
        externalReferences: 'unknown'
      }
    }
  });
}

export async function putProfileContextForOnboarding(request: Request, env: Env): Promise<Response> {
  const session = await requireActiveSession(request, env);
  if (session instanceof Response) return session;

  const payload = await readJson<Record<string, unknown>>(request).catch(() => ({}));
  const context = (payload.context ?? payload) as Record<string, unknown>;
  const onboardingStep = normalizeStep(payload.step ?? context.onboardingStep);

  if (!VALID_ONBOARDING_STEPS.includes(onboardingStep)) {
    return fail(env.API_VERSION, 'invalid_onboarding_step', 'Etapa de onboarding invalida.', 400);
  }

  const financialGoalValue = normalizeText(context.financialGoal);
  const financialGoalOther = normalizeText(context.financialGoalOther);
  const financialGoal = financialGoalValue === 'outro' ? financialGoalOther : financialGoalValue;
  const monthlyIncomeRange = normalizeText(context.monthlyIncomeRange);
  const monthlyInvestmentTarget = normalizeNumber(context.monthlyInvestmentTarget);
  const availableToInvest = normalizeNumber(context.availableToInvest);
  const riskProfileSelfDeclared = normalizeRiskProfile(context.riskProfileSelfDeclared);
  const riskProfileQuizResult = normalizeRiskProfile(context.riskProfileQuizResult);
  const riskProfileEffective = riskProfileQuizResult;
  const investmentHorizon = normalizeText(context.investmentHorizon);
  const platformsUsed = normalizePlatforms(context.platformsUsed);
  const displayPreferences = normalizeDisplayPreferences(context.displayPreferences);

  if (onboardingStep === 'goal' && !financialGoal) {
    return fail(env.API_VERSION, 'missing_financial_goal', 'Objetivo financeiro obrigatorio.', 400);
  }
  if (onboardingStep === 'risk_quiz' && !riskProfileQuizResult) {
    return fail(env.API_VERSION, 'missing_risk_profile', 'Resultado do questionario obrigatorio.', 400);
  }
  if (onboardingStep === 'income_horizon' && !monthlyIncomeRange) {
    return fail(env.API_VERSION, 'missing_income_range', 'Faixa de renda obrigatoria.', 400);
  }
  if (onboardingStep === 'platforms' && !hasAnyPlatform(platformsUsed)) {
    return fail(env.API_VERSION, 'missing_platforms', 'Informe pelo menos uma plataforma.', 400);
  }

  const existing = await findProfileContextByUserId(env, session.userId);
  const merged = mergeContext(existing, {
    financialGoal,
    monthlyIncomeRange,
    monthlyInvestmentTarget,
    availableToInvest,
    riskProfileSelfDeclared,
    riskProfileQuizResult,
    riskProfileEffective,
    investmentHorizon,
    platformsUsed,
    displayPreferences,
    onboardingStep
  });

  const onboardingCompletedAt = merged.financialGoal && merged.riskProfileEffective ? new Date().toISOString() : null;

  await upsertProfileContext(env, {
    contextId: existing?.id || buildEntityId('ctx'),
    userId: session.userId,
    financialGoal: merged.financialGoal,
    monthlyIncomeRange: merged.monthlyIncomeRange,
    monthlyInvestmentTarget: merged.monthlyInvestmentTarget,
    availableToInvest: merged.availableToInvest,
    riskProfileSelfDeclared: merged.riskProfileSelfDeclared,
    riskProfileQuizResult: merged.riskProfileQuizResult,
    riskProfileEffective: merged.riskProfileEffective,
    investmentHorizon: merged.investmentHorizon,
    platformsUsedJson: JSON.stringify(merged.platformsUsed),
    displayPreferencesJson: JSON.stringify(merged.displayPreferences),
    onboardingStep,
    onboardingCompletedAt
  });

  return ok(env.API_VERSION, {
    userId: session.userId,
    portfolioId: session.portfolioId,
    context: {
      financialGoal: merged.financialGoal,
      monthlyIncomeRange: merged.monthlyIncomeRange,
      monthlyInvestmentTarget: merged.monthlyInvestmentTarget,
      availableToInvest: merged.availableToInvest,
      riskProfileSelfDeclared: merged.riskProfileSelfDeclared,
      riskProfileQuizResult: merged.riskProfileQuizResult,
      riskProfileEffective: merged.riskProfileEffective,
      investmentHorizon: merged.investmentHorizon,
      platformsUsed: merged.platformsUsed,
      displayPreferences: merged.displayPreferences
    },
    onboarding: buildOnboardingState({
      financialGoal: merged.financialGoal,
      riskProfileEffective: merged.riskProfileEffective,
      onboardingStep: onboardingStep,
      onboardingCompletedAt,
      monthlyIncomeRange: merged.monthlyIncomeRange,
      investmentHorizon: merged.investmentHorizon,
      platformsUsed: merged.platformsUsed
    })
  });
}

async function requireActiveSession(request: Request, env: Env): Promise<{ userId: string; portfolioId: string } | Response> {
  const token = readCookie(request.headers.get('cookie') || '', AUTH_COOKIE_NAME);
  if (!token) return fail(env.API_VERSION, 'unauthorized', 'Sessao nao encontrada.', 401);

  const tokenHash = await hashToken(token);
  const session = await findSessionStateByTokenHash(env, tokenHash);
  if (!session || session.revoked_at || Date.parse(session.expires_at) <= Date.now()) {
    return fail(env.API_VERSION, 'unauthorized', 'Sessao invalida.', 401);
  }

  return { userId: session.user_id, portfolioId: session.portfolio_id || '' };
}

function normalizeStoredContext(row: any): { context: Record<string, unknown>; onboarding: Record<string, unknown> } {
  const platformsUsed = parseJson(row?.platforms_used_json, { platformIds: [], otherPlatforms: [] });
  const displayPreferences = parseJson(row?.display_preferences_json, { ghostMode: false });
  const context = {
    financialGoal: row?.financial_goal || '',
    monthlyIncomeRange: row?.monthly_income_range || '',
    monthlyInvestmentTarget: row?.monthly_investment_target ?? 0,
    availableToInvest: row?.available_to_invest ?? 0,
    riskProfileSelfDeclared: row?.risk_profile_self_declared || '',
    riskProfileQuizResult: row?.risk_profile_quiz_result || '',
    riskProfileEffective: row?.risk_profile_effective || row?.risk_profile || '',
    investmentHorizon: row?.investment_horizon || '',
    platformsUsed,
    displayPreferences
  };
  const onboarding = buildOnboardingState({
    financialGoal: context.financialGoal,
    riskProfileEffective: context.riskProfileEffective,
    onboardingStep: row?.onboarding_step || 'goal',
    onboardingCompletedAt: row?.onboarding_completed_at || null,
    monthlyIncomeRange: context.monthlyIncomeRange,
    investmentHorizon: context.investmentHorizon,
    platformsUsed
  });
  return { context, onboarding };
}

function mergeContext(existing: any, next: any) {
  const storedPlatforms = parseJson(existing?.platforms_used_json, { platformIds: [], otherPlatforms: [] });
  const storedDisplay = parseJson(existing?.display_preferences_json, { ghostMode: false });
  return {
    financialGoal: next.financialGoal || existing?.financial_goal || '',
    monthlyIncomeRange: next.monthlyIncomeRange || existing?.monthly_income_range || '',
    monthlyInvestmentTarget: next.monthlyInvestmentTarget ?? existing?.monthly_investment_target ?? null,
    availableToInvest: next.availableToInvest ?? existing?.available_to_invest ?? null,
    riskProfileSelfDeclared: next.riskProfileSelfDeclared || existing?.risk_profile_self_declared || '',
    riskProfileQuizResult: next.riskProfileQuizResult || existing?.risk_profile_quiz_result || '',
    riskProfileEffective: next.riskProfileEffective || existing?.risk_profile_effective || existing?.risk_profile || '',
    investmentHorizon: next.investmentHorizon || existing?.investment_horizon || '',
    platformsUsed: hasAnyPlatform(next.platformsUsed) ? next.platformsUsed : storedPlatforms,
    displayPreferences: Object.keys(next.displayPreferences || {}).length ? next.displayPreferences : storedDisplay
  };
}

function buildOnboardingState(input: any) {
  const completedSteps = [] as string[];
  if (input.financialGoal) completedSteps.push('goal');
  if (input.riskProfileEffective) completedSteps.push('risk_quiz');
  if (input.monthlyIncomeRange || input.investmentHorizon) completedSteps.push('income_horizon');
  if (hasAnyPlatform(input.platformsUsed)) completedSteps.push('platforms');

  const missing = [] as string[];
  if (!input.financialGoal) missing.push('financialGoal');
  if (!input.riskProfileEffective) missing.push('riskProfileEffective');

  return {
    currentStep: input.onboardingStep || 'goal',
    completed: missing.length === 0,
    completedAt: input.onboardingCompletedAt || null,
    homeUnlocked: missing.length === 0,
    completedSteps,
    missing
  };
}

function normalizeStep(value: unknown): string {
  const raw = normalizeText(value);
  return raw || 'goal';
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return null;
}

function normalizeRiskProfile(value: unknown): string {
  const raw = normalizeText(value).toLowerCase();
  return VALID_RISK_PROFILES.includes(raw) ? raw : '';
}

function normalizePlatforms(value: unknown): { platformIds: string[]; otherPlatforms: string[] } {
  const source = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  const platformIds = Array.isArray(source.platformIds) ? source.platformIds.filter((item) => typeof item === 'string').map((item) => String(item).trim()).filter(Boolean) : [];
  const otherPlatforms = Array.isArray(source.otherPlatforms) ? source.otherPlatforms.filter((item) => typeof item === 'string').map((item) => String(item).trim()).filter(Boolean) : [];
  return { platformIds, otherPlatforms };
}

function normalizeDisplayPreferences(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : { ghostMode: false };
}

function hasAnyPlatform(value: { platformIds: string[]; otherPlatforms: string[] }): boolean {
  return value.platformIds.length > 0 || value.otherPlatforms.length > 0;
}

function parseJson(value: unknown, fallback: any) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readCookie(cookieHeader: string, cookieName: string): string {
  const prefix = `${cookieName}=`;
  const match = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}
