import type { Env } from '../types/env';
import { startImport, getManualImportPreview, commitManualImport, downloadCustomTemplate, downloadB3Template } from '../lib/import_service';

export async function postImportStart(request: Request, env: Env): Promise<Response> {
  return await startImport(request, env);
}

export async function getImportPreview(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  return await getManualImportPreview(request, env, params);
}

export async function postImportCommit(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  return await commitManualImport(request, env, params);
}

export async function getCustomTemplateDownload(request: Request): Promise<Response> {
  return await downloadCustomTemplate(request);
}

export async function getB3TemplateDownload(request: Request): Promise<Response> {
  return await downloadB3Template(request);
}
