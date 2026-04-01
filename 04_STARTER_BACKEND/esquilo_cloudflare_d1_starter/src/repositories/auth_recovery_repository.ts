import type { Env } from '../types/env';

export async function findRecoveryTargetByIdentifier(env: Env, identifier: string): Promise<{ id: string; email: string } | null> {
  return await env.DB.prepare(
    `SELECT id, email
     FROM users
     WHERE cpf = ? OR email = ?
     LIMIT 1`
  ).bind(identifier, identifier).first<{ id: string; email: string }>();
}

export async function createRecoveryRequest(env: Env, requestId: string, userId: string, tokenHash: string, expiresAt: string, provider: string, status: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO auth_recovery_requests (
      id, user_id, channel, status, token_hash, delivery_provider, expires_at, created_at
    ) VALUES (?, ?, 'EMAIL', ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(requestId, userId, status, tokenHash, provider, expiresAt).run();
}

export async function updateRecoveryRequestStatus(env: Env, requestId: string, status: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE auth_recovery_requests
     SET status = ?
     WHERE id = ?`
  ).bind(status, requestId).run();
}
