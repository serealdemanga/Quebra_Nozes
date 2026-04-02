import type { Env } from '../types/env';

export interface AuthUserRow {
  id: string;
  cpf: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  email_verified_at: string | null;
  failed_login_attempts: number;
  login_locked_until: string | null;
  status: string;
}

export interface SessionStateRow {
  session_id: string;
  user_id: string;
  remember_device: number;
  expires_at: string;
  revoked_at: string | null;
  email_verified_at: string | null;
  portfolio_id: string | null;
  has_context: number;
}

export async function findUserByCpfOrEmail(env: Env, cpf: string, email: string): Promise<AuthUserRow | null> {
  return await env.DB.prepare(
    `SELECT id, cpf, email, password_hash, display_name, email_verified_at, failed_login_attempts, login_locked_until, status
     FROM users
     WHERE cpf = ? OR email = ?
     LIMIT 1`
  ).bind(cpf, email).first<AuthUserRow>();
}

export async function findUserByIdentifier(env: Env, identifier: string): Promise<AuthUserRow | null> {
  return await env.DB.prepare(
    `SELECT id, cpf, email, password_hash, display_name, email_verified_at, failed_login_attempts, login_locked_until, status
     FROM users
     WHERE cpf = ? OR email = ?
     LIMIT 1`
  ).bind(identifier, identifier).first<AuthUserRow>();
}

export async function incrementFailedLogin(env: Env, user: AuthUserRow, lockUntilIso: string | null): Promise<void> {
  const nextFailedAttempts = Number(user.failed_login_attempts || 0) + 1;
  await env.DB.prepare(
    `UPDATE users
     SET failed_login_attempts = ?,
         login_locked_until = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(nextFailedAttempts, lockUntilIso, lockUntilIso ? 'LOCKED' : 'ACTIVE', user.id).run();
}

export async function resetFailedLogin(env: Env, userId: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE users
     SET failed_login_attempts = 0,
         login_locked_until = NULL,
         status = 'ACTIVE',
         last_login_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(userId).run();
}
