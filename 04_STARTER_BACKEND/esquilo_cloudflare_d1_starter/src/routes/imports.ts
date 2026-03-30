import type { Env } from '../types/env';
import { ok, readJson } from '../lib/http';

export async function postImportStart(request: Request, env: Env): Promise<Response> {
  const payload = await readJson<Record<string, unknown>>(request);
  const importId = crypto.randomUUID();

  return ok(env.API_VERSION, {
    importId,
    status: 'pending_preview',
    nextStep: `/v1/imports/${importId}/preview`,
    received: payload
  });
}

export async function getImportPreview(_request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  return ok(env.API_VERSION, {
    importId: params.importId,
    status: 'preview_ready',
    totals: {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      duplicateRows: 0
    },
    rows: []
  });
}

export async function postImportCommit(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const payload = await readJson<Record<string, unknown>>(request).catch(() => ({}));

  return ok(env.API_VERSION, {
    importId: params.importId,
    status: 'committed',
    createdSnapshotId: crypto.randomUUID(),
    affectedPositions: 0,
    options: payload
  });
}
