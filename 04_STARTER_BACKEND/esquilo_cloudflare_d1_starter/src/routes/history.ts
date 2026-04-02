import type { Env } from '../types/env';
import { getHistorySnapshotsData } from '../lib/history_service';
import { getImportsCenterData } from '../lib/imports_center_service';

export async function getSnapshots(request: Request, env: Env): Promise<Response> {
  return await getHistorySnapshotsData(request, env);
}

export async function getImportsCenter(request: Request, env: Env): Promise<Response> {
  return await getImportsCenterData(request, env);
}
