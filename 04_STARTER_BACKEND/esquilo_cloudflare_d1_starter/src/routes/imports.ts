import type { Env } from '../types/env';
import { startManualImport, getManualImportPreview, commitManualImport } from '../lib/import_service';

export async function postImportStart(request: Request, env: Env): Promise<Response> {
  return await startManualImport(request, env);
}

export async function getImportPreview(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  return await getManualImportPreview(request, env, params);
}

export async function postImportCommit(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  return await commitManualImport(request, env, params);
}
