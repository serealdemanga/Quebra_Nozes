import type { Env } from '../types/env';
import { ok, fail, readJson } from '../lib/http';

const AUTH_COOKIE_NAME = 'esquilo_session';
const LOCKOUT_MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function postAuthRegister(request: Request, env: Env): Promise<Response> {
  const payload = await readJson<Record<string, unknown>>(request).catch(() => ({}));
  const cpf = normalizeCpf(payload.cpf);
  const email = normalizeEmail(payload.email);
  const password = stringValue(payload.password);
  const confirmPassword = stringValue(payload.confirmPassword);
  const displayName = stringValue(payload.displayName);
  const rememberDevice = Boolean(payload.rememberDevice);

  if (cpf.length !== 11) {
    return fail(env.API_VERSION, 'invalid_cpf', 'CPF inválido.', 400);
  }
  if (!looksLikeEmail(email)) {
    return fail(env.API_VERSION, 'invalid_email', 'E-mail inválido.', 400);
  }
  if (password.length < 8) {
    return fail(env.API_VERSION, 'weak_password', 'A senha deve ter pelo menos 8 caracteres.', 400);
  }
  if (password !== confirmPassword) {
    return fail(env.API_VERSION, 'password_mismatch', 'As senhas não conferem.', 400);
  }

  const userId = buildEntityId('usr');
  const portfolioId = buildEntityId('pfl');
  const sessionId = buildEntityId('ses');
  const sessionToken = buildSessionToken();

  const response = ok(env.API_VERSION, {
    user: {
      id: userId,
      cpf,
      email,
      displayName,
      emailVerified: false
    },
    portfolio: {
      id: portfolioId,
      isPrimary: true
    },
    session: {
      id: sessionId,
      rememberDevice,
      lockoutPolicy: {
        maxFailedAttempts: LOCKOUT_MAX_ATTEMPTS,
        lockMinutes: LOCKOUT_MINUTES
      }
    },
    nextStep: '/onboarding'
  }, 'auth_stub', 201);

  response.headers.append('Set-Cookie', buildSessionCookie(sessionToken, rememberDevice, env));
  return response;
}

export async function postAuthLogin(request: Request, env: Env): Promise<Response> {
  const payload = await readJson<Record<string, unknown>>(request).catch(() => ({}));
  const identifier = normalizeIdentifier(payload.identifier);
  const password = stringValue(payload.password);
  const rememberDevice = Boolean(payload.rememberDevice);

  if (!identifier) {
    return fail(env.API_VERSION, 'missing_identifier', 'Informe CPF ou e-mail.', 400);
  }
  if (!password) {
    return fail(env.API_VERSION, 'missing_password', 'Informe a senha.', 400);
  }

  const sessionToken = buildSessionToken();
  const response = ok(env.API_VERSION, {
    authenticated: true,
    userId: 'usr_stub',
    portfolioId: 'pfl_stub',
    rememberDevice,
    emailVerified: false,
    nextStep: '/onboarding',
    lockoutPolicy: {
      maxFailedAttempts: LOCKOUT_MAX_ATTEMPTS,
      lockMinutes: LOCKOUT_MINUTES
    }
  }, 'auth_stub');

  response.headers.append('Set-Cookie', buildSessionCookie(sessionToken, rememberDevice, env));
  return response;
}

export async function getAuthSession(request: Request, env: Env): Promise<Response> {
  const cookieValue = readCookie(request.headers.get('cookie') || '', AUTH_COOKIE_NAME);

  if (!cookieValue) {
    return ok(env.API_VERSION, {
      authenticated: false,
      nextStep: '/login'
    }, 'auth_stub');
  }

  return ok(env.API_VERSION, {
    authenticated: true,
    userId: 'usr_stub',
    portfolioId: 'pfl_stub',
    emailVerified: false,
    nextStep: '/onboarding'
  }, 'auth_stub');
}

export async function postAuthLogout(_request: Request, env: Env): Promise<Response> {
  const response = ok(env.API_VERSION, {
    authenticated: false,
    status: 'logged_out',
    nextStep: '/login'
  }, 'auth_stub');

  response.headers.append('Set-Cookie', clearSessionCookie(env));
  return response;
}

export async function postAuthRecover(request: Request, env: Env): Promise<Response> {
  const payload = await readJson<Record<string, unknown>>(request).catch(() => ({}));
  const identifier = normalizeIdentifier(payload.identifier);

  if (!identifier) {
    return fail(env.API_VERSION, 'missing_identifier', 'Informe CPF ou e-mail.', 400);
  }

  return ok(env.API_VERSION, {
    status: 'requested',
    channel: 'email',
    provider: 'apps_script',
    nextStep: '/login'
  }, 'recovery_email_via_apps_script');
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeCpf(value: unknown): string {
  return stringValue(value).replace(/\D+/g, '');
}

function normalizeEmail(value: unknown): string {
  return stringValue(value).toLowerCase();
}

function normalizeIdentifier(value: unknown): string {
  const raw = stringValue(value);
  const cpf = raw.replace(/\D+/g, '');
  if (cpf.length === 11) return cpf;
  return raw.toLowerCase();
}

function looksLikeEmail(value: string): boolean {
  return value.includes('@') && value.includes('.');
}

function buildEntityId(prefix: string): string {
  const time = Date.now().toString(36).padStart(10, '0');
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 16).toLowerCase();
  return `${prefix}_${time}${random}`;
}

function buildSessionToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

function buildSessionCookie(token: string, rememberDevice: boolean, env: Env): string {
  const maxAge = rememberDevice ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
  const secure = env.APP_ENV === 'local' ? '' : '; Secure';
  return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax${secure}; Max-Age=${maxAge}`;
}

function clearSessionCookie(env: Env): string {
  const secure = env.APP_ENV === 'local' ? '' : '; Secure';
  return `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax${secure}; Max-Age=0`;
}

function readCookie(cookieHeader: string, cookieName: string): string {
  const prefix = `${cookieName}=`;
  const parts = cookieHeader.split(';').map((item) => item.trim());
  const match = parts.find((item) => item.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}
