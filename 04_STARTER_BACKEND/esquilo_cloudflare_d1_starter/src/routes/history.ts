import type { Env } from '../types/env';
import { getHistorySnapshotsData } from '../lib/history_service';

export async function getSnapshots(request: Request, env: Env): Promise<Response> {
  return await getHistorySnapshotsData(request, env);
}
